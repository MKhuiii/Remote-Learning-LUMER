from sqlmodel import Session, select, update, func
from app.crud.base import CRUDBase
from uuid import UUID
from app.models.quiz_question import QuizQuestion
from app.schemas.quiz_question import QuizQuestionCreate, QuizQuestionUpdate

class CRUDQuizQuestion(CRUDBase[QuizQuestion, QuizQuestionCreate, QuizQuestionUpdate, UUID]):
    
    def add_questions_to_quiz(
        self, db: Session, *, quiz_id: UUID, questions_in: list[QuizQuestionCreate]
    ) -> list[QuizQuestion]:
        # 1. Lấy ra order_index lớn nhất hiện tại của Quiz này trong DB
        statement = select(func.max(QuizQuestion.order_index)).where(QuizQuestion.quiz_id == quiz_id)
        current_max = db.exec(statement).first()
        
        # Nếu chưa có câu hỏi nào thì bắt đầu từ 0, nếu có thì lấy số lớn nhất
        next_index = current_max if current_max is not None else 0
        
        db_objs = []
        for q in questions_in:
            next_index += 1  # Tự động tăng tiến sau mỗi câu hỏi
            db_obj = QuizQuestion(
                quiz_id=quiz_id,
                question_id=q.question_id,
                order_index=next_index
            )
            db.add(db_obj)
            db_objs.append(db_obj)
            
        db.flush()  # Đẩy dữ liệu vào transaction
        return db_objs
    
    def delete_question_and_reorder(
        self, db: Session, *, quiz_id: UUID, question_id: UUID
    ) -> bool:
        """
        Xóa một câu hỏi ra khỏi Quiz và tự động dời các câu hỏi phía sau lên trước.
        """
        # 1. Tìm bản ghi câu hỏi cần xóa dựa trên cặp Khóa chính (quiz_id, question_id)
        statement = select(QuizQuestion).where(
            QuizQuestion.quiz_id == quiz_id,
            QuizQuestion.question_id == question_id
        )
        target_quiz_question = db.exec(statement).first()

        # Nếu không tìm thấy câu hỏi này trong đề thi, trả về False
        if not target_quiz_question:
            return False

        # Lưu lại vị trí (order_index) của câu hỏi chuẩn bị xóa
        deleted_index = target_quiz_question.order_index

        # 2. Tiến hành xóa câu hỏi mục tiêu
        db.delete(target_quiz_question)
        db.flush()  # Đẩy lệnh xóa vào transaction để giải phóng vị trí

        # 3. Tìm các câu hỏi đứng sau câu hỏi vừa xóa trong cùng một Quiz
        update_statement = select(QuizQuestion).where(
            QuizQuestion.quiz_id == quiz_id,
            QuizQuestion.order_index > deleted_index
        )
        subsequent_questions = db.exec(update_statement).all()

        # 4. Tịnh tiến dời thứ tự hiển thị của các câu hỏi phía sau lên 1 đơn vị
        for q in subsequent_questions:
            q.order_index -= 1
            db.add(q)
            
        db.flush()  # Đồng bộ toàn bộ thay đổi vào transaction hiện tại
        return True

crud_quiz_question = CRUDQuizQuestion(QuizQuestion)