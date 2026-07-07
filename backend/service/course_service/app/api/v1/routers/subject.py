from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectRead
from app.crud.subject import crud_subject

router = APIRouter(prefix="/subjects", tags=["subjects"])

# 🟢 Tạo Subject (Admin, Instructor)
@router.post("/", response_model=SubjectRead)
def create_subject(
    db: SessionDep,
    subject_in: SubjectCreate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_subject.create(db, subject_in)

# 🔵 Lấy Subject theo ID (mọi role đều có thể xem)
@router.get("/{subject_id}", response_model=SubjectRead)
def get_subject(
    db: SessionDep,
    subject_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student"]))
):
    subject = crud_subject.get_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

# 🟡 Lấy danh sách Subject (Admin, Instructor)
@router.get("/", response_model=list[SubjectRead])
def get_subjects(
    db: SessionDep,
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_subject.get_multi(db, skip=skip, limit=limit)

# 🟠 Cập nhật Subject (Admin, Instructor)
@router.put("/{subject_id}", response_model=SubjectRead)
def update_subject(
    db: SessionDep,
    subject_id: UUID,
    subject_in: SubjectUpdate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    db_obj = crud_subject.get_by_id(db, subject_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return crud_subject.update(db, db_obj, subject_in)

# 🔴 Xóa Subject (Admin)
@router.delete("/{subject_id}")
def delete_subject(
    db: SessionDep,
    subject_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin"]))
):
    db_obj = crud_subject.delete(db, subject_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"msg": "Subject deleted successfully"}
