import uuid
from uuid import UUID
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.question import Question

class QuizQuestion(SQLModel, table=True):
    __tablename__ = "quiz_question"

    quiz_id: UUID = Field(foreign_key="quiz.quiz_id", primary_key=True, nullable=False)
    question_id: UUID = Field(foreign_key="question.question_id", primary_key=True, nullable=False)
    
    order_index: int = Field(default=1, nullable=False)    # Thứ tự hiển thị của câu hỏi trong riêng đề thi này

    # Quan hệ cấu trúc liên kết trung gian
    quiz: Optional["Quiz"] = Relationship(back_populates="quiz_questions")
    question: Optional["Question"] = Relationship(back_populates="quiz_questions")