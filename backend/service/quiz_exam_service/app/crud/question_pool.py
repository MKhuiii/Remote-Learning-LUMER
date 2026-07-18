from sqlmodel import Session, select, update
from app.crud.base import CRUDBase
from uuid import UUID
from app.models.question_pool import QuestionPool
from app.schemas.question_pool import QuestionPoolCreate, QuestionPoolUpdate

class CRUDQuestionPool(CRUDBase[QuestionPool, QuestionPoolCreate, QuestionPoolUpdate, UUID]):
    pass
crud_question_pool = CRUDQuestionPool(QuestionPool)

