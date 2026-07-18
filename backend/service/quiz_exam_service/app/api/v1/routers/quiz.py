from fastapi import APIRouter, HTTPException, status, Depends
from app.core.db import settings
from app.api.v1.deps import SessionDep
from app.core.security import get_current_user_role
from app.crud.quiz import crud_quiz
from app.schemas.quiz import QuizCreate
from app.models.enum import QuizType
from app.schemas.quiz_question import QuizQuestionCreate
from app.schemas.quiz_pool_rule import QuizPoolRuleCreate
from uuid import UUID
import httpx
from app.crud.quiz_question import crud_quiz_question
from app.crud.quiz_pool_rule import crud_quiz_pool_rule

router = APIRouter(tags=["quizzes"])

COURSE_SERVICE_URL = settings.BACKEND_COURSE_URL

@router.get("/{lesson_id}/had-quiz")
def is_lesson_had_quiz(
    db: SessionDep,
    lesson_id: UUID
):
    return crud_quiz.is_lesson_had_quiz(db, lesson_id)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_initial_quiz(
    db: SessionDep, 
    obj_in: QuizCreate,
    current_user: dict = Depends(get_current_user_role)
):
    """
    API khởi tạo đề thi (Quiz) ban đầu.
    """
    # Nếu client có truyền bài học để gắn đề thi vào
    if obj_in.target_lesson_id:
        try:
            # Gửi request GET tới endpoint kiểm tra của Course Service
            response = httpx.get(f"{COURSE_SERVICE_URL}/lessons/is-existed/{obj_in.target_lesson_id}", timeout=5.0)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Không thể xác thực thông tin bài học do lỗi từ Course Service."
                )
                
            # Đọc kết quả boolean trả về từ API đích
            is_lesson_existed = response.json()
            
            if not is_lesson_existed:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Bài học với ID {obj_in.target_lesson_id} không tồn tại trên hệ thống."
                )
                
        except httpx.RequestError as exc:
            # Xử lý trường hợp mạng lỗi hoặc Course Service bị sập không phản hồi
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Kết nối tới Course Service thất bại: {exc}"
            )

        # 1. Validate: Kiểm tra xem bài học này đã được gắn đề thi nào chưa
        if crud_quiz.is_lesson_had_quiz(db, lesson_id=obj_in.target_lesson_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bài học với ID {obj_in.target_lesson_id} đã được cấu hình đề thi trước đó."
            )

    # 2. Gọi tầng CRUD độc lập để khởi tạo đối tượng Quiz
    db_quiz = crud_quiz.create(db, obj_in=obj_in)

    # 3. Trả về thông tin Quiz vừa tạo (Bao gồm cả quiz_id hệ thống tự sinh)
    return {
        "status": "success",
        "message": "Khởi tạo khung đề thi thành công!",
        "data": {
            "quiz_id": db_quiz.quiz_id,
            "title": db_quiz.title,
            "quiz_type": db_quiz.quiz_type,
            "created_at": db_quiz.created_at
        }
    }

@router.post("/{quiz_id}/questions", status_code=status.HTTP_200_OK)
def add_fixed_questions(
    db: SessionDep, 
    quiz_id: UUID, 
    obj_in: list[QuizQuestionCreate],
    current_user: dict = Depends(get_current_user_role)
):
    """
    API bổ sung câu hỏi cố định vào đề thi (Dành cho FIXED_QUESTION).
    """
    # Kiểm tra xem Quiz có tồn tại không
    db_quiz = crud_quiz.get_by_id(db, id=quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin đề thi.")
        
    # Bảo vệ logic: Đề thi ngẫu nhiên thì không được gán câu hỏi cố định
    if db_quiz.quiz_type != QuizType.FIXED_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Đề thi này được cấu hình ở dạng RANDOM_QUESTION, không thể thêm câu hỏi cố định."
        )

    # Thực thi lưu thông qua CRUD độc lập
    crud_quiz_question.add_questions_to_quiz(db, quiz_id=quiz_id, questions_in=obj_in)
    db.commit()
    
    return {"status": "success", "message": "Đã thêm danh sách câu hỏi và tự động sắp xếp thứ tự hiển thị thành công."}


@router.post("/{quiz_id}/pool-rules", status_code=status.HTTP_200_OK)
def add_pool_rules(db: SessionDep, quiz_id: UUID, obj_in: list[QuizPoolRuleCreate]):
    """
    API bổ sung luật bốc ngân hàng câu hỏi (Dành cho RANDOM_QUESTION).
    """
    db_quiz = crud_quiz.get_by_id(db, id=quiz_id)
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin đề thi.")
        
    # Bảo vệ logic: Đề thi cố định thì không được gắn luật bốc ngẫu nhiên
    if db_quiz.quiz_type != QuizType.RANDOM_QUESTION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Đề thi này được cấu hình ở dạng FIXED_QUESTION, không thể thiết lập luật bốc pool ngẫu nhiên."
        )

    crud_quiz_pool_rule.add_rules_to_quiz(db, quiz_id=quiz_id, rules_in=obj_in)
    db.commit()
    
    return {"status": "success", "message": "Đã thiết lập cấu hình luật bốc câu hỏi từ ngân hàng câu hỏi"}
