from fastapi import APIRouter, HTTPException
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectRead
from app.crud.subject import crud_subject

router = APIRouter(prefix="/subjects", tags=["subjects"])

@router.post("/", response_model=SubjectRead)
def create_subject(subject_in: SubjectCreate, db: SessionDep):
    return crud_subject.create(db, subject_in)

@router.get("/{subject_id}", response_model=SubjectRead)
def get_subject(subject_id: UUID, db: SessionDep):
    subject = crud_subject.get_by_id(db, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.get("/", response_model=list[SubjectRead])
def get_subjects(db: SessionDep, skip: int = 0, limit: int = 10):
    return crud_subject.get_multi(db, skip=skip, limit=limit)

@router.put("/{subject_id}", response_model=SubjectRead)
def update_subject(subject_id: UUID, subject_in: SubjectUpdate, db: SessionDep):
    db_obj = crud_subject.get_by_id(db, subject_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return crud_subject.update(db, db_obj, subject_in)

@router.delete("/{subject_id}")
def delete_subject(subject_id: UUID, db: SessionDep):
    db_obj = crud_subject.delete(db, subject_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"msg": "Subject deleted successfully"}


# 🟣 Lấy tất cả Subject theo Course ID
@router.get("/by-course/{course_id}", response_model=list[SubjectRead])
def get_subjects_by_course(course_id: UUID, db: SessionDep):
    subjects = crud_subject.get_by_course(db, course_id)
    if not subjects:
        raise HTTPException(status_code=404, detail="No subjects found for this course")
    return subjects