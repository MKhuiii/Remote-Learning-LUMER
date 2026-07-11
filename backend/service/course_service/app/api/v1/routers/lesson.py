from fastapi import APIRouter
from app.core.config import settings
from app.api.v1.deps import SessionDep
from uuid import UUID

router = APIRouter(tags=["lessons"])

@router.get("/{lesson_id}")
def get_lesson( 
    session: SessionDep,
    lesson_id: UUID
):  
    pass