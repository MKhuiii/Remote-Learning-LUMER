from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, TYPE_CHECKING
from app.models.curriculum import CourseType
from app.models.course_tag_link import CourseTagLink
from uuid import UUID
from datetime import date
import uuid

if TYPE_CHECKING:
    from app.models.tag import Tag
    from app.models.subject import Subject
    from app.models.curriculum import Curriculum
    from app.models.course_instructor_link import CourseInstructorLink

class Course(SQLModel, table=True):
    __tablename__ = "course"

    course_id: UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True, 
        index=True,
        nullable=False
    )
    curriculum_id: UUID = Field(
        foreign_key="curriculum.curriculum_id", 
        nullable=False, 
        unique=True 
    )
    instructor_id: UUID = Field(nullable=False)
    title: str = Field(nullable=False, max_length=255)
    course_type: CourseType = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    price: int = Field(default=0)
    created_at: date = Field(default_factory=date.today)
    status_id:str = Field(
        foreign_key="status_catalog.status_id", 
        nullable=False,
        max_length=50
    )

    # Quan hệ
    # Một khóa học có thể không có hoặc có nhiều giảng viên
    course_instructors: List[CourseInstructorLink] = Relationship(back_populates="course")
    # Một khóa học có một chương trình đào tạo
    curriculum: Optional["Curriculum"] = Relationship(back_populates="course")
    # Một khóa học có một hoặc nhiều tag
    tags: List["Tag"] = Relationship(back_populates="courses", link_model=CourseTagLink)
    # Một khóa học có một hoặc nhiều môn học
    subjects: List["Subject"] = Relationship(back_populates="course")
    