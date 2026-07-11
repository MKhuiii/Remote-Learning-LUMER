from app.crud.base import CRUDBase
from app.models.curriculum import Curriculum 
from app.schemas.curriculum import CurriculumCreate, CurriculumUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDCurriculum(CRUDBase[Curriculum, CurriculumCreate, CurriculumUpdate, UUID]):
    # Giữ nguyên cấu trúc kế thừa từ class cha để dùng hàm create, get, get_multi, update, delete
    pass

# Khởi tạo instance cho router gọi đến
crud_curriculum = CRUDCurriculum(Curriculum)