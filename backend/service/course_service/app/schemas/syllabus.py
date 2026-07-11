from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class SyllabusBase(BaseModel):
    subject_id: UUID
    assigner_id: UUID
    description: Optional[str] = None
    syllabus_file_path: str
    status_id: str

class SyllabusCreate(SyllabusBase):
    pass

class SyllabusUpdate(BaseModel):
    assigner_id: Optional[UUID] = None
    description: Optional[str] = None
    syllabus_file_path: Optional[str] = None
    status_id: Optional[str] = None

class SyllabusRead(SyllabusBase):
    syllabus_id: UUID

    class Config:
        from_attributes = True