from app.crud.base import CRUDBase
from app.models.subject import Subject
from app.models.syllabus import Syllabus
from app.models.module import Module
from app.models.lesson import Lesson
from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.models.enum import SubjectStatus
from uuid import UUID
from sqlmodel import Session, select, func, join

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate, UUID]):
    def get_by_course(self, db: Session, course_id: UUID) -> list[Subject]:
        statement = select(Subject).where(Subject.course_id == course_id)
        return db.exec(statement).all()
    
    # Lấy tổng số môn học mà giảng viên đảm nhiệm
    def total_subject_by_instructor(self, db: Session, instructor_id: UUID) -> int:
        statement = (
            select(func.count(Subject.subject_id.distinct())) 
            .join(Syllabus, Syllabus.subject_id == Subject.subject_id)
            .where(Syllabus.instructor_id == instructor_id)
        )
        return db.exec(statement).first() or 0
    
    # Lấy tổng số môn học mà giảng viên đảm nhiệm theo trạng thái
    def get_total_instructor_subject_by_status(
        self, db: Session, instructor_id: UUID, status_id: SubjectStatus
    ) -> int:
        statement = (
            select(func.count(Subject.subject_id.distinct()))
            .join(Syllabus, Syllabus.subject_id == Subject.subject_id)
            .where(
                Syllabus.instructor_id == instructor_id,
                Subject.status_id == status_id
            )
        )
        return db.exec(statement).first() or 0
    
    def get_total_lessons(self, db: Session, subject_id: UUID) -> int:
        statement = (
            select(func.count(Lesson.lesson_id))
            .select_from(Lesson)
            .join(Module, Lesson.module_id == Module.module_id)
            .where(Module.subject_id == subject_id)
        )
        
        result = db.exec(statement).scalar()
        
        return result or 0
        
crud_subject = CRUDSubject(Subject)
