from app.crud.base import CRUDBase
from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate, LessonUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDLesson(CRUDBase[Lesson, LessonCreate, LessonUpdate, UUID]):
    pass

crud_course = CRUDLesson(Lesson)