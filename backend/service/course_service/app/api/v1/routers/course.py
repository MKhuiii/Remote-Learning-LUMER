from fastapi import APIRouter, HTTPException
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead
from app.crud.course import crud_course

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("/", response_model=CourseRead)
def create_course(course_in: CourseCreate, db: SessionDep):
    return crud_course.create(db, course_in)

@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: UUID, db: SessionDep):
    course = crud_course.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/", response_model=list[CourseRead])
def get_courses(db: SessionDep, skip: int = 0, limit: int = 10):
    return crud_course.get_multi(db, skip=skip, limit=limit)

@router.put("/{course_id}", response_model=CourseRead)
def update_course(course_id: UUID, course_in: CourseUpdate, db: SessionDep):
    db_obj = crud_course.get_by_id(db, course_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud_course.update(db, db_obj, course_in)

@router.delete("/{course_id}")
def delete_course(course_id: UUID, db: SessionDep):
    db_obj = crud_course.delete(db, course_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"msg": "Course deleted successfully"}
