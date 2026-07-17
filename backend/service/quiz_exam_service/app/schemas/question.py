from pydantic import BaseModel
from uuid import UUID
from app.models.question import Question
from app.models.enum import QuestionType

class QuestionCreate(BaseModel):
    subject_id: UUID
    question_title: str
    question_type: QuestionType
    body_content: str | None = None
    max_points: float

class QuestionUpdate(BaseModel):
    question_title: str | None = None
    body_content: str | None = None
    max_points: float | None = None

class QuestionItem(BaseModel):
    question_id: UUID
    question_title: str 
    question_type: QuestionType
    body_content: str | None = None
    max_points: float | None = None


