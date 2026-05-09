from pydantic import BaseModel
from typing import Optional

class OrganizationUpdateRequest(BaseModel):
    name: str
    phone_number: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    description: Optional[str] = None
