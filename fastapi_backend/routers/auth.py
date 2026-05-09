from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from db.database import get_session
from db.models import User, Organization
from schemas.auth import UserRegisterRequest, OrgRegisterRequest, LoginRequest, ForgotPasswordRequest
from core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_session)):
    if not req.email: raise HTTPException(status_code=400, detail={"message": "Email is required"})
    if not req.password: raise HTTPException(status_code=400, detail={"message": "Password is required"})
    if not req.full_name: raise HTTPException(status_code=400, detail={"message": "FullName is required"})
    if req.role != "student": raise HTTPException(status_code=400, detail={"message": "You can only register as a student"})

    user_exists = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    org_exists = (await db.execute(select(Organization).where(Organization.email == req.email))).scalar_one_or_none()
    
    if user_exists or org_exists:
        raise HTTPException(status_code=400, detail={"message": "Email already registered"})

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        full_name=req.full_name,
        phone_number=req.phone_number,
        role=req.role,
        university_id=req.university_id,
        taking_volunteering_course=req.taking_volunteering_course
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at
    }

@router.post("/register/org", status_code=status.HTTP_201_CREATED)
async def register_org(req: OrgRegisterRequest, db: AsyncSession = Depends(get_session)):
    if not req.email: raise HTTPException(status_code=400, detail={"message": "Email is required"})
    if not req.password: raise HTTPException(status_code=400, detail={"message": "Password is required"})
    if not req.name: raise HTTPException(status_code=400, detail={"message": "Name is required"})

    user_exists = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    org_exists = (await db.execute(select(Organization).where(Organization.email == req.email))).scalar_one_or_none()
    
    if user_exists or org_exists:
        raise HTTPException(status_code=400, detail={"message": "Email already registered"})

    org = Organization(
        email=req.email,
        password_hash=get_password_hash(req.password),
        name=req.name,
        phone_number=req.phone_number,
        is_approved=True
    )

    db.add(org)
    await db.commit()
    await db.refresh(org)

    return {
        "id": org.id,
        "email": org.email,
        "role": "organization",
        "created_at": org.created_at
    }

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_session)):
    if not req.email: raise HTTPException(status_code=400, detail={"message": "Email is required"})
    if not req.password: raise HTTPException(status_code=400, detail={"message": "Password is required"})

    # Try user
    user = (await db.execute(select(User).where(User.email == req.email))).scalar_one_or_none()
    if user and verify_password(req.password, user.password_hash):
        if user.is_blocked:
            raise HTTPException(status_code=403, detail={"message": "Your account has been blocked. Contact an administrator."})
        
        token = create_access_token(str(user.id), user.role, user.email, user.full_name)
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
                "full_name": user.full_name,
                "profile_picture_url": user.profile_picture_url,
                "is_blocked": user.is_blocked
            }
        }

    # Try org
    org = (await db.execute(select(Organization).where(Organization.email == req.email))).scalar_one_or_none()
    if org and verify_password(req.password, org.password_hash):
        if not org.is_approved:
            raise HTTPException(status_code=403, detail={"message": "Your organization account is pending admin approval."})
            
        token = create_access_token(str(org.id), "organization", org.email, org.name)
        return {
            "token": token,
            "user": {
                "id": org.id,
                "email": org.email,
                "role": "organization",
                "created_at": org.created_at,
                "name": org.name
            }
        }

    raise HTTPException(status_code=401, detail={"message": "Invalid email or password"})

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_session)):
    if not req.email: raise HTTPException(status_code=400, detail={"message": "Email is required"})
    if not req.phone_number: raise HTTPException(status_code=400, detail={"message": "Phone Number is required"})
    if not req.university_id: raise HTTPException(status_code=400, detail={"message": "University ID is required"})
    if not req.new_password: raise HTTPException(status_code=400, detail={"message": "New password is required"})

    user = (await db.execute(
        select(User).where(
            User.email == req.email,
            User.phone_number == req.phone_number,
            User.university_id == req.university_id
        )
    )).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail={"message": "No matching user found with the provided details"})

    user.password_hash = get_password_hash(req.new_password)
    await db.commit()

    return {"message": "Password reset successfully. You can now login."}
