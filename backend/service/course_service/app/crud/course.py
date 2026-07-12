from app.crud.base import CRUDBase
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.subject import Subject
from app.models.module import Module
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
    
    def get_total_lessons(self, db: Session, course_id: UUID) -> int:
        statement = select(Course.total_lessons).where(
            Course.course_id == course_id
        )
        return db.exec(statement).first()
    
    def get_lesson_ids_by_course(self, db: Session, course_id: UUID) -> list[dict]:
        """
        Lấy danh sách thông tin bài học sắp xếp theo lộ trình tuyến tính
        """
        statement = (
            select(Lesson.lesson_id, Lesson.is_optional)
            .join(Module, Lesson.module_id == Module.module_id)
            .join(Subject, Module.subject_id == Subject.subject_id)
            .where(Subject.course_id == course_id)
            .order_by(Subject.order_index, Module.order_index, Lesson.order_index)
        )
        results = db.exec(statement).all()
        # Trả về list dạng dict [{"lesson_id": ..., "is_optional": ...}]
        return [{"lesson_id": r[0], "is_optional": r[1]} for r in results]
    
crud_course = CRUDCourse(Course)
