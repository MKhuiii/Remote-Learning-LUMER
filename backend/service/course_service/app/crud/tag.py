from app.crud.base import CRUDBase
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate, UUID]):
    def is_tag_name_existed(self, db: Session, tag_name: str) -> bool:
        statement = select(Tag).where(
            Tag.tag_name == tag_name
        )
        return db.exec(statement).first() is not None

crud_tag = CRUDTag(Tag)