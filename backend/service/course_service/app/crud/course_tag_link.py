from app.crud.base import CRUDBase
from app.models.course_tag_link import CourseTagLink
from app.schemas.course_tag_link import CourseTagLinkCreate, CourseTagLinkUpdate
from uuid import UUID
from app.models.tag import Tag
from app.models.course import Course
from sqlmodel import Session, select

class CRUDCourseTagLink(CRUDBase[CourseTagLink, CourseTagLinkCreate, CourseTagLinkUpdate, UUID]):
    def get_by_id(self, db: Session, course_id: UUID, tag_id: UUID):
        statement = select(CourseTagLink).where(
            CourseTagLink.course_id == course_id,
            CourseTagLink.tag_id == tag_id
        )
        return db.exec(statement).first()
    def delete(self, db: Session, course_id: UUID, tag_id: UUID) -> bool:
        statement = select(CourseTagLink).where(
            CourseTagLink.course_id == course_id,
            CourseTagLink.tag_id == tag_id
        )
        obj = db.exec(statement).first()

        if not obj:
            return False  
        db.delete(obj)
        db.commit()

    def get_multi_by_course_id(self, db: Session, course_id: UUID) -> list[Tag] | None:
        statement = (
        select(Tag)
        .join(CourseTagLink, Tag.tag_id == CourseTagLink.tag_id)
        .where(CourseTagLink.course_id == course_id)
    )
        tags = db.exec(statement).all()
        return tags
    
    def get_multi_by_tag_id(self, db: Session, tag_id: UUID) -> list[Course] | None:
        statement = (
                select(Course)
                .join(CourseTagLink, Course.course_id == CourseTagLink.course_id)
                .where(CourseTagLink.tag_id == tag_id)
            )
        courses = db.exec(statement).all()
        return courses
        
crud_course_tag_link = CRUDCourseTagLink(CourseTagLink)