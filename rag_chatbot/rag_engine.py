import os
import faiss
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "mistralai/Mistral-7B-Instruct-v0.3")
EMBEDDING_MODEL_ID = os.getenv("EMBEDDING_MODEL_ID", "all-MiniLM-L6-v2")

class RAGEngine:
    def __init__(self):
        print(f"Loading embedding model: {EMBEDDING_MODEL_ID}...")
        self.encoder = SentenceTransformer(EMBEDDING_MODEL_ID)
        self.embedding_dim = self.encoder.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.metadata: List[Dict[str, Any]] = []

    def build_index(self, items: List[Dict[str, Any]]):
        """
        Build FAISS index from a list of item dictionaries.
        Expected keys: id, title, description, tags, category
        """
        if not items:
            return

        self.metadata = items
        
        # Create text representations for embedding
        texts_to_embed = []
        for item in items:
            text = f"{item['title']}. {item['description']} Tags: {item['tags']} Category: {item['category']}"
            texts_to_embed.append(text)
            
        print("Generating embeddings for dataset...")
        embeddings = self.encoder.encode(texts_to_embed, show_progress_bar=True)
        
        # Convert to float32 for FAISS
        embeddings = np.array(embeddings).astype('float32')
        
        # Reset index
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.index.add(embeddings)
        print(f"Indexed {self.index.ntotal} items in FAISS.")

    def search(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Search the FAISS index for the most relevant items."""
        if self.index.ntotal == 0:
            return []
            
        query_embedding = self.encoder.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')
        
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.metadata):
                item = self.metadata[idx].copy()
                score = distances[0][i]
                item['score'] = float(score)
                results.append((item, float(score)))
                
        return results

    def generate_response(self, query: str, retrieved_items: List[Dict[str, Any]], history: List[Dict[str, str]] = None) -> str:
        """Generate a response using the Hugging Face API."""
        if not history:
            history = []

        context_text = ""
        if retrieved_items:
            context_text = "Here are some relevant items you might suggest to the user:\n"
            for idx, item in enumerate(retrieved_items):
                context_text += f"[{idx+1}] Title: {item['title']}\nDescription: {item['description']}\nTags: {item['tags']}\nCategory: {item['category']}\n\n"
        else:
            context_text = "I couldn't find any specific items matching the user's query."

        # Construct prompt
        system_prompt = (
            "You are a helpful AI assistant specialized in recommending opportunities and items to users. "
            "Use the provided context to suggest the most relevant items. Be polite, concise, and explain why "
            "they fit the user's request. Do not make up items that are not in the context."
        )

        prompt = f"<s>[INST] {system_prompt}\n\nContext:\n{context_text}\n\n"
        
        # Append history if any (simple implementation)
        for msg in history[-3:]: # Only use last 3 messages for context size
            if msg['role'] == 'user':
                prompt += f"User: {msg['content']}\n"
            else:
                prompt += f"Assistant: {msg['content']}\n"
                
        prompt += f"User: {query}\nAssistant: [/INST]"

        # Call HF API
        headers = {
            "Authorization": f"Bearer {HF_TOKEN}" if HF_TOKEN else "",
            "Content-Type": "application/json"
        }
        
        API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
        
        # If no token, maybe it's a free public request (might hit rate limits)
        if not HF_TOKEN:
            print("Warning: No HF_TOKEN provided. API calls may fail or hit rate limits.")

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.7,
                "return_full_text": False
            }
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list) and len(data) > 0 and 'generated_text' in data[0]:
                return data[0]['generated_text'].strip()
            else:
                return "Error parsing response from LLM."
        except Exception as e:
            print(f"Error calling Hugging Face API: {e}")
            # Fallback response
            fallback = "Based on your preferences, I recommend the following:\n"
            for item in retrieved_items:
                fallback += f"- {item['title']}: {item['description']}\n"
            return fallback
