import uuid
from uuid import UUID
from datetime import date
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.models.enum import QuizPlacementType

if TYPE_CHECKING:
    from app.models.question import Question
    from app.models.quiz_submission import QuizSubmission

# Model của thông tin đề thi
class Quiz(SQLModel, table=True):
    __tablename__ = "quiz"

    quiz_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str = Field(nullable=False, max_length=255)
    description: Optional[str] = Field(default=None)
    
    duration_minutes: int = Field(default=15, nullable=False) # Thời gian làm bài (phút)
    passing_score: float = Field(default=5.0, nullable=False) # Điểm tối thiểu để đạt
    max_attempts: int = Field(default=3, nullable=False)      # Số lần làm bài tối đa
    
    placement_type: QuizPlacementType = Field(default=QuizPlacementType.STANDALONE_LESSON)
    target_lesson_id: Optional[UUID] = Field(default=None, index=True) # Liên kết tới bài học nào
    video_trigger_seconds: Optional[int] = Field(default=None) # Giây thứ bao nhiêu trong video nếu là câu hỏi trong video
    
    is_active: bool = Field(default=True)
    created_at: date = Field(default_factory=date.today)

    # Quan hệ
    questions: List["Question"] = Relationship(back_populates="quiz")
    submissions: List["QuizSubmission"] = Relationship(back_populates="quiz")