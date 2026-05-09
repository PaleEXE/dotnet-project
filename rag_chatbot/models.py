from pydantic import BaseModel
from typing import List, Optional, Dict

class Message(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[Message]] = []

class Item(BaseModel):
    id: str
    title: str
    description: str
    tags: str
    category: str
    score: Optional[float] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_items: List[Item]
