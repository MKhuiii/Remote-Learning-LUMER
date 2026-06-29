from sqlalchemy import create_engine
from app.core.config import settings
from sqlmodel import SQLModel, Session, select, func


engine = create_engine(settings.USERS_DB_URL)

def init_db() -> None:
    import app.models.question
    import app.models.question_option
    import app.models.quiz
    import app.models.quiz_submission
    import app.models.submission_detail 
    SQLModel.metadata.create_all(engine)