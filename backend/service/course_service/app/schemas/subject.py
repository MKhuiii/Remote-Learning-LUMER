from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class SubjectBase(BaseModel):
    title: str
    order_index: int = 1

class SubjectCreate(SubjectBase):
    description: str
    course_id: UUID

class SubjectUpdate(BaseModel):
    title: Optional[str] = None
    order_index: Optional[int] = None

class SubjectRead(SubjectBase):
    subject_id: UUID
    course_id: UUID

class InstructorStatictisSubject(BaseModel):
    total_subjects: int
    total_modules: int
    total_active_subject: int
    total_developing_subject: int

class GeneralInfoInstructorSubject(BaseModel):
    subject_id: UUID
    title: str
    description: str
    status_id: str
    total_modules: int
    total_lessons: int
