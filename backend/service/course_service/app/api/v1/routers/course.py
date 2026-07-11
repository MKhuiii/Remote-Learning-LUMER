# from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile
# from uuid import UUID

# from app.api.v1.deps import SessionDep
# from app.core.security import RoleChecker
# from app.schemas.course import CourseCreate, CourseUpdate, CourseRead, CourseImageUploadResponse
# from app.crud.course import crud_course
# from app.crud.course_media import crud_course_media
# import uuid
# import os
# import shutil

# router = APIRouter(prefix="/courses", tags=["courses"])


# @router.post("/", response_model=CourseRead)
# def create_course(
#     db: SessionDep,
#     course_in: CourseCreate,
#     current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
# ):
#     course_data = course_in.model_dump()
#     course_data["instructor_id"] = getattr(current_user, "id", None) or current_user.get("id")

#     return crud_course.create(db, course_in)

# # 🔵 Lấy Course theo ID (mọi role đều có thể xem)
# @router.get("/{course_id}", response_model=CourseRead)
# def get_course(
#     db: SessionDep,
#     course_id: UUID,
#     current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student"]))
# ):
#     course = crud_course.get_by_id(db, course_id)
#     if not course:
#         raise HTTPException(status_code=404, detail="Course not found")
#     return course

# # 🟡 Lấy danh sách Course (Admin, Instructor)
# @router.get("/", response_model=list[CourseRead])
# def get_courses(
#     db: SessionDep,
#     skip: int = 0,
#     limit: int = 10,
#     current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
# ):
#     return crud_course.get_multi(db, skip=skip, limit=limit)

# # 🟠 Cập nhật Course (Admin hoặc Instructor)
# @router.put("/{course_id}", response_model=CourseRead)
# def update_course(
#     db: SessionDep,
#     course_id: UUID,
#     course_in: CourseUpdate,
#     current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
# ):
#     db_obj = crud_course.get_by_id(db, course_id)
#     if not db_obj:
#         raise HTTPException(status_code=404, detail="Course not found")
#     return crud_course.update(db, db_obj, course_in)

# # 🔴 Xóa Course (chỉ Admin)
# @router.delete("/{course_id}")
# def delete_course(
#     db: SessionDep,
#     course_id: UUID,
#     current_user: dict = Depends(RoleChecker(["Admin"]))
# ):
#     db_obj = crud_course.delete(db, course_id)
#     if not db_obj:
#         raise HTTPException(status_code=404, detail="Course not found")
#     return {"msg": "Course deleted successfully"}



# # FOLDER_PATH = os.getenv("FOLDER_PATH_COURSE_IMAGE", "static/uploads")

# @router.post("/course-image", response_model=CourseImageUploadResponse)
# def upload_file_only(
#     file: UploadFile = File(...), 
#     current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
# ):
#     # Gọi thông qua tầng crud cực kỳ gọn gàng, không chứa logic bên trong router
#     url = crud_course_media.upload_image(file)
#     return {"image_url": url}


from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker
from app.crud.course import crud_course
from app.crud.course_media import crud_course_media
from app.schemas.course import CourseCreate, CourseImageUploadResponse, CourseRead, CourseUpdate

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/", response_model=CourseRead)
def create_course(
    db: SessionDep,
    course_in: CourseCreate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    course_data = course_in.model_dump()
    course_data["instructor_id"] = getattr(current_user, "id", None) or current_user.get("id")
    
    return crud_course.create(db, course_in)


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


@router.get("/", response_model=list[CourseRead])
def get_courses(
    db: SessionDep,
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_course.get_multi(db, skip=skip, limit=limit)


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
    if crud_course.exists(db, course_id): 
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


@router.post("/course-image", response_model=CourseImageUploadResponse)
def upload_file_only(
    file: UploadFile = File(...), 
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    url = crud_course_media.upload_image(file)
    return {"image_url": url}