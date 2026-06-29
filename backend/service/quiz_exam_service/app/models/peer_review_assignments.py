import uuid
from uuid import UUID
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.enum import ReviewStatus

if TYPE_CHECKING:
    from models.peer_review_evaluations import PeerReviewEvaluation

class PeerReviewAssignment(SQLModel, table=True):
    __tablename__ = "peer_review_assignments"

    assignment_id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    quiz_id: UUID = Field(nullable=False, index=True)
    
    reviewer_id: UUID = Field(nullable=False, index=True)      # ID người chấm (Học viên A)
    submission_id: UUID = Field(foreign_key="quiz_submissions.submission_id", index=True) # Bài nộp của học viên B
    
    status: ReviewStatus = Field(default=ReviewStatus.PENDING)
    final_score_given: Optional[float] = Field(default=None)   # Tổng điểm sau khi chấm bài này
    general_comment: Optional[str] = Field(default=None)      # Nhận xét chung cho cả bài
    
    assigned_at: date = Field(default_factory=date.today)
    completed_at: Optional[date] = Field(default=None)

    # Quan hệ
    evaluations: List["PeerReviewEvaluation"] = Relationship(back_populates="assignment")