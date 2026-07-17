from sqlmodel import Session, select
from app.crud.base import CRUDBase
from uuid import UUID
from app.models.question_option import QuestionOption
from app.schemas.question_option import QuestionOptionCreate, QuestionOptionUpdate

class CRUDQuestionOption(CRUDBase[QuestionOption, QuestionOptionCreate, QuestionOptionUpdate, UUID]):
    def create(self, db: Session, obj_in: QuestionOptionCreate) -> QuestionOption:
        # 1. Nếu option hiện tại đang được đánh dấu là đáp án đúng (is_correct == True)
        if obj_in.is_correct:
            # Truy vấn tìm xem đã có option nào thuộc câu hỏi này (question_id) được đánh dấu là True chưa
            statement = (
                select(self.model)  # self.model ở đây chính là QuestionOption
                .where(self.model.question_id == obj_in.question_id)
                .where(self.model.is_correct == True)
            )
            existing_correct = db.exec(statement).first()
            
            # 2. Nếu đã tồn tại đáp án đúng rồi, ép thuộc tính is_correct của option mới này về False
            if existing_correct is not None:
                obj_in.is_correct = False
                
        # 3. Gọi hàm create gốc của CRUDBase để tự động map dữ liệu, add, commit và refresh
        return super().create(db, obj_in)
    def get_question_id(self, db: Session, option_id: UUID) -> UUID:
        statement = select(QuestionOption.question_id).where(
            QuestionOption.option_id == option_id
        )
        return db.exec(statement).first()
crud_question_option = CRUDQuestionOption(QuestionOption)

