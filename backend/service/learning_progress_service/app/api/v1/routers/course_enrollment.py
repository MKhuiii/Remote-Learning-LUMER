from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import List
from app.core.config import settings
from app.core.security import get_current_user_role
from app.crud.course_enrollment import crud_course_enrollment
from app.api.v1.deps import SessionDep
from app.schemas.course_enrollment import CourseInProgress
from uuid import UUID
import httpx

router = APIRouter(prefix="/course_enrollment", tags=["course_enrollment"])

# Lấy danh sách khóa học người học đang trong quá trình học hoặc đã hoàn thành
@router.get("/{is_completed}", response_model=List[CourseInProgress])
async def get_progress_list(
    request: Request,
    db: SessionDep,
    is_completed: bool,
    current_user: dict = Depends(get_current_user_role)
):
    user_id = current_user["user_id"]
    
    if is_completed is True:
        enrolled_ids = crud_course_enrollment.get_by_user_completed(db, user_id=user_id)
    else:
        enrolled_ids = crud_course_enrollment.get_by_user_in_progress(db, user_id=user_id)
    
    if not enrolled_ids:
        return []

    result: List[CourseInProgress] = []
    token = request.headers.get("Authorization")
    headers = {"Authorization": token} if token else {}

    # 2. Duyệt qua từng ID và thực hiện gọi HTTP request đơn lẻ
    async with httpx.AsyncClient() as client:
        for course_id in enrolled_ids:
            # Đường dẫn trỏ đích danh tới endpoint xử lý đơn lẻ vừa viết ở trên
            course_service_url = f"{settings.BACKEND_COURSE_URL}/courses/title/{course_id}"
            try:
                response = await client.get(course_service_url, headers=headers, timeout=5.0)
                
                if response.status_code == 200:
                    # Vì Course Service chỉ trả về một chuỗi thường (str)
                    course_title = response.json() 
                else:
                    course_title = "Khóa học không xác định"
            except httpx.RequestError:
                course_title = "Lỗi kết nối hệ thống"

            # Đóng gói dữ liệu đầu ra cho từng thực thể
            result.append(
                CourseInProgress(
                    course_title=course_title,
                    current_overall_progress=crud_course_enrollment.get_overrall_progress(db, user_id, course_id) # Tiến độ tính toán sau
                )
            )
            
    return result

# Đăng ký khóa học 
@router.post("/")
async def enroll_course(
    db: SessionDep,
    course_id: UUID,
    current_user: dict = Depends(get_current_user_role)
):
    user_id = current_user["user_id"]

    course_service_url = f"{settings.BACKEND_COURSE_URL}/courses/is-existed-course/{course_id}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(course_service_url, timeout=5.0)
            
            # Nếu Course Service trả về mã lỗi (404, 500, v.v.)
            if response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Không thể xác thực thông tin khóa học từ hệ thống."
                )
                
            # Đọc kết quả 
            course_exists = response.json() 
            if not course_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Khóa học không tồn tại trên hệ thống."
                )
        except httpx.RequestError:
            # Xử lý trường hợp Course Service bị sập hoặc nghẽn mạng không phản hồi
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Dịch vụ quản lý khóa học tạm thời không hoạt động."
            )


    is_user_enrolled = crud_course_enrollment.check_already_enrolled(db, user_id=user_id, course_id=course_id)
    if is_user_enrolled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Đã tồn tại thì nên dùng 400 thay vì 404
            detail="Người dùng đã đăng ký khóa học này rồi."
        )
        
    
    enroll = crud_course_enrollment.create(db, {"user_id": user_id, "course_id": course_id})
    return {"detail": "Đăng ký khóa học thành công", "enrollment": enroll}