from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from db.database import get_session
from db.models import Task, Tag, TaskTag, Organization
from schemas.tasks import TaskCreateRequest, TaskUpdateRequest

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("")
async def get_tasks(db: AsyncSession = Depends(get_session)):
    query = select(Task).options(
        selectinload(Task.organization),
        selectinload(Task.task_tags).selectinload(TaskTag.tag),
        selectinload(Task.task_images)
    )
    tasks = (await db.execute(query)).scalars().all()
    return tasks

@router.get("/open")
async def get_open_tasks(db: AsyncSession = Depends(get_session)):
    query = select(Task).where(Task.status == "open").options(
        selectinload(Task.organization),
        selectinload(Task.task_tags).selectinload(TaskTag.tag),
        selectinload(Task.task_images)
    )
    tasks = (await db.execute(query)).scalars().all()
    return tasks

@router.get("/{task_id}")
async def get_task(task_id: int, db: AsyncSession = Depends(get_session)):
    query = select(Task).where(Task.id == task_id).options(
        selectinload(Task.organization),
        selectinload(Task.task_tags).selectinload(TaskTag.tag),
        selectinload(Task.task_images)
    )
    task = (await db.execute(query)).scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail={"message": "Task not found"})
    return task

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(req: TaskCreateRequest, db: AsyncSession = Depends(get_session)):
    if not req.title:
        raise HTTPException(status_code=400, detail={"message": "Title is required"})
    if req.organization_id <= 0:
        raise HTTPException(status_code=400, detail={"message": "OrganizationId is required"})

    if req.start_date and req.end_date and req.start_date >= req.end_date:
        raise HTTPException(status_code=400, detail={"message": "Start date must be before end date"})

    task = Task(
        organization_id=req.organization_id,
        title=req.title,
        description=req.description,
        max_volunteers=req.max_volunteers,
        start_date=req.start_date,
        end_date=req.end_date
    )

    db.add(task)
    await db.flush()

    if req.tag_ids:
        for tag_id in req.tag_ids:
            tag = await db.get(Tag, tag_id)
            if tag:
                db.add(TaskTag(task_id=task.id, tag_id=tag_id))
    
    await db.commit()
    await db.refresh(task)
    return task

@router.put("/{task_id}")
async def update_task(task_id: int, req: TaskUpdateRequest, db: AsyncSession = Depends(get_session)):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail={"message": "Task not found"})

    if req.start_date and req.end_date and req.start_date >= req.end_date:
        raise HTTPException(status_code=400, detail={"message": "Start date must be before end date"})

    task.title = req.title
    task.description = req.description
    task.max_volunteers = req.max_volunteers
    task.status = req.status
    task.start_date = req.start_date
    task.end_date = req.end_date

    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, db: AsyncSession = Depends(get_session)):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail={"message": "Task not found"})

    await db.delete(task)
    await db.commit()
    return None
