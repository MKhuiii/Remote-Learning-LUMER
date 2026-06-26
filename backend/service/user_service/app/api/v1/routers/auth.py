from fastapi import APIRouter, HTTPException, status
from app.api.v1.deps import SessionDep
from app.crud.user import crud_user
from app.schemas.user import UserCreate, UserLogin
from app.core.config import settings
from datetime import datetime, timedelta, timezone
import jwt

router = APIRouter()

@router.post("/register")
def register(
        session: SessionDep,
        new_user: UserCreate
):
    existing_user = crud_user.get_by_email(session, email=new_user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại"
        )
    db_user = crud_user.create(session, new_user)

    return db_user

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


@router.post("/login")
def login(
    session: SessionDep,
    user: UserLogin
):
    existing_user = crud_user.get_by_email(session, email=user.email)
    if not existing_user or existing_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu sai hoặc người dùng không tồn tại"
        )
    expire_time = datetime.now(timezone.utc) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    token_data = {
        "sub": str(existing_user.user_id),
        "exp": expire_time
    }
    jwt_token = jwt.encode(token_data, SECRET_KEY, ALGORITHM)
    return{
        "message": "Đăng nhập thành công",
        "access_token": jwt_token,
        "user": {
            "user_id": existing_user.user_id,
            "username": existing_user.username,
            "email": existing_user.email
        }
    }