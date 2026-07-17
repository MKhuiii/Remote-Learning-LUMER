from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.api.v1.deps import SessionDep
from app.crud.question import crud_question
from app.crud.question_option import crud_question_option
from app.core.security import get_current_user_role
from app.core.config import settings
from app.schemas.question import QuestionCreate, QuestionType, QuestionItem, QuestionUpdate
from app.schemas.question_option import QuestionOptionCreate, QuestionOptionAutoCreate
from app.models.question import Question
from uuid import UUID
import httpx

router = APIRouter(prefix="/questions", tags=["questions"])


def call_check_instructor_service(instructor_id: UUID, subject_id: UUID) -> bool:
    # URL của Course Service (Thay đổi host/port cho đúng với môi trường của bạn)
    COURSE_SERVICE_URL = settings.BACKEND_COURSE_URL
    
    # Chuẩn bị Query Parameters đúng định dạng mà Course Service yêu cầu
    params = {
        "instructor_id": str(instructor_id),
        "subject_id": str(subject_id)
    }
    
    try:
        with httpx.Client() as client:
            response = client.get(f"{COURSE_SERVICE_URL}/syllabus/check-instructor", params=params, timeout=5.0)
            
            if response.status_code == 200:
                return response.json()  # Trả về True hoặc False từ Course Service
                
            return False
    except httpx.RequestError as exc:
        print(f"Lỗi kết nối liên dịch vụ (Course Service): {exc}")
        # Nếu service kia sập, an toàn nhất là chặn lại và báo lỗi hệ thống
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hệ thống xác thực môn học đang bận, vui lòng thử lại sau."
        )
@router.get("/get-list/{subject_id}", response_model=List[QuestionItem])
def get_questions_list(
    db: SessionDep,
    subject_id: UUID,
    current_user: dict = Depends(get_current_user_role)
):
    user_id = UUID(current_user["user_id"])
    
    is_instructor = call_check_instructor_service(instructor_id=user_id, subject_id=subject_id)
    
    # Nếu không phải là giảng viên phụ trách môn này, chặn ngay lập tức
    if not is_instructor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không phải giảng viên phụ trách môn học này để xem ngân hàng câu hỏi."
        )

    questions = crud_question.get_by_subject_id(db, subject_id=subject_id)
    return questions

@router.post("/")
def create_question(
    db: SessionDep,
    question: QuestionCreate,
    question_opts: Optional[List[QuestionOptionAutoCreate]] = None,
    current_user: dict = Depends(get_current_user_role)
):
    user_id = current_user["user_id"]
    subject_id = question.subject_id
    is_instructor = call_check_instructor_service(instructor_id=user_id, subject_id=subject_id)
    
    # Nếu không phải là giảng viên phụ trách môn này, chặn ngay lập tức
    if not is_instructor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không phải giảng viên phụ trách môn học này để xem ngân hàng câu hỏi."
        )
        
    # 1. Tạo câu hỏi trước
    ques = crud_question.create(db, question)
    question_id = ques.question_id
    
    # 2. Kiểm tra và tạo danh sách các lựa chọn (options) kèm theo một cách an toàn
    if question_opts:
        for opt_in in question_opts:
            new_opt = QuestionOptionCreate(
                question_id=question_id,
                option_text=opt_in.option_text,
                is_correct=opt_in.is_correct
            )
            crud_question_option.create(db, new_opt)

    return {
        "status": "success",
        "message": "Tạo câu hỏi thành công!",
        "question_id": ques.question_id
    }
@router.patch("/{question_id}")
def update_question(
    db: SessionDep,
    question_id: UUID,
    new_question: QuestionUpdate,
    current_user = Depends(get_current_user_role)
):
    # 1. Tìm câu hỏi hiện tại trong DB, nếu không thấy thì báo lỗi 404 ngay
    db_question = crud_question.get_by_id(db, question_id)
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy câu hỏi yêu cầu."
        )
        
    # 2. Lấy subject_id trực tiếp từ bản ghi câu hỏi vừa tìm được
    user_id = current_user["user_id"]
    subject_id = db_question.subject_id 
    
    # 3. Kiểm tra quyền giảng viên
    is_instructor = call_check_instructor_service(instructor_id=user_id, subject_id=subject_id)
    if not is_instructor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không phải giảng viên phụ trách môn học này để chỉnh sửa câu hỏi."
        )
    
    # 4. TRUYỀN ĐÚNG BẢN GHI `db_question` VÀO HÀM UPDATE
    crud_question.update(db, db_obj=db_question, obj_in=new_question)
    
    return {
        "status": "success",
        "message": "Update thành công câu hỏi!"
    }
# @router.path