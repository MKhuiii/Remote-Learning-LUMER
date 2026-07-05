from app.crud.base import CRUDBase
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDModule(CRUDBase[Module, ModuleCreate, ModuleUpdate, UUID]):
    def get_by_subject(self, db: Session, subject_id: UUID) -> list[Module]:
        statement = select(Module).where(Module.subject_id == subject_id)
        return db.exec(statement).all()

crud_module = CRUDModule(Module)
