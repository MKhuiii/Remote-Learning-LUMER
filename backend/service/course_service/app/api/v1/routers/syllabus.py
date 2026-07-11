from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import Optional

from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker
from app.crud.syllabus import crud_syllabus
from app.schemas.syllabus import SyllabusCreate, SyllabusUpdate, SyllabusRead

router = APIRouter(prefix="/syllabus", tags=["syllabus"])

# 🔵 1. API: Lấy thông tin đề cương theo ID Môn học
@router.get("/subject/{subject_id}", response_model=SyllabusRead, status_code=status.HTTP_200_OK)
def get_syllabus_by_subject(
    subject_id: UUID,
    db: SessionDep,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student"]))
):
    syllabus = crud_syllabus.get_by_subject(db=db, subject_id=subject_id)
    if not syllabus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học này chưa có dữ liệu đề cương chi tiết."
        )
    return syllabus


# 🟢 2. API: Tạo mới một đề cương
@router.post("/", response_model=SyllabusRead, status_code=status.HTTP_201_CREATED)
def create_syllabus(
    payload: SyllabusCreate,
    db: SessionDep,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    existing = crud_syllabus.get_by_subject(db=db, subject_id=payload.subject_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Môn học này đã tồn tại đề cương, vui lòng sử dụng phương thức cập nhật."
        )
    return crud_syllabus.create(db=db, obj_in=payload)


# 🟡 3. API: Cập nhật thông tin đề cương theo ID
@router.put("/{syllabus_id}", response_model=SyllabusRead, status_code=status.HTTP_200_OK)
def update_syllabus(
    syllabus_id: UUID,
    payload: SyllabusUpdate,
    db: SessionDep,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    db_obj = crud_syllabus.get(db=db, id=syllabus_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy đề cương yêu cầu.")
    return crud_syllabus.update(db=db, db_obj=db_obj, obj_in=payload)