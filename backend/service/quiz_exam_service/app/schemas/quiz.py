from pydantic import BaseModel
from uuid import UUID
from app.models.enum import QuizPlacementType

class QuizCreate(BaseModel):
    title: str
    description: str
    duration_minutes: int
    passsing_score: float
    max_attempts: int
    placement_type: QuizPlacementType
    target_lesson_id: UUID | None = None

class QuizUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    passsing_score: float | None = None
    max_attempts: int | None = None
    placement_type: QuizPlacementType | None = None
    target_lesson_id: UUID | None = None
    is_active: bool | None = None