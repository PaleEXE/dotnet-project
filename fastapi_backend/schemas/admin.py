from pydantic import BaseModel

class RoleUpdateRequest(BaseModel):
    role: str

class TaskStatusRequest(BaseModel):
    status: str

class VolunteerStatusRequest(BaseModel):
    status: str
