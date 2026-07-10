from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date

class LessonCreate(BaseModel):
    module_id: UUID
    title: str
    video_url: str | None = None
    content_body: str | None = None
    duration_minutes: int | None = None
    order_index: int
    is_optinal: bool | None = None

class LessonUpdate(BaseModel):
    title: str | None = None
    video_url: str | None = None
    duration_minutes: int | None = None
    content_body: str | None = None
    order_index: int | None = None
    is_optional: bool | None = None