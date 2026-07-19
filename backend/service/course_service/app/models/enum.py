from enum import Enum

class CourseType(str, Enum):
    LONG_TERM = "LONG_TERM"
    SHORT_TERM = "SHORT_TERM" # Nếu là khóa học ngắn hạn thì khóa học chỉ có một môn học

# 1. TRẠNG THÁI CỦA CHƯƠNG TRÌNH ĐÀO TẠO (CURRICULUM)
class CurriculumStatus(str, Enum):
    DRAFT = "CURRICULUM_DRAFT"
    PENDING = "CURRICULUM_PENDING"
    ACTIVE = "CURRICULUM_ACTIVE"
    ARCHIVED = "CURRICULUM_ARCHIVED"


# 2. TRẠNG THÁI CỦA ĐỀ CƯƠNG MÔN HỌC (SYLLABUS)
class SyllabusStatus(str, Enum):
    DRAFT = "SYLLABUS_DRAFT"
    REVIEWING = "SYLLABUS_REVIEWING"
    APPROVED = "SYLLABUS_APPROVED"
    REJECTED = "SYLLABUS_REJECTED"


# 3. TRẠNG THÁI CỦA MÔN HỌC / HỌC PHẦN (SUBJECT)
class SubjectStatus(str, Enum):
    DEVELOPING = "SUBJECT_DEVELOPING"
    ACTIVE = "SUBJECT_ACTIVE"
    SUSPENDED = "SUBJECT_SUSPENDED"


# 4. TRẠNG THÁI CỦA KHÓA HỌC / LỚP HỌC PHẦN (COURSE)
class CourseStatus(str, Enum):
    REGISTRATION = "COURSE_REGISTRATION"
    UPCOMING = "COURSE_UPCOMING"
    ONGOING = "COURSE_ONGOING"
    COMPLETED = "COURSE_COMPLETED"