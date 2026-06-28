from sqlmodel import Field, SQLModel
from typing import Optional
from uuid import UUID
import uuid
from enum import Enum

class CourseType(str, Enum):
    LONG_TERM = "LONG_TERM"
    SHORT_TERM = "SHORT_TERM"


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
    instructor_id: UUID = Field(nullable=False) #id của người được phân công
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

