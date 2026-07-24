from app.crud.base import CRUDBase
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.subject import Subject
from app.models.course import Course
from app.schemas.lesson import LessonCreate, LessonUpdate
from uuid import UUID
from sqlmodel import Session, select

class CRUDLesson(CRUDBase[Lesson, LessonCreate, LessonUpdate, UUID]):
    
    def create(self, db: Session, obj_in: LessonCreate) -> Lesson:
        
        db_obj = self.model.model_validate(obj_in)
        
        # 1. Logic nghiệp vụ: Nếu là bài thi/kiểm tra thì bắt buộc không được tự chọn
        if db_obj.is_quiz:
            db_obj.is_optional = False

        db.add(db_obj)
        db.flush()  # Đẩy dữ liệu xuống DB tạm thời để lấy ID nếu cần, chưa commit

        # 2. Tìm course_id thông qua module_id của lesson mới tạo
        course_id = db.scalar(
            select(Subject.course_id)
            .join(Module, Subject.subject_id == Module.subject_id)
            .where(Module.module_id == db_obj.module_id)
        )

        # 3. Tăng total_lessons của Course lên 1 đơn vị
        if course_id:
            course = db.get(Course, course_id)
            if course:
                course.total_lessons += 1
                db.add(course)

        # 4. Commit toàn bộ thay đổi cùng một lúc
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: UUID) -> Lesson | None:
        # 1. Lấy thông tin bài học trước khi xóa để biết nó thuộc module nào
        db_obj = db.get(self.model, id)
        if not db_obj:
            return None

        # 2. Tìm course_id tương tự như lúc tạo
        course_id = db.scalar(
            select(Subject.course_id)
            .join(Module, Subject.subject_id == Module.subject_id)
            .where(Module.module_id == db_obj.module_id)
        )

        # 3. Giảm total_lessons của Course đi 1 đơn vị
        if course_id:
            course = db.get(Course, course_id)
            if course and course.total_lessons > 0:
                course.total_lessons -= 1
                db.add(course)

        # 4. Xóa bài học và commit toàn bộ
        db.delete(db_obj)
        db.commit()
        return db_obj

# Đổi tên biến cho đúng ngữ cảnh của Lesson
crud_lesson = CRUDLesson(Lesson)