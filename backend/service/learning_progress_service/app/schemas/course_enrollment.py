from pydantic import BaseModel
from uuid import UUID

class CourseEnrollmentCreate(BaseModel):
    user_id: UUID
    course_id: UUID

class CourseEnrollmentUpdate(BaseModel):
    current_overall_progress: float | None = None
    is_completed: bool | None = None

class CourseInProgress(BaseModel):
    course_title: str
    current_overall_progress: float 
