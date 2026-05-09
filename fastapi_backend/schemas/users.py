from pydantic import BaseModel
from typing import Optional

class UserUpdateRequest(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    role: str = "student"
    university_id: Optional[str] = None
    taking_volunteering_course: bool = False
    profile_picture_url: Optional[str] = None
