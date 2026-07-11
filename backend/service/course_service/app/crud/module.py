from app.crud.base import CRUDBase
from app.models.module import Module
from app.models.subject import Subject
from app.models.syllabus import Syllabus
from app.schemas.module import ModuleCreate, ModuleUpdate
from uuid import UUID
from sqlmodel import Session, select
from typing import Optional

class CRUDModule(CRUDBase[Module, ModuleCreate, ModuleUpdate, UUID]):
    def get_by_subject(self, db: Session, subject_id: UUID) -> list[Module]:
        statement = select(Module).where(Module.subject_id == subject_id)
        return db.exec(statement).all()
    def get_course_owner(self, db: Session, module_id: UUID) -> Optional[UUID]:
        statement = (
            select(Syllabus.instructor_id)
            .select_from(Module)  
            .join(Subject, Module.subject_id == Subject.subject_id)
            .join(Syllabus, Subject.subject_id == Syllabus.subject_id)
            .where(Module.module_id == module_id)
        )
        return db.exec(statement).first()
crud_module = CRUDModule(Module)
