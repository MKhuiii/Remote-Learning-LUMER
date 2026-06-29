from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.core.security import get_current_user_role
from app.schemas.profile import ProfileUpdate
from app.crud.profile import crud_profile
from app.crud.user import crud_user

router = APIRouter()

@router.patch("/update-profile/{user_id}")
def update_profile(
    user_id: UUID,
    profile_update: ProfileUpdate,
    session: Session = Depends(SessionDep),
    current_user: dict = Depends(get_current_user_role)
):
    # Chỉ chính chủ hoặc Admin mới được phép
    is_owner = str(current_user["user_id"]) == str(user_id)
    is_admin = str(current_user["role_name"]) == "Admin"
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền chỉnh sửa hồ sơ"
        )

    # Kiểm tra user có tồn tại không
    db_user = crud_user.get_by_id(session, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )

    # Kiểm tra profile có tồn tại không
    db_profile = crud_profile.get_by_user_id(session, user_id)
    if db_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hồ sơ không tồn tại"
        )

    # Cập nhật profile
    updated_profile = crud_profile.update(session, db_profile, profile_update)

    return {
        "message": "Cập nhật hồ sơ thành công!",
        "profile": updated_profile
    }
