from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from db.database import get_session
from db.models import User
from schemas.users import UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
async def get_users(db: AsyncSession = Depends(get_session)):
    users = (await db.execute(select(User))).scalars().all()
    return users

@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"message": "User not found"})
    return user

@router.put("/{user_id}")
async def update_user(user_id: int, input_data: UserUpdateRequest, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"message": "User not found"})

    user.full_name = input_data.full_name
    user.phone_number = input_data.phone_number
    user.role = input_data.role
    user.university_id = input_data.university_id
    user.taking_volunteering_course = input_data.taking_volunteering_course
    user.profile_picture_url = input_data.profile_picture_url

    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"message": "User not found"})

    await db.delete(user)
    await db.commit()
    return None
