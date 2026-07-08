from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import select
from typing import List
from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker, get_current_user_role, hash_password
from app.crud.user import crud_user
from app.crud.role import crud_role
from app.crud.status_catalog import crud_status
from app.schemas.user import UserGeneralInfo, UserListQuery, UserCreate, UserDetailInfo, UserUpdate, UserRoleUpdate, UserStatusUpdate, UserInfoUpdate
from uuid import UUID

router = APIRouter()

@router.get("/get-user-list", response_model=List[UserGeneralInfo])
def get_user_list(
    session: SessionDep,
    query: UserListQuery = Depends(),
    current_user: dict = Depends(RoleChecker(["Admin"]))
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
        # Nếu lọc theo role_id cố định -> Chỉ cần tìm duy nhất 1 tên role
        if query.role_id is not None:
            role_name = crud_role.get_name_by_id(session, query.role_id) or "Unknown"
            role_mapping = {query.role_id: role_name}
            
        # Nếu danh sách trả về hỗn hợp nhiều role (Lọc theo status hoặc lấy tất cả)
        else:
            distinct_role_ids = list({user.role_id for user in users if user.role_id is not None})
            role_mapping = crud_role.get_role_mapping_by_ids(session, distinct_role_ids)
        
        # Thêm role_name vào từng user dựa trên map đã chuẩn bị
        for user in users:
            user_data = user.model_dump()
            user_data["role_name"] = role_mapping.get(user.role_id, "Unknown")
            user_info_list.append(user_data)

    return user_info_list

@router.post("/create-user")
def create_user(
    session: SessionDep,
    new_user: UserCreate,
    current_user: dict = Depends(RoleChecker(["Admin"]))

):
    # Kiểm tra người dùng đã tồn tại chưa
    user_existed = crud_user.get_by_email(session, new_user.email)
    if user_existed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email đã tồn tại"
        )
    if hasattr(new_user, "password") and new_user.password:
        new_user.password = hash_password(new_user.password)
    crud_user.create(session, new_user)
    return{
        "message": "Tạo người " + new_user.username + " thành công!"
    }

@router.get("/get-user/{user_id}", response_model=UserDetailInfo)
def get_user(
    session: SessionDep,
    user_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin"]))
):
    user = crud_user.get_by_id(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )
    role_name = crud_role.get_name_by_id(session, user.role_id) or "Unknown"
    
    user_data = user.model_dump()
    user_data["role_name"] = role_name
    return user_data

@router.patch("/update-role/{user_id}", response_model=UserDetailInfo)
def update_user_role(
    session: SessionDep,
    user_id: UUID, 
    user_update: UserRoleUpdate, 
    current_user: dict = Depends(RoleChecker(["Admin"]))
):
    db_user = crud_user.get_by_id(session, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )
    existed_role_id = crud_role.get_by_id(session, user_update.role_id)
    if existed_role_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vai trò không tồn tại"
        )

    updated_user = crud_user.update(session, db_user, user_update)
    role_name = crud_role.get_name_by_id(session, updated_user.role_id) or "Unknown"

    user_data = updated_user.model_dump()
    user_data["role_name"] = role_name
    
    return user_data

@router.patch("/update-status/{user_id}", response_model=UserDetailInfo)
def update_user_status(
    session: SessionDep,
    user_id: UUID,                  
    status_update: UserStatusUpdate, 
    current_user: dict = Depends(RoleChecker(["Admin"])) 
):
    db_user = crud_user.get_by_id(session, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )
    existed_status_id = crud_status.get_by_id(session, status_update.status_id)
    if existed_status_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trạng thái người dùng không tồn tại"
        )
    updated_user = crud_user.update(session, db_user, status_update)
    role_name = crud_role.get_name_by_id(session, updated_user.role_id) or "Unknown"

    user_data = updated_user.model_dump()
    user_data["role_name"] = role_name
    
    return user_data

@router.put("/update-user/{user_id}", response_model=UserDetailInfo)
def update_user(
    session: SessionDep,
    user_id: UUID,
    user_update: UserInfoUpdate,
    current_user: dict = Depends(get_current_user_role)
):
    db_user = crud_user.get_by_id(session, user_id)
    is_owner = str(current_user["user_id"]) == str(user_id)
    is_admin = str(current_user["role_name"]) == "Admin"
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền chỉnh sửa dữ liệu"
        )
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )
    updated_user = crud_user.update(session, db_user, user_update)
    role_name = crud_role.get_name_by_id(session, updated_user.role_id) or "Unknown"

    user_data = updated_user.model_dump()
    user_data["role_name"] = role_name
    
    return user_data

    

