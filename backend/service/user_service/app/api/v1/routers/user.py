from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import select
from typing import List
from app.api.v1.deps import SessionDep
from app.crud.user import crud_user
from app.schemas.user import UserInfo, UserListQuery
from app.models.role import Role

router = APIRouter()

@router.get("/get-user-list", response_model=List[UserInfo])
def get_user_list(
    session: SessionDep,
    query: UserListQuery = Depends()
):
    if query.status_id is not None and query.role_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yêu cầu không hợp lệ! Bạn chỉ được phép lọc theo 'status_id' HOẶC 'role_id', không được chọn cả hai."
        )
    if query.status_id is not None:
        users = crud_user.get_multi_by_status(
            session, query.status_id, query.skip, query.limit
        )
    elif query.role_id is not None:
        users = crud_user.get_multi_by_role(
            session, role_id=query.role_id, skip=query.skip, limit=query.limit
        )
    else:
        users = crud_user.get_multi(session, skip=query.skip, limit=query.limit)

    # Duyệt qua danh sách và thêm trường role_name 
    user_info_list = []
    
    if users:  
        distinct_role_ids = {user.role_id for user in users if user.role_id is not None}
        
        # Select những Role xuất hiện trong danh sách user
        roles_in_db = session.exec(
            select(Role).where(Role.role_id.in_(distinct_role_ids))
        ).all()
        
        # Tạo bảng tra cứu 
        role_mapping = {role.role_id: role.role_name for role in roles_in_db}
        
        # Thêm role_name vào user
        for user in users:
            user_data = user.model_dump()
            user_data["role_name"] = role_mapping.get(user.role_id, "Unknown")
            user_info_list.append(user_data)

    return user_info_list