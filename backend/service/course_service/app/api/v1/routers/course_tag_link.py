from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import Optional, List, Annotated
from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker, get_current_user_role
from app.crud.course_tag_link import CRUDCourseTagLink
from app.schemas.course_tag_link import CourseTagLinkBase, CourseTagLinkCreate, CourseTagLinkUpdate
from app.models.course import Course
from app.models.tag import Tag
from app.schemas.tag import TagName
from app.schemas.course import GeneralCourseInfo
from app.crud.course import crud_course
from app.crud.tag import crud_tag
from app.crud.course_tag_link import crud_course_tag_link


router = APIRouter(prefix="/course-tag-link", tags=["course-tag-link"])

# Thêm 1 hoặc nhiều tag vào một khóa học
@router.post("/add-tags")
def add_tags_to_course(
    db: SessionDep,
    tag_list: List[UUID],
    linked_course: UUID,
    current_user: dict = Depends(RoleChecker(["Manager"]))
):
    course = crud_course.get_by_id(db, linked_course)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khóa học không tồn tại"
        )
    added_count = 0
    for tag in tag_list:
        if crud_tag.get_by_id(db, tag) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag không tồn tại"
            )
        if crud_course_tag_link.get_by_id(db, course_id=linked_course, tag_id=tag) is None:
            crud_course_tag_link.create(db, CourseTagLinkCreate(course_id=linked_course, tag_id=tag))
            added_count += 1

    return {
        "status": "success",
        "message": f"Đã thêm {added_count} tag vào khóa học {course.title}"
    }

# Xóa 1 tag khỏi khóa học
@router.delete("/remove_tag")
def remove_tag_from_course(
    db: SessionDep,
    tag_id: UUID,
    course_id: UUID,
    current_user: dict = Depends(RoleChecker(["Manager"]))
):
    course = crud_course.get_by_id(db, course_id)
    if course is None:
        raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
            detail="Khóa học không tồn tại"
        )
    tag = crud_tag.get_by_id(db, tag_id)
    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag không tồn tại"
        )
    if crud_course_tag_link.get_by_id(db, course_id, tag_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag không tồn tại"
        )
    crud_course_tag_link.delete(db, course_id, tag_id)
    return {
        "status": "success",
        "message": f"Đã xóa tag {tag.tag_name} khỏi khóa học {course.title}"
    }

# Lấy danh sách tag của khóa học
@router.get("/get-tag-list/{course_id}", response_model=List[TagName])
def get_tag_list(
    db: SessionDep,
    course_id: UUID,
):
    tag_list = crud_course_tag_link.get_multi_by_course_id(db, course_id)
    return tag_list

# Lấy danh sách môn học có tag
@router.get("/get-course-list", response_model=List[GeneralCourseInfo])
def get_course_list(
    db: SessionDep,
    tag_id: Optional[UUID] = Query(None, description="ID của Tag cần lọc, để trống nếu muốn lấy tất cả khóa học"),
):
    course_list = crud_course_tag_link.get_multi_by_tag_id(db, tag_id=tag_id)
    return course_list