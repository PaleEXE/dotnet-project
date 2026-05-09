from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from models import ChatRequest, ChatResponse, Item
from rag_engine import RAGEngine
from data_loader import load_data_from_csv
import os

# Initialize components
engine = RAGEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load data on startup
    csv_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
    items = load_data_from_csv(csv_path)
    if items:
        engine.build_index(items)
        print("Application started and data indexed successfully.")
    else:
        print("Warning: No data loaded. RAG might not return results.")
    yield
    # Cleanup on shutdown
    print("Shutting down application...")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan, title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all. Change to ["http://localhost:5173", "http://localhost:3000"] for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Retrieve similar items
    top_items_raw = engine.search(request.query, top_k=3)
    
    retrieved_items = [item for item, score in top_items_raw]
    
    # 2. Format history
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
    
    # 3. Generate response using LLM
    llm_reply = engine.generate_response(request.query, retrieved_items, history_dicts)
    
    # 4. Map raw dicts to Pydantic Item models
    suggested_items = []
    for raw_item, score in top_items_raw:
        suggested_items.append(Item(
            id=raw_item.get('id', ''),
            title=raw_item.get('title', ''),
            description=raw_item.get('description', ''),
            tags=raw_item.get('tags', ''),
            category=raw_item.get('category', ''),
            score=score
        ))

    return ChatResponse(
        reply=llm_reply,
        suggested_items=suggested_items
    )

@app.post("/api/index")
async def reindex_data():
    """Endpoint to manually trigger re-indexing if CSV is updated."""
    csv_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
    items = load_data_from_csv(csv_path)
    if not items:
        raise HTTPException(status_code=400, detail="No data found to index.")
        
    engine.build_index(items)
    return {"message": f"Successfully re-indexed {len(items)} items."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
