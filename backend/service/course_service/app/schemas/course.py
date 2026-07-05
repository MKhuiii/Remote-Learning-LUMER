from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: int = 0

class CourseCreate(CourseBase):
    curriculum_id: UUID
    instructor_id: UUID
    course_type: str
    status_id: str

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    status_id: Optional[str] = None

class CourseRead(CourseBase):
    course_id: UUID
    created_at: date
    status_id: str
