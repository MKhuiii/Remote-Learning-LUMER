from app.crud.base import CRUDBase
from app.models.tag import Tag
from app.models.course_tag_link import CourseTagLink
from app.schemas.tag import TagCreate, TagUpdate
from uuid import UUID
from sqlmodel import Session, select, func

class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate, UUID]):
    def is_tag_name_existed(self, db: Session, tag_name: str) -> bool:
        statement = select(Tag).where(
            Tag.tag_name == tag_name
        )
        return db.exec(statement).first() is not None
    # Lấy tag theo xếp hạng liên kết
    def get_top_tags(self, db: Session, limit: int = 5) -> list[Tag]:
        statement = (
            select(Tag)
            .join(CourseTagLink, Tag.tag_id == CourseTagLink.tag_id)
            .group_by(Tag.tag_id)
            .order_by(func.count(CourseTagLink.course_id).desc())
            .limit(limit)
        )
        
        return db.exec(statement).all()
    def get_name(self, db: Session, tag_id: UUID):
        statement = select(Tag.tag_name).where(
            Tag.tag_id == tag_id
        )
        return 
crud_tag = CRUDTag(Tag)