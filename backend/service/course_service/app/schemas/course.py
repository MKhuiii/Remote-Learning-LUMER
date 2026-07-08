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
    title: str | None = None
    description: str | None = None
    price: int | None = None
    status_id: str | None = None

class CourseRead(CourseBase):
    course_id: UUID
    created_at: date
    status_id: str
