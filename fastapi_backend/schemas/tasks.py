from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskCreateRequest(BaseModel):
    organization_id: int
    title: str
    description: Optional[str] = None
    max_volunteers: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None

class TaskUpdateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    max_volunteers: Optional[int] = None
    status: str = "open"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
