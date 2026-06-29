import uuid
from uuid import UUID
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.models.enum import QuestionType

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.question_option import QuestionOption
    from app.models.submission_detail import SubmissionDetail

# Model của nội dung câu hỏi
class Question(SQLModel, table=True):
    __tablename__ = "question"

    question_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    quiz_id: UUID = Field(foreign_key="quiz.quiz_id", nullable=False)
    
    question_type: QuestionType = Field(nullable=False)
    content: str = Field(nullable=False) # Nội dung câu hỏi (Chấp nhận chuỗi HTML/Markdown/LaTeX)
    max_points: float = Field(default=1.0, nullable=False) # Thang điểm tối đa của câu này
    order_index: int = Field(default=1, nullable=False)    # Thứ tự câu hỏi trong đề

    # Quan hệ
    quiz: Optional["Quiz"] = Relationship(back_populates="questions")
    options: List["QuestionOption"] = Relationship(back_populates="question")
    submission_details: List["SubmissionDetail"] = Relationship(back_populates="question")