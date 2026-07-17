from sqlmodel import Session, select, update
from app.crud.base import CRUDBase
from uuid import UUID
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate

class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate, UUID]):
    def get_by_subject_id(self, db: Session, subject_id: UUID):
        statement = select(Question).where(
            Question.subject_id == subject_id
        )
        return db.exec(statement).all()
    
    def add_to_pool(self, db: Session, pool_id: UUID | None, question_id: UUID) -> bool:
        statement = (
            update(Question)
            .where(Question.id == question_id)
            .values(pool_id=pool_id)
        )
        
        result = db.exec(statement)
        db.commit()
        
        return result.rowcount > 0
crud_question = CRUDQuestion(Question)