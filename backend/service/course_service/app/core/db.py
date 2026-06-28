from sqlalchemy import create_engine
from app.core.config import settings
from sqlmodel import SQLModel, Session, select, func
from app.models.status_catalog import StatusCatalog


engine = create_engine(settings.USERS_DB_URL)

def init_db() -> None:
    import app.models.status_catalog
    import app.models.course_tag_link
    import app.models.course
    import app.models.curriculum
    import app.models.subject
    import app.models.syllabus
    import app.models.tag
    SQLModel.metadata.create_all(engine)