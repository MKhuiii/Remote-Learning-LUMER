from uuid import UUID
import math
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from typing import Optional
from app.api.v1.deps import SessionDep
from app.schemas.course import CourseSearchPaginatedResponse
from app.schemas.enums import CourseType
from app.core.security import RoleChecker, get_current_user_role
from app.crud.course import crud_course
from app.crud.course_media import crud_course_media
from app.schemas.course import CourseCreate, CourseImageUploadResponse, CourseRead, CourseUpdate, CourseLessonsResponse

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get(
    "/search",
    response_model=CourseSearchPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Tìm kiếm & Lọc danh sách khóa học"
)
def search_courses(
    db: SessionDep,
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm (Tiêu đề hoặc Mô tả)"),
    tag_id: Optional[UUID] = Query(None, description="Lọc theo ID của Tag"),
    course_type: Optional[CourseType] = Query(None, description="Lọc theo Loại khóa học"),
    max_price: Optional[int] = Query(None, ge=0, description="Lọc khóa học có giá nhỏ hơn hoặc bằng"),
    page: int = Query(1, ge=1, description="Trang hiện tại (Mặc định: 1)"),
    size: int = Query(10, ge=1, le=100, description="Số lượng mục trên 1 trang (Mặc định: 10)"),
):
    items, total = crud_course.search_courses(
        db=db,
        q=q,
        tag_id=tag_id,
        course_type=course_type,
        max_price=max_price,
        page=page,
        size=size
    )

    total_pages = math.ceil(total / size) if total > 0 else 0

    return CourseSearchPaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        total_pages=total_pages
    )

@router.post("/", response_model=CourseRead)
def create_course(db: SessionDep, course_in: CourseCreate, current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Manager"]))):
    course_data = course_in.model_dump()
    user_id = getattr(current_user, "id", None) or current_user.get("id")
    course_data["instructor_id"] = user_id
    return crud_course.create(db, obj_in=course_data)

@router.get("/{course_id}", response_model=CourseRead)
def get_course(
    db: SessionDep,
    course_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student", "Manager"]))
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
    current_user: dict = Depends(get_current_user_role)
):
    return crud_course.get_multi(db, skip=skip, limit=limit)


@router.put("/{course_id}", response_model=CourseRead)
def update_course(
    db: SessionDep,
    course_id: UUID,
    course_in: CourseUpdate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Manager"]))
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
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Manager"]))
):
    url = crud_course_media.upload_image(file)
    return {"image_url": url}

# LẤY DANH SÁCH LESSON IDS THEO COURSE ID (Dùng khi học viên ấn Enroll khóa học)
@router.get("/{course_id}/lessons", response_model=CourseLessonsResponse)
def get_course_lessons(
    db: SessionDep, 
    course_id: UUID,
):
    """
    Trả về danh sách toàn bộ lesson_id của một khóa học, sắp xếp theo order_index.
    """
    # Kiểm tra xem khóa học có tồn tại hay không bằng hàm exists trong CRUD
    if not crud_course.exists(db, course_id=course_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khóa học không tồn tại trên hệ thống."
        )
        
    lessons_data = crud_course.get_lesson_ids_by_course(db, course_id=course_id)
    return CourseLessonsResponse(course_id=course_id, lessons=lessons_data)

@router.get("/{course_id}/total-lessons", response_model=int)
def get_course_total_lessons(db: SessionDep, course_id: UUID):
    """
    Endpoint trả về tổng số bài học (int) của một khóa học.
    """
    if not crud_course.exists(db, course_id=course_id):
        raise HTTPException(status_code=404, detail="Khóa học không tồn tại.")
    return crud_course.get_total_lessons(db, course_id=course_id)

