from sqlmodel import Session, select
from pydantic import EmailStr
from app.crud.base import CRUDBase
from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import UserCreate, UserUpdate
from uuid import UUID

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate, UUID]):
    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_user = self.model.model_validate(obj_in, update={"role_id": 2}) #Gán role cho người dùng mới tạo là user có id là 2
        db.add(db_user)
        db.flush()
        
        auto_profile = Profile(
            user_id=db_user.user_id,
            firstname=db_user.username,
            lastname=None,
            bio=None,
            avatar_url=None
        )
        db.add(auto_profile)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    # Lấy danh sách user dựa theo role
    def get_multi_by_role(self, db: Session, role_id: int, skip: int = 0, limit: int = 10) -> list[User]:
        statement = select(self.model).where(self.model.role_id == role_id).offset(skip).limit(limit)
        return db.exec(statement).all()
    # Lấy danh sách user dựa theo status
    def get_multi_by_status(self, db: Session, status_id: str, skip: int = 0, limit: int = 10) -> list[User]:
        statement = select(self.model).where(self.model.status_id == status_id).offset(skip).limit(limit)
        return db.exec(statement).all()
    # Lấy thông tin user dựa theo email
    def get_by_email(self, db: Session, email: EmailStr) -> User | None:
        statement = select(self.model).where(self.model.email == email)
        return db.exec(statement).first()
crud_user = CRUDUser(User)

