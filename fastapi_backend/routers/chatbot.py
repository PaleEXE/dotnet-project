from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from db.database import get_session
from db.models import Task, Organization, TaskTag, Tag
from schemas.chatbot import ChatRequest, ChatResponse, Item
from core.rag_engine import RAGEngine

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Global engine instance
rag_engine = RAGEngine()

async def load_tasks_from_db(session: AsyncSession) -> List[dict]:
    # Fetch all open tasks with their organization and tags
    stmt = (
        select(Task)
        .where(Task.status == "open")
        .options(
            selectinload(Task.organization),
            selectinload(Task.task_tags).selectinload(TaskTag.tag)
        )
    )
    result = await session.execute(stmt)
    tasks = result.scalars().all()
    
    items = []
    for task in tasks:
        # Extract tags
        tag_names = [tt.tag.name for tt in task.task_tags if tt.tag]
        tags_str = ", ".join(tag_names)
        
        # Extract organization (category)
        org_name = task.organization.name if task.organization else "Uncategorized"
        
        item = {
            "id": str(task.id),
            "title": task.title,
            "description": task.description or "",
            "tags": tags_str,
            "category": org_name
        }
        items.append(item)
        
    return items

@router.post("/index")
async def index_data(session: AsyncSession = Depends(get_session)):
    """Manually trigger re-indexing of tasks from the database."""
    items = await load_tasks_from_db(session)
    if not items:
        return {"message": "No open tasks found to index."}
        
    rag_engine.build_index(items)
    return {"message": f"Successfully re-indexed {len(items)} tasks."}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Retrieve similar items
    top_items_raw = rag_engine.search(request.query, top_k=3)
    
    retrieved_items = [item for item, score in top_items_raw]
    
    # 2. Format history
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
    
    # 3. Generate response using LLM
    llm_reply = rag_engine.generate_response(request.query, retrieved_items, history_dicts)
    
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
