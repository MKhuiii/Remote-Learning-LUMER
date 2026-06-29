import uuid
from uuid import UUID
from datetime import date
from typing import Optional
from sqlmodel import Field, SQLModel

class CourseEnrollment(SQLModel, table=True):
    __tablename__ = "course_enrollment"

    enrollment_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: UUID = Field(nullable=False, index=True)       # Định danh học viên từ User Service
    course_id: UUID = Field(nullable=False, index=True)     # Định danh khóa học từ Course Service
    
    enrolled_at: date = Field(default_factory=date.today)   # Ngày học viên đăng ký vào khóa học
    current_overall_progress: float = Field(default=0.0)    # Tiến độ tổng quan của khóa học (0% - 100%)
    is_completed: bool = Field(default=False)               # Trạng thái hoàn thành toàn bộ khóa học
    completed_at: Optional[date] = Field(default=None)      # Ngày học viên hoàn thành khóa học