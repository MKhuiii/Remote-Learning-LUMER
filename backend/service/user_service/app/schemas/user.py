from pydantic import BaseModel, EmailStr, model_validator
from pydantic_core import PydanticCustomError
from typing import Self
from uuid import UUID
from datetime import date

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    role_id: int | None = None
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    birthdate: date | None = None
    status_id: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    user_id: UUID
    role_name: str
    username: str
    email: EmailStr
    status_id: str

class UserListQuery(BaseModel):
    skip: int
    limit: int

    # Bộ lọc lấy theo status hoặc role của người dùng
    status_id: str | None = None
    role_id: int | None = None
    
