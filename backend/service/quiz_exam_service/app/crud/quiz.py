from sqlmodel import Session, select
from app.crud.base import CRUDBase
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizItem
from uuid import UUID

class CRUDQuiz(CRUDBase[Quiz, QuizCreate, QuizUpdate, UUID]):
    def is_lesson_had_quiz(self, db: Session, lesson_id: UUID) -> bool:
        statement = select(Quiz).where(
            Quiz.target_lesson_id == lesson_id
        )
        return db.exec(statement).first() is not None
    def get_multi_by_subject(self, db: Session, subject_id: UUID) -> list[QuizItem]:
        statement = select(Quiz).where(
            Quiz.subject_id == subject_id
        )
        return db.exec(statement).all()
crud_quiz = CRUDQuiz(Quiz)