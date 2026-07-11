from app.crud.base import CRUDBase
from app.models.syllabus import Syllabus
from app.schemas.syllabus import SyllabusCreate, SyllabusUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDSyllabus(CRUDBase[Syllabus, SyllabusCreate, SyllabusUpdate, UUID]):
    # 🔵 Lấy Đề cương dựa theo ID Môn học (vì quan hệ 1:1 nên chỉ lấy cái đầu tiên tìm thấy)
    def get_by_subject(self, db: Session, subject_id: UUID) -> Syllabus | None:
        statement = select(Syllabus).where(Syllabus.subject_id == subject_id)
        return db.exec(statement).first()

crud_syllabus = CRUDSyllabus(Syllabus)