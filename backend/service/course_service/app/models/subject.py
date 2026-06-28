from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID
import uuid

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.syllabus import Syllabus

class Subject(SQLModel, table=True):
    __tablename__ = "subject"

    subject_id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    course_id: UUID = Field(foreign_key="course.course_id", nullable=False)
    title: str = Field(nullable=False, max_length=255)
    order_index: int = Field(default=1, nullable=False)

    course: Optional["Course"] = Relationship(back_populates="subjects")
    syllabus: Optional["Syllabus"] = Relationship(back_populates="subject")