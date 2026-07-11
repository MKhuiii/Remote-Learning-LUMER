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
    
    def exists(self, db: Session, course_id: UUID) -> bool:
        statement = select(Course.course_id).where(Course.course_id == course_id)
        result = db.exec(statement).first()
        return result is not None
    def get_title_by_id(self, db: Session, course_id: UUID) -> str:
        statement = select(Course.title).where(
            Course.course_id == course_id
        )
        return db.exec(statement).first()
crud_course = CRUDCourse(Course)
