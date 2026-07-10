from sqlmodel import Session, select
from app.crud.base import CRUDBase
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate
from uuid import UUID

class CRUDQuiz(CRUDBase[Quiz, QuizCreate, QuizUpdate, UUID]):
    pass

crud_quiz = CRUDQuiz(Quiz)