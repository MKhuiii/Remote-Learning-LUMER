from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.schemas.enums import SyllabusStatus
class SyllabusBase(BaseModel):
    subject_id: UUID
    assigner_id: Optional[UUID] = None        
    instructor_id: Optional[UUID] = None      
    description: Optional[str] = None
    syllabus_file_path: Optional[str] = ""    
    status_id: Optional[str] = SyllabusStatus.SYLLABUS_DRAFT.value

class SyllabusCreate(SyllabusBase):
    pass

class SyllabusUpdate(BaseModel):
    assigner_id: Optional[UUID] = None
    instructor_id: Optional[UUID] = None
    description: Optional[str] = None
    syllabus_file_path: Optional[str] = None
    status_id: Optional[str] = None

class SyllabusRead(SyllabusBase):
    syllabus_id: UUID

    class Config:
        from_attributes = True

class CheckSyllabusInstructor(BaseModel):
    subject_id: UUID
    instructor_id: UUID