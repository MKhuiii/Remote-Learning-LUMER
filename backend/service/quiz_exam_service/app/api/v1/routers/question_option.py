from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.api.v1.deps import SessionDep
from app.core.security import get_current_user_role
from app.schemas.question_option import QuestionOptionCreate, QuestionOptionAutoCreate, QuestionOptionItem
from uuid import UUID
from app.crud.question import crud_question
from app.crud.question_option import crud_question_option

router = APIRouter(prefix="/question-options", tags=["question-options"])

@router.get("/get-option-list/{question_id}", response_model=List[QuestionOptionItem])
def get_option_list(
    db: SessionDep,
    question_id: UUID,
    current_user: dict = Depends(get_current_user_role)
):
    user_id = current_user["user_id"]
    
    question = crud_question.get_by_id(db, question_id)
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Câu hỏi không tồn tại"
        )
    options = crud_question_option.get_options_by_question(db, question_id)
    return options