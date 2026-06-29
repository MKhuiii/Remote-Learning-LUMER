from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.core.security import get_current_user_role
from app.schemas.profile import ProfileUpdate
from app.crud.profile import crud_profile
from app.crud.user import crud_user

router = APIRouter()

@router.patch("/update-profile/{profile_id}")
def update_profile(
    profile_id: UUID,
    profile_update: ProfileUpdate,
    session: Session = Depends(SessionDep),
    current_user: dict = Depends(get_current_user_role)
):
    # Lấy profile theo profile_id
    db_profile = crud_profile.get_by_id(session, profile_id)
    if db_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hồ sơ không tồn tại"
        )

    # Kiểm tra quyền: chính chủ hoặc Admin
    is_owner = str(current_user["user_id"]) == str(db_profile.user_id)
    is_admin = str(current_user["role_name"]) == "Admin"
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền chỉnh sửa hồ sơ"
        )

    # Cập nhật profile
    updated_profile = crud_profile.update(session, db_profile, profile_update)

    return {
        "message": "Cập nhật hồ sơ thành công!",
        "profile": updated_profile
    }

@router.get("/get-profile/{profile_id}")
def get_profile(
    profile_id: UUID,
    session: Session = Depends(SessionDep),
    current_user: dict = Depends(get_current_user_role)
):
    # Lấy profile theo profile_id
    db_profile = crud_profile.get_by_id(session, profile_id)
    if db_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hồ sơ không tồn tại"
        )

    # Kiểm tra quyền: chính chủ hoặc Admin mới được phép xem
    is_owner = str(current_user["user_id"]) == str(db_profile.user_id)
    is_admin = str(current_user["role_name"]) == "Admin"
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền xem hồ sơ"
        )

    return db_profile