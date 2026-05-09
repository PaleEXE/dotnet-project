from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlmodel import select
from db.database import get_session
from db.models import User, Organization, Task, TaskVolunteer, VolunteerHour, Tag
from schemas.admin import RoleUpdateRequest, TaskStatusRequest, VolunteerStatusRequest

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_session)):
    user_count = (await db.execute(select(func.count(User.id)))).scalar()
    org_count = (await db.execute(select(func.count(Organization.id)))).scalar()
    task_count = (await db.execute(select(func.count(Task.id)))).scalar()
    volunteer_count = (await db.execute(select(func.count(TaskVolunteer.id)))).scalar()
    total_hours = (await db.execute(select(func.sum(VolunteerHour.hours_worked)))).scalar() or 0
    tag_count = (await db.execute(select(func.count(Tag.id)))).scalar()

    return {
        "user_count": user_count,
        "org_count": org_count,
        "task_count": task_count,
        "volunteer_count": volunteer_count,
        "total_hours": total_hours,
        "tag_count": tag_count
    }

@router.put("/users/{id}/block")
async def block_user(id: int, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, id)
    if not user: raise HTTPException(status_code=404, detail={"message": "User not found"})
    user.is_blocked = not user.is_blocked
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "is_blocked": user.is_blocked}

@router.put("/users/{id}/role")
async def update_user_role(id: int, req: RoleUpdateRequest, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, id)
    if not user: raise HTTPException(status_code=404, detail={"message": "User not found"})
    if req.role not in ["student", "admin"]:
        raise HTTPException(status_code=400, detail={"message": "Role must be 'student' or 'admin'"})
    user.role = req.role
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "role": user.role}

@router.delete("/users/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(id: int, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, id)
    if not user: raise HTTPException(status_code=404, detail={"message": "User not found"})
    if user.id == 1: raise HTTPException(status_code=400, detail={"message": "Cannot delete the primary admin"})
    await db.delete(user)
    await db.commit()
    return None

@router.put("/organizations/{id}/toggle-approval")
async def toggle_org_approval(id: int, db: AsyncSession = Depends(get_session)):
    org = await db.get(Organization, id)
    if not org: raise HTTPException(status_code=404, detail={"message": "Organization not found"})
    org.is_approved = not org.is_approved
    await db.commit()
    await db.refresh(org)
    return {"id": org.id, "is_approved": org.is_approved}

@router.delete("/organizations/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_org(id: int, db: AsyncSession = Depends(get_session)):
    org = await db.get(Organization, id)
    if not org: raise HTTPException(status_code=404, detail={"message": "Organization not found"})
    await db.delete(org)
    await db.commit()
    return None

@router.put("/tasks/{id}/status")
async def update_task_status(id: int, req: TaskStatusRequest, db: AsyncSession = Depends(get_session)):
    task = await db.get(Task, id)
    if not task: raise HTTPException(status_code=404, detail={"message": "Task not found"})
    task.status = req.status
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: int, db: AsyncSession = Depends(get_session)):
    task = await db.get(Task, id)
    if not task: raise HTTPException(status_code=404, detail={"message": "Task not found"})
    await db.delete(task)
    await db.commit()
    return None

@router.put("/volunteers/{id}/status")
async def update_volunteer_status(id: int, req: VolunteerStatusRequest, db: AsyncSession = Depends(get_session)):
    volunteer = await db.get(TaskVolunteer, id)
    if not volunteer: raise HTTPException(status_code=404, detail={"message": "Volunteer record not found"})
    volunteer.status = req.status
    await db.commit()
    await db.refresh(volunteer)
    return volunteer

@router.delete("/volunteers/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_volunteer(id: int, db: AsyncSession = Depends(get_session)):
    volunteer = await db.get(TaskVolunteer, id)
    if not volunteer: raise HTTPException(status_code=404, detail={"message": "Volunteer record not found"})
    await db.delete(volunteer)
    await db.commit()
    return None
