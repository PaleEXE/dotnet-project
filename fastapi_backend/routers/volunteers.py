from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from pydantic import BaseModel
from db.database import get_session
from db.models import TaskVolunteer

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])

class VolunteerCreateRequest(BaseModel):
    task_id: int
    user_id: int

class VolunteerUpdateRequest(BaseModel):
    status: str

@router.get("")
async def get_volunteers(db: AsyncSession = Depends(get_session)):
    query = select(TaskVolunteer).options(selectinload(TaskVolunteer.task), selectinload(TaskVolunteer.user))
    return (await db.execute(query)).scalars().all()

@router.get("/{id}")
async def get_volunteer(id: int, db: AsyncSession = Depends(get_session)):
    query = select(TaskVolunteer).where(TaskVolunteer.id == id).options(selectinload(TaskVolunteer.task), selectinload(TaskVolunteer.user))
    volunteer = (await db.execute(query)).scalar_one_or_none()
    if not volunteer: raise HTTPException(status_code=404, detail={"message": "Volunteer record not found"})
    return volunteer

@router.get("/task/{task_id}")
async def get_task_volunteers(task_id: int, db: AsyncSession = Depends(get_session)):
    query = select(TaskVolunteer).where(TaskVolunteer.task_id == task_id).options(selectinload(TaskVolunteer.user))
    return (await db.execute(query)).scalars().all()

@router.get("/user/{user_id}")
async def get_user_volunteers(user_id: int, db: AsyncSession = Depends(get_session)):
    query = select(TaskVolunteer).where(TaskVolunteer.user_id == user_id).options(selectinload(TaskVolunteer.task))
    return (await db.execute(query)).scalars().all()

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_volunteer(req: VolunteerCreateRequest, db: AsyncSession = Depends(get_session)):
    if req.task_id <= 0: raise HTTPException(status_code=400, detail={"message": "task_id is required"})
    if req.user_id <= 0: raise HTTPException(status_code=400, detail={"message": "user_id is required"})
    
    volunteer = TaskVolunteer(task_id=req.task_id, user_id=req.user_id)
    db.add(volunteer)
    await db.commit()
    await db.refresh(volunteer)
    return volunteer

@router.put("/{id}")
async def update_volunteer(id: int, req: VolunteerUpdateRequest, db: AsyncSession = Depends(get_session)):
    volunteer = await db.get(TaskVolunteer, id)
    if not volunteer: raise HTTPException(status_code=404, detail={"message": "Volunteer record not found"})
    volunteer.status = req.status
    await db.commit()
    await db.refresh(volunteer)
    return volunteer

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_volunteer(id: int, db: AsyncSession = Depends(get_session)):
    volunteer = await db.get(TaskVolunteer, id)
    if not volunteer: raise HTTPException(status_code=404, detail={"message": "Volunteer record not found"})
    await db.delete(volunteer)
    await db.commit()
    return None
