from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import Optional, List, Annotated
from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker, get_current_user_role
from app.schemas.tag import TagCreate, TagItem, TagListQuery, TagUpdate
from app.crud.tag import crud_tag

router = APIRouter(prefix="/tags", tags=["tags"])

@router.post("/")
def create_tag(
    db: SessionDep,
    new_tag: TagCreate,
    current_user: dict = Depends(RoleChecker(["Manager"]))
):
    tag = crud_tag.is_tag_name_existed(db, new_tag.tag_name)
    if tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tên tag đã được sử dụng"
        )
    crud_tag.create(db, new_tag)
    return {
        "status": "succcess",
        "message": f"Đã tạo tag {new_tag.tag_name} thành công!"
    }

@router.get("/get-list", response_model= List[TagItem])
def get_tag_list(
    db: SessionDep,
    filter: Annotated[TagListQuery, Query()],
    current_user: dict = Depends(RoleChecker(["Manager"]))
):
    tag_list = crud_tag.get_multi(db, filter.skip, filter.limit)
    return tag_list

@router.delete("/{tag_id}")
def delete_tag(
    db: SessionDep,
    tag_id: UUID,
    current_user: dict = RoleChecker(["Manager"])
):
    tag = crud_tag.get_by_id(db, tag_id)
    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag không tồn tại"
        )
    crud_tag.delete(db, tag_id)
    return {
        "status": "succcess",
        "message": f"Đã xóa tag có id {tag_id} thành công!"
    }

@router.put("/")
def update_tag(
    db: SessionDep,
    updated_tag: TagUpdate,
    current_user: dict = Depends(RoleChecker(["Manager"]))
):
    check_name = crud_tag.is_tag_name_existed(db, updated_tag.tag_name)
    if check_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tên tag đã được sử dụng"
        )
    db_tag = crud_tag.get_by_id(db, updated_tag.tag_id)
    crud_tag.update(db, db_tag, updated_tag)
    return {
        "status": "succcess",
        "message": f"Đã cập nhật tag có id {updated_tag.tag_id} thành công!"
    }