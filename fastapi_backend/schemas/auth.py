from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"
    phone_number: Optional[str] = None
    university_id: Optional[str] = None
    taking_volunteering_course: bool = False

class OrgRegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone_number: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str
    phone_number: str
    university_id: str
    new_password: str
