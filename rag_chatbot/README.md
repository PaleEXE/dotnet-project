# RAG Chatbot Service

This is a Retrieval-Augmented Generation (RAG) chatbot designed to recommend items (e.g., volunteer opportunities, courses, products) to users based on their preferences.

It uses:
- **FastAPI**: For the REST API backend.
- **FAISS**: For the lightweight, in-memory vector database.
- **Sentence-Transformers**: To generate embeddings locally using `all-MiniLM-L6-v2`.
- **Hugging Face Inference API**: To generate natural language responses.

## Requirements

- Python 3.9+
- A free Hugging Face token (optional but recommended for generation).

## Setup Instructions

1. **Navigate to the directory**:
   ```bash
   cd rag_chatbot
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and configure your Hugging Face API Token:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set `HF_TOKEN=your_token_here`.*

5. **Run the Application**:
   ```bash
   python main.py
   ```
   *Alternatively, using uvicorn directly:*
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## API Endpoints

### `POST /api/chat`
Ask the chatbot for recommendations.

**Request Body**:
```json
{
  "query": "I want to help with environmental conservation on weekends.",
  "history": []
}
```

**Response Body**:
```json
{
  "reply": "Based on your interest in environmental conservation, I highly recommend the Park Cleanup Drive or the Beach Cleanup...",
  "suggested_items": [
    {
      "id": "1",
      "title": "Park Cleanup Drive",
      "description": "Help us clean up the city park this weekend. Equipment provided.",
      "tags": "environment;outdoor",
      "category": "Environment",
      "score": 0.45
    }
  ]
}
```

### `POST /api/index`
Forces a re-indexing of `sample_data.csv` without restarting the server.

## Modifying Data
Simply edit `sample_data.csv` to include your own items, ensuring you keep the `id,title,description,tags,category` columns. Then, restart the server or hit the `/api/index` endpoint.
