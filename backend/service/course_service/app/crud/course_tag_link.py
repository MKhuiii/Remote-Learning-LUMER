from app.crud.base import CRUDBase
from app.models.course_tag_link import CourseTagLink
from app.schemas.course_tag_link import CourseTagLinkCreate, CourseTagLinkUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDCourseTagLink(CRUDBase[CourseTagLink, CourseTagLinkCreate, CourseTagLinkUpdate, UUID]):
    pass

crud_course_tag_link = CRUDCourseTagLink(CourseTagLink)