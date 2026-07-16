from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from app.models.course_instructor_link import CourseInstructorLink
from pydantic import BaseModel
from app.api.v1.deps import SessionDep

class CourseInstructorLinkCreate(BaseModel):
    course_id: UUID
    instructor_id: UUID

router = APIRouter(prefix="/assignment", tags=["assignment"])

@router.post("/course-instructor-link/")
def upload_assignment(
    *, 
    db: SessionDep, 
    link_in: CourseInstructorLinkCreate
):
    try:
        # Khởi tạo object map dữ liệu
        db_obj = CourseInstructorLink(
            course_id=link_in.course_id,
            instructor_id=link_in.instructor_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    except Exception as e:
        db.rollback()
        # 🟢 IN LOG LỖI CHI TIẾT RA TERMINAL CỦA UVICORN ĐỂ DEV THEO DÕI
        print("❌ DB COMMIT ERROR DETAILED:", str(e))
        
        # Trả lỗi cụ thể về cho Next.js hiển thị alert
        raise HTTPException(
            status_code=400, 
            detail=f"Lỗi hệ thống cơ sở dữ liệu: {str(e)}"
        )