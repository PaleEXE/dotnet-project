import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from pydantic import BaseModel
from typing import Optional
from db.database import get_session
from db.models import Tag, TaskImage, OrganizationReview, Organization, Task

router = APIRouter(tags=["Misc"])

class TagCreateRequest(BaseModel):
    name: str

class ReviewCreateRequest(BaseModel):
    user_id: int
    rating: int
    comment: Optional[str] = None

@router.get("/tags")
async def get_tags(db: AsyncSession = Depends(get_session)):
    return (await db.execute(select(Tag))).scalars().all()

@router.post("/tags", status_code=status.HTTP_201_CREATED)
async def create_tag(req: TagCreateRequest, db: AsyncSession = Depends(get_session)):
    if not req.name: raise HTTPException(status_code=400, detail={"message": "Name is required"})
    if (await db.execute(select(Tag).where(Tag.name == req.name))).scalar_one_or_none():
        raise HTTPException(status_code=400, detail={"message": "Tag already exists"})
    
    tag = Tag(name=req.name)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file: raise HTTPException(status_code=400, detail={"message": "File is required"})
    
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "images", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{os.urandom(8).hex()}_{file.filename}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{filename}"}

class TaskImageCreateRequest(BaseModel):
    image_url: str

@router.post("/tasks/{task_id}/images", status_code=status.HTTP_201_CREATED)
async def upload_task_image(task_id: int, req: TaskImageCreateRequest, db: AsyncSession = Depends(get_session)):
    if not req.image_url: raise HTTPException(status_code=400, detail={"message": "ImageUrl is required"})
    
    task = await db.get(Task, task_id)
    if not task: raise HTTPException(status_code=404, detail={"message": "Task not found"})

    img = TaskImage(task_id=task_id, image_url=req.image_url)
    db.add(img)
    await db.commit()
    await db.refresh(img)
    return img

@router.delete("/tasks/images/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_image(id: int, db: AsyncSession = Depends(get_session)):
    img = await db.get(TaskImage, id)
    if not img: raise HTTPException(status_code=404, detail={"message": "TaskImage not found"})
    await db.delete(img)
    await db.commit()
    return None

@router.get("/organizations/{org_id}/reviews")
async def get_org_reviews(org_id: int, db: AsyncSession = Depends(get_session)):
    query = select(OrganizationReview).where(OrganizationReview.organization_id == org_id).options(selectinload(OrganizationReview.user))
    return (await db.execute(query)).scalars().all()

@router.post("/organizations/{org_id}/reviews", status_code=status.HTTP_201_CREATED)
async def create_org_review(org_id: int, req: ReviewCreateRequest, db: AsyncSession = Depends(get_session)):
    if req.user_id <= 0: raise HTTPException(status_code=400, detail={"message": "user_id is required"})
    if req.rating < 1 or req.rating > 5: raise HTTPException(status_code=400, detail={"message": "Rating must be between 1 and 5"})
    
    org = await db.get(Organization, org_id)
    if not org: raise HTTPException(status_code=404, detail={"message": "Organization not found"})

    existing = (await db.execute(select(OrganizationReview).where(OrganizationReview.organization_id == org_id, OrganizationReview.user_id == req.user_id))).scalar_one_or_none()
    if existing: raise HTTPException(status_code=400, detail={"message": "User has already reviewed this organization"})

    review = OrganizationReview(organization_id=org_id, user_id=req.user_id, rating=req.rating, comment=req.comment)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review

@router.delete("/reviews/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(id: int, db: AsyncSession = Depends(get_session)):
    review = await db.get(OrganizationReview, id)
    if not review: raise HTTPException(status_code=404, detail={"message": "Review not found"})
    await db.delete(review)
    await db.commit()
    return None
