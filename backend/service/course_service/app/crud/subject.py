from app.crud.base import CRUDBase
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate, UUID]):
    def get_by_course(self, db: Session, course_id: UUID) -> list[Subject]:
        statement = select(Subject).where(Subject.course_id == course_id)
        return db.exec(statement).all()

crud_subject = CRUDSubject(Subject)
