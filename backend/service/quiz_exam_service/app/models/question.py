import uuid
from uuid import UUID
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from app.models.enum import QuestionType

if TYPE_CHECKING:
    from app.models.question_option import QuestionOption
    from app.models.submission_detail import SubmissionDetail
    from app.models.quiz_question import QuizQuestion

class Question(SQLModel, table=True):
    __tablename__ = "question"

    question_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    subject_id: UUID = Field(nullable=False, index=True)   # Định danh môn học từ Course Service
    
    question_type: QuestionType = Field(nullable=False)     # Phân loại định dạng của câu hỏi
    content: str = Field(nullable=False)                    # Nội dung câu hỏi hỗ trợ định dạng HTML/Markdown/LaTeX
    max_points: float = Field(default=1.0, nullable=False) # Trọng số điểm tối đa mặc định của câu hỏi

    # Quan hệ nội bộ phân hệ
    quiz_questions: List["QuizQuestion"] = Relationship(back_populates="question")
    options: List["QuestionOption"] = Relationship(back_populates="question")
    submission_details: List["SubmissionDetail"] = Relationship(back_populates="question")