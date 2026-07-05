from app.crud.base import CRUDBase
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDCourse(CRUDBase[Course, CourseCreate, CourseUpdate, UUID]):
    def get_by_instructor(self, db: Session, instructor_id: UUID) -> list[Course]:
        statement = select(Course).where(Course.instructor_id == instructor_id)
        return db.exec(statement).all()

    def get_by_status(self, db: Session, status_id: str) -> list[Course]:
        statement = select(Course).where(Course.status_id == status_id)
        return db.exec(statement).all()

crud_course = CRUDCourse(Course)
