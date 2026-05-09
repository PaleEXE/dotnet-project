from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from pydantic import BaseModel
from typing import Optional
from db.database import get_session
from db.models import VolunteerHour, Task, TaskVolunteer

router = APIRouter(prefix="/hours", tags=["Hours"])

class HourCreateRequest(BaseModel):
    task_id: int
    user_id: int
    hours_worked: float
    notes: Optional[str] = None

class OrgLogHoursRequest(BaseModel):
    organization_id: int
    task_id: int
    user_id: int
    hours_worked: float
    notes: Optional[str] = None

class HourUpdateRequest(BaseModel):
    hours_worked: float
    notes: Optional[str] = None

@router.get("")
async def get_hours(db: AsyncSession = Depends(get_session)):
    query = select(VolunteerHour).options(selectinload(VolunteerHour.task), selectinload(VolunteerHour.user))
    return (await db.execute(query)).scalars().all()

@router.get("/{id}")
async def get_hour(id: int, db: AsyncSession = Depends(get_session)):
    query = select(VolunteerHour).where(VolunteerHour.id == id).options(selectinload(VolunteerHour.task), selectinload(VolunteerHour.user))
    hour = (await db.execute(query)).scalar_one_or_none()
    if not hour: raise HTTPException(status_code=404, detail={"message": "VolunteerHour not found"})
    return hour

@router.get("/task/{task_id}")
async def get_task_hours(task_id: int, db: AsyncSession = Depends(get_session)):
    query = select(VolunteerHour).where(VolunteerHour.task_id == task_id).options(selectinload(VolunteerHour.user))
    return (await db.execute(query)).scalars().all()

@router.get("/user/{user_id}")
async def get_user_hours(user_id: int, db: AsyncSession = Depends(get_session)):
    query = select(VolunteerHour).where(VolunteerHour.user_id == user_id).options(selectinload(VolunteerHour.task))
    return (await db.execute(query)).scalars().all()

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_hour(req: HourCreateRequest, db: AsyncSession = Depends(get_session)):
    if req.task_id <= 0: raise HTTPException(status_code=400, detail={"message": "task_id is required"})
    if req.user_id <= 0: raise HTTPException(status_code=400, detail={"message": "user_id is required"})
    if req.hours_worked <= 0: raise HTTPException(status_code=400, detail={"message": "hours_worked must be greater than 0"})

    hour = VolunteerHour(task_id=req.task_id, user_id=req.user_id, hours_worked=req.hours_worked, notes=req.notes)
    db.add(hour)
    await db.commit()
    await db.refresh(hour)
    return hour

@router.post("/org", status_code=status.HTTP_201_CREATED)
async def org_log_hours(req: OrgLogHoursRequest, db: AsyncSession = Depends(get_session)):
    if req.organization_id <= 0: raise HTTPException(status_code=400, detail={"message": "organization_id is required"})
    if req.task_id <= 0: raise HTTPException(status_code=400, detail={"message": "task_id is required"})
    if req.user_id <= 0: raise HTTPException(status_code=400, detail={"message": "user_id is required"})
    if req.hours_worked <= 0: raise HTTPException(status_code=400, detail={"message": "hours_worked must be greater than 0"})

    task = await db.get(Task, req.task_id)
    if not task: raise HTTPException(status_code=404, detail={"message": "Task not found"})
    if task.organization_id != req.organization_id:
        raise HTTPException(status_code=403, detail={"message": "You can only log hours for your own tasks"})

    volunteer = (await db.execute(select(TaskVolunteer).where(TaskVolunteer.task_id == req.task_id, TaskVolunteer.user_id == req.user_id, TaskVolunteer.status == "approved"))).scalar_one_or_none()
    if not volunteer:
        raise HTTPException(status_code=400, detail={"message": "User is not an approved volunteer on this task"})

    hour = VolunteerHour(task_id=req.task_id, user_id=req.user_id, hours_worked=req.hours_worked, notes=req.notes)
    db.add(hour)
    await db.commit()
    await db.refresh(hour)
    return hour

@router.put("/{id}")
async def update_hour(id: int, req: HourUpdateRequest, db: AsyncSession = Depends(get_session)):
    hour = await db.get(VolunteerHour, id)
    if not hour: raise HTTPException(status_code=404, detail={"message": "VolunteerHour not found"})
    hour.hours_worked = req.hours_worked
    hour.notes = req.notes
    await db.commit()
    await db.refresh(hour)
    return hour

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hour(id: int, db: AsyncSession = Depends(get_session)):
    hour = await db.get(VolunteerHour, id)
    if not hour: raise HTTPException(status_code=404, detail={"message": "VolunteerHour not found"})
    await db.delete(hour)
    await db.commit()
    return None
