from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID
import uuid
from app.models.enum import CourseType

if TYPE_CHECKING:
    from app.models.course import Course

# Model của Chương trình đào tạo khóa học
class Curriculum(SQLModel, table=True):
    __tablename__ = "curriculum"

    curriculum_id: UUID = Field(
        default_factory=uuid.uuid4, 
        primary_key=True, 
        index=True,
        nullable=False
    )
    assigner_id: UUID = Field(nullable=False) #id của người phân công
    instructor_id: UUID = Field(nullable=False) #id của giáo viên được phân công
    curriculum_name: str = Field(nullable=False, max_length=255)
    description: Optional[str] = Field(default=None, max_length=255)
    course_type: CourseType = Field(nullable=False)
    course_finished_months: int = Field(nullable=False) #Số tháng để hoàn thành khóa học
    curriculum_file_path: str = Field(nullable=False)
    certificate_name: str = Field(nullable=False, max_length=255)
    status_id: str = Field(
        foreign_key="status_catalog.status_id", 
        nullable=False,
        max_length=50
    )

    # Quan hệ
    # Một CTDT thuộc về một khóa học
    course: Optional["Course"] = Relationship(back_populates="curriculum")
