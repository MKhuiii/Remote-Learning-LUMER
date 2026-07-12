from sqlmodel import Session, select
from app.crud.base import CRUDBase
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate
from uuid import UUID

class CRUDQuiz(CRUDBase[Quiz, QuizCreate, QuizUpdate, UUID]):
    def is_lesson_had_quiz(self, db: Session, lesson_id) -> bool:
        statement = select(Quiz).where(
            Quiz.target_lesson_id == lesson_id
        )
        return db.exec(statement).first() is not None

crud_quiz = CRUDQuiz(Quiz)