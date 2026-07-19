# File: app/schemas/enums.py
from enum import Enum

class CourseType(str, Enum):
    LONG_TERM = "LONG_TERM"
    SHORT_TERM = "SHORT_TERM"

class CurriculumStatus(str, Enum):
    CURRICULUM_DRAFT = "CURRICULUM_DRAFT"
    CURRICULUM_PENDING = "CURRICULUM_PENDING"
    CURRICULUM_ACTIVE = "CURRICULUM_ACTIVE"
    CURRICULUM_ARCHIVED = "CURRICULUM_ARCHIVED"