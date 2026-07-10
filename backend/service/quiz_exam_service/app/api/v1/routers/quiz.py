from fastapi import APIRouter
from app.core.db import settings
from app.api.v1.deps import SessionDep
from uuid import UUID

router = APIRouter(tags=["quizzes"])

@router.get("/{quiz_id}")
def get_quiz(
    session: SessionDep,
    quiz_id: UUID,
):
    pass