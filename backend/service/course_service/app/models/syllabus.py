from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID
import uuid

if TYPE_CHECKING:
    from app.models.subject import Subject

# Model đề cương của môn học trong khóa học
class Syllabus(SQLModel, table=True):
    __tablename__ = "syllabus"

    syllabus_id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    subject_id: UUID = Field(foreign_key="subject.subject_id", nullable=False, unique=True)
    assigner_id: UUID = Field(nullable=False)
    instructor_id: UUID = Field(nullable=False)
    description: Optional[str] = Field(default=None, max_length=255)
    syllabus_file_path: str = Field(nullable=False)
    status_id: str = Field(
        foreign_key="status_catalog.status_id", 
        nullable=False,
        max_length=50
    )

    subject: Optional["Subject"] = Relationship(back_populates="syllabus")