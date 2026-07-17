from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import Optional

from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker
from app.crud.syllabus import crud_syllabus
from app.schemas.syllabus import SyllabusCreate, SyllabusUpdate, SyllabusRead, CheckSyllabusInstructor
from fastapi import Request
router = APIRouter(prefix="/syllabus", tags=["syllabus"])

# 🔵 1. API: Lấy thông tin đề cương theo ID Môn học
@router.get("/subject/{subject_id}", response_model=SyllabusRead, status_code=status.HTTP_200_OK)
def get_syllabus_by_subject(
    subject_id: UUID,
    db: SessionDep,
    request: Request, # <--- Thêm request ở đây để debug
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student", "Manager"]))
):
    # --- ĐOẠN CODE IN DEBUG (BẠN THÊM VÀO ĐỂ CHECK) ---
    print("================ DEBUG API CALL ================")
    # 1. In ra các Header mà Next.js thực sự gửi lên Backend
    print("🔌 Headers nhận được:")
    for key, value in request.headers.items():
        if key.lower() in ["authorization", "cookie"]:
            print(f"   -> {key}: {value}")
            
    # 2. In ra thông tin User sau khi giải mã Token thành công
    print("👤 Current User giải mã được:", current_user)
    print("================================================")

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
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Manager"]))
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
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Manager"]))
):
    db_obj = crud_syllabus.get(db=db, id=syllabus_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy đề cương yêu cầu.")
    return crud_syllabus.update(db=db, db_obj=db_obj, obj_in=payload)

@router.get("/check-instructor", response_model=bool)
def is_subject_instructor(
    db: SessionDep,
    instructor_id: UUID = Query(...),
    subject_id: UUID = Query(...)
):
    # Tự đóng gói thành object CheckSyllabusInstructor để truyền vào CRUD
    query = CheckSyllabusInstructor(subject_id=subject_id, instructor_id=instructor_id)
    return crud_syllabus.is_subject_instructor(db, query)
    