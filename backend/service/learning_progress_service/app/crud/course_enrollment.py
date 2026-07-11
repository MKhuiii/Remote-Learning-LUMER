from app.crud.base import CRUDBase
from uuid import UUID
from sqlmodel import Session, select
from app.models.course_enrollment import CourseEnrollment
from app.schemas.course_enrollment import CourseEnrollmentCreate, CourseEnrollmentUpdate

class CRUDCourseEnrollment(CRUDBase[CourseEnrollment, CourseEnrollmentCreate, CourseEnrollmentUpdate, UUID]):
    # Kiểm tra người dùng đã đăng ký khóa học chưa
    def check_already_enrolled(self, db: Session, user_id: UUID, course_id: UUID) -> bool:
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        )
        result = db.exec(statement).first()
        return result is not None
    def get_multi_by_user_id(self, db: Session, user_id: UUID):
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id== user_id
        )
        return db.exec(statement).all()
    def get_by_user_in_progress(self, db: Session, user_id: UUID) -> list[CourseEnrollment]:
        statement = select(CourseEnrollment.course_id).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.is_completed == False
        )
        return db.exec(statement).all()
    
    def get_by_user_completed(self, db: Session, user_id: UUID) -> list[CourseEnrollment]:
        statement = select(CourseEnrollment.course_id).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.is_completed == True,
            CourseEnrollment.current_overall_progress == 100
        )
        return db.exec(statement).all()
    
    def get_overrall_progress(self, db: Session, user_id: UUID, course_id: UUID) -> float:
        statement = select(CourseEnrollment.current_overall_progress).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        )
        return db.exec(statement).first()
    

crud_course_enrollment = CRUDCourseEnrollment(CourseEnrollment)