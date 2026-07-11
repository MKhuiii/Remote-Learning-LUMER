from fastapi import APIRouter, HTTPException, status, Depends, Query
from uuid import UUID
from typing import List, Dict
from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker, get_current_user_role
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead
from app.crud.course import crud_course

router = APIRouter(prefix="/courses", tags=["courses"])

# 🟢 Tạo Course (chỉ Admin hoặc Instructor)
@router.post("/", response_model=CourseRead)
def create_course(
    db: SessionDep,
    course_in: CourseCreate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_course.create(db, course_in)

# 🔵 Lấy Course theo ID (mọi role đều có thể xem)
@router.get("/{course_id}", response_model=CourseRead)
def get_course(
    db: SessionDep,
    course_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student"]))
):
    course = crud_course.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# 🟡 Lấy danh sách Course (Admin, Instructor)
@router.get("/", response_model=list[CourseRead])
def get_courses(
    db: SessionDep,
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_course.get_multi(db, skip=skip, limit=limit)

# 🟠 Cập nhật Course (Admin hoặc Instructor)
@router.put("/{course_id}", response_model=CourseRead)
def update_course(
    db: SessionDep,
    course_id: UUID,
    course_in: CourseUpdate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    db_obj = crud_course.get_by_id(db, course_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud_course.update(db, db_obj, course_in)

# 🔴 Xóa Course (chỉ Admin)
@router.delete("/{course_id}")
def delete_course(
    db: SessionDep,
    course_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin"]))
):
    db_obj = crud_course.delete(db, course_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"msg": "Course deleted successfully"}
@router.get("/title/{course_id}", response_model=str)
def get_course_title(
    db: SessionDep,
    course_id: UUID
):
    # Sử dụng hàm check exists bạn đã viết trong CRUD
    if crud_course.exists(db, course_id): 
        # Hàm get_title_by_id của bạn trả về chuỗi (str) tiêu đề
        return crud_course.get_title_by_id(db, course_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khóa học không tồn tại"
        )
@router.get("/is-existed-course/{course_id}")
def check_existed_course(
    db: SessionDep,
    course_id: UUID
):
    return crud_course.exists(db, course_id)

