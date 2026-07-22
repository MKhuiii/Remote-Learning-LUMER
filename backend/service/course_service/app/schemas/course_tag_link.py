from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class CourseTagLinkBase(BaseModel):
    course_id: UUID
    tag_id: UUID

class CourseTagLinkCreate(CourseTagLinkBase):
    pass

class CourseTagLinkUpdate(CourseTagLinkBase):
    pass

