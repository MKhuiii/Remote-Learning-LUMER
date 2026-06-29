from enum import Enum

class LessonStatus(str, Enum):
    LOCKED = "LOCKED"         # Bài học đang bị khóa (chưa đủ điều kiện học)
    UNLOCKED = "UNLOCKED"     # Đã mở khóa nhưng chưa học
    IN_PROGRESS = "IN_PROGRESS" # Đang học dở dang
    COMPLETED = "COMPLETED"   # Đã hoàn thành hoàn toàn