import uuid
from uuid import UUID
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.peer_review_evaluations import PeerReviewEvaluation

# Model khung chấm điểm mẫu (Ví dụ: Tiêu chí 1: Đúng đề bài - 5đ, Tiêu chí 2: Sáng tạo - 5đ)
class RubricCriteria(SQLModel, table=True):
    __tablename__ = "rubric_criteria"

    criteria_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quiz_id: UUID = Field(foreign_key="quiz.quiz_id", nullable=False, ondelete="CASCADE") # Liên kết với đề kiểm tra tự luận
    
    title: str = Field(nullable=False)               # Tên tiêu chí (ví dụ: "Bố cục bài viết")
    description: Optional[str] = Field(default=None) # Hướng dẫn chấm cho học viên
    max_score: float = Field(nullable=False)          # Điểm tối đa của tiêu chí này
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    quiz: Optional["Quiz"] = Relationship(back_populates="rubric_criterias")
    evaluations: List["PeerReviewEvaluation"] = Relationship(back_populates="criteria")