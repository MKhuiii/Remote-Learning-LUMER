import uuid
from uuid import UUID
from datetime import date
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.models.enum import QuizPlacementType

if TYPE_CHECKING:
    from app.models.quiz_submission import QuizSubmission
    from app.models.rubric_criteria import RubricCriteria
    from app.models.peer_review_assignments import PeerReviewAssignment
    from app.models.quiz_question import QuizQuestion
    from app.models.quiz_pool_rule import QuizPoolRule

class Quiz(SQLModel, table=True):
    __tablename__ = "quiz"

    quiz_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str = Field(nullable=False, max_length=255)       # Tiêu đề cấu hình của đề thi
    description: Optional[str] = Field(default=None)         # Nội dung hướng dẫn làm bài thi tổng quan
    
    duration_minutes: int = Field(default=15, nullable=False) # Thời gian giới hạn làm bài tính bằng phút
    passing_score: float = Field(default=5.0, nullable=False) # Điểm số tối thiểu để hệ thống ghi nhận trạng thái đạt
    max_attempts: int = Field(default=3, nullable=False)      # Số lượt làm bài tối đa cho phép đối với học viên
    
    placement_type: QuizPlacementType = Field(default=QuizPlacementType.STANDALONE_LESSON) # Vị trí hiển thị đề thi
    target_lesson_id: Optional[UUID] = Field(default=None, index=True) # Định danh bài học chứa đề thi từ Course Service
    
    is_active: bool = Field(default=True, nullable=False)    # Trạng thái kích hoạt cho phép hiển thị đề thi
    created_at: date = Field(default_factory=date.today)    # Ngày khởi tạo cấu hình đề thi

    # Quan hệ nội bộ phân hệ
    quiz_questions: List["QuizQuestion"] = Relationship(back_populates="quiz")
    submissions: List["QuizSubmission"] = Relationship(back_populates="quiz")
    rubric_criterias: List["RubricCriteria"] = Relationship(back_populates="quiz")
    peer_assignments: List["PeerReviewAssignment"] = Relationship(back_populates="quiz")
    pool_rules: List["QuizPoolRule"] = Relationship(back_populates="quiz")