from enum import Enum

class CourseType(str, Enum):
    LONG_TERM = "LONG_TERM"
    SHORT_TERM = "SHORT_TERM" # Nếu là khóa học ngắn hạn thì khóa học chỉ có một môn học


