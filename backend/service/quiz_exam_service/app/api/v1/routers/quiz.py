from fastapi import APIRouter
from app.core.db import settings
from app.api.v1.deps import SessionDep
from app.crud.quiz import crud_quiz
from uuid import UUID

router = APIRouter(tags=["quizzes"])

@router.get("/{lesson_id}/had-quiz")
def is_lesson_had_quiz(
    db: SessionDep,
    lesson_id: UUID
):
    return crud_quiz.is_lesson_had_quiz(db, lesson_id)
