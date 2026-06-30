from pydantic import BaseModel
from uuid import UUID

class ProfileUpdate(BaseModel):
    firstname: str | None = None
    lastname: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

    
class ProfileCreate(BaseModel):
    firstname: str
    lastname: str
    bio: str | None = None
    avatar_url: str | None = None