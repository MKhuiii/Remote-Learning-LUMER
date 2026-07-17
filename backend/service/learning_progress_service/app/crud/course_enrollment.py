from app.crud.base import CRUDBase
from uuid import UUID
from sqlmodel import Session, select, func
from app.models.course_enrollment import CourseEnrollment
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateCreate
from app.schemas.course_enrollment import CourseEnrollmentCreate, CourseEnrollmentUpdate
from app.crud.certificate import crud_certificate
from datetime import datetime, timezone
import httpx
from app.core.config import settings

class CRUDCourseEnrollment(CRUDBase[CourseEnrollment, CourseEnrollmentCreate, CourseEnrollmentUpdate, UUID]):
    # Kiểm tra người dùng đã đăng ký khóa học chưa
    def check_already_enrolled(self, db: Session, user_id: UUID, course_id: UUID) -> bool:
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        )
        result = db.exec(statement).first()
        return result is not None
    
    def get_by_user_and_course(self, db: Session, user_id: UUID, course_id: UUID) -> CourseEnrollment | None:
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id == user_id, 
            CourseEnrollment.course_id == course_id
        )
        return db.exec(statement).first()
    
    def get_multi_by_user_id(self, db: Session, user_id: UUID):
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id== user_id
        )
        return db.exec(statement).all()
    def get_by_user_in_progress(self, db: Session, user_id: UUID) -> list[CourseEnrollment]:
        statement = select(CourseEnrollment.course_id).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.is_completed == False
        )
        return db.exec(statement).all()
    
    def get_by_user_completed(self, db: Session, user_id: UUID) -> list[CourseEnrollment]:
        statement = select(CourseEnrollment.course_id).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.is_completed == True,
            CourseEnrollment.current_overall_progress == 100
        )
        return db.exec(statement).all()
    
    def get_overrall_progress(self, db: Session, user_id: UUID, course_id: UUID) -> float:
        statement = select(CourseEnrollment.current_overall_progress).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.course_id == course_id
        )
        return db.exec(statement).first()
    
    def get_overrall_progress_by_enroll(self, db: Session, enrollment_id: UUID) -> float:
        statement = select(CourseEnrollment.current_overall_progress).where(
            CourseEnrollment.enrollment_id == enrollment_id
        )
        return db.exec(statement).first()
    
    def get_course_id(self, db: Session, enrollment_id: UUID) -> UUID:
        statement = select(CourseEnrollment.course_id).where(
            CourseEnrollment.enrollment_id == enrollment_id
        )
        return db.exec(statement).first()

    def get_history_by_user(self, db: Session, user_id: UUID, is_completed: bool):
        statement = select(CourseEnrollment).where(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.is_completed == is_completed
        )
        return db.exec(statement).all()
    
    def update_progress(self, db: Session, db_obj: CourseEnrollment, progress: float) -> CourseEnrollment:
        db_obj.current_overall_progress = min(max(progress, 0.0), 100.0) # Đảm bảo tiến độ từ 0 - 100
        
        if db_obj.current_overall_progress >= 100.0 and not db_obj.is_completed:
            db_obj.is_completed = True
            db_obj.completed_at = datetime.now(timezone.utc)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_overall_progress(
    self, db: Session, db_obj: CourseEnrollment, progress: float, is_completed: bool
) -> CourseEnrollment:
        # 1. Cập nhật tiến độ học tập như bình thường
        db_obj.current_overall_progress = progress
        db_obj.is_completed = is_completed
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # 2. Điều kiện: Tiến độ đạt >= 100 hoặc cờ hoàn thành được đánh dấu là True
        if progress >= 100 or is_completed:
            try:
                # Import cục bộ để tránh vòng lặp import (Circular Import)
                from app.crud.certificate import crud_certificate 
                from app.schemas.certificate import CertificateCreate 
                
                enrollment_id = db_obj.enrollment_id 
                user_id = db_obj.user_id
                course_id = self.get_course_id(db, enrollment_id)

                # Kiểm tra xem lượt đăng ký này đã từng được cấp chứng chỉ chưa để tránh trùng lặp
                existing_cert = crud_certificate.get_by_enrollment_id(db, enrollment_id=enrollment_id)
                
                if not existing_cert:
                    # Thiết lập các giá trị mặc định dự phòng nếu gọi API thất bại
                    full_name = "Thành viên hệ thống"
                    course_name = "Khóa học trực tuyến"

                    # Sử dụng HTTPX Client để gọi API liên service (Inter-service communication)
                    with httpx.Client(timeout=5.0) as client:
                        # 2.1. Gọi API lấy tên người dùng từ USER SERVICE
                        try:
                            user_api_url = f"{settings.BACKEND_USER_URL.rstrip('/')}/get-name/{user_id}"
                            user_response = client.get(user_api_url)
                            if user_response.status_code == 200:
                                # Đảm bảo API trả về chuỗi trực tiếp hoặc JSON chứa tên, ví dụ: "Nguyễn Văn A" 
                                # Nếu API trả về dạng JSON {"name": "..."} thì sửa thành user_response.json().get("name")
                                full_name = user_response.json() if isinstance(user_response.json(), str) else user_response.json().get("name", "Thành viên hệ thống")
                        except Exception as e_user:
                            print(f"[CẢNH BÁO] Không lấy được tên user từ User Service: {str(e_user)}")

                        # 2.2. Gọi API lấy tên khóa học từ COURSE SERVICE
                        try:
                            course_api_url = f"{settings.BACKEND_COURSE_URL.rstrip('/')}/courses/title/{course_id}"
                            course_response = client.get(course_api_url)
                            if course_response.status_code == 200:
                                # Tương tự, nếu API trả về chuỗi trực tiếp hoặc JSON
                                course_name = course_response.json() if isinstance(course_response.json(), str) else course_response.json().get("course_title", "Khóa học trực tuyến")
                        except Exception as e_course:
                            print(f"[CẢNH BÁO] Không lấy được tên khóa học từ Course Service: {str(e_course)}")

                    # 3. Tạo payload data cho chứng chỉ mới với đầy đủ các trường bắt buộc
                    new_cert_data = CertificateCreate(
                        enrollment_id=enrollment_id,
                        user_id=user_id,
                        full_name=full_name,
                        course_name=course_name
                    )
                    
                    # Gọi hàm lưu chứng chỉ vào database
                    crud_certificate.create(db, new_cert_data)
                    print(f"--- [HỆ THỐNG CRITICAL] Tự động cấp chứng chỉ thành công cho User {user_id} ({full_name}) ---")
                    
            except Exception as e:
                # Tránh crash tiến trình chính nếu tầng chứng chỉ gặp sự cố
                print(f"Lỗi hệ thống khi tự động cấp chứng chỉ: {str(e)}")

        return db_obj
    def get_general_statistics(self, db: Session, user_id: UUID) -> dict:
        """
        Tính toán các thông số thống kê khóa học và chứng chỉ của user
        """
        # 1. Đếm số khóa học đang học (is_completed = False)
        inprogress_stmt = (
            select(func.count(CourseEnrollment.enrollment_id))
            .where(CourseEnrollment.user_id == user_id)
            .where(CourseEnrollment.is_completed == False)
        )
        inprogress_courses = db.exec(inprogress_stmt).one()

        # 2. Đếm số khóa học đã hoàn thành (is_completed = True)
        completed_stmt = (
            select(func.count(CourseEnrollment.enrollment_id))
            .where(CourseEnrollment.user_id == user_id)
            .where(CourseEnrollment.is_completed == True)
        )
        completed_courses = db.exec(completed_stmt).one()

        # 3. Đếm số lượng chứng chỉ mà user đang sở hữu thông qua quan hệ Join 1-1
        certificate_stmt = (
            select(func.count(Certificate.certificate_id))
            .join(CourseEnrollment, CourseEnrollment.enrollment_id == Certificate.enrollment_id)
            .where(CourseEnrollment.user_id == user_id)
        )
        
        try:
            certificate_count = db.exec(certificate_stmt).one()
        except Exception:
            # Dự phòng nếu DB của bạn chưa đồng nhất cấu trúc, lấy tạm số lượng đã hoàn thành làm số chứng chỉ
            certificate_count = completed_courses

        return {
            "inprogress_courses": inprogress_courses,
            "completed_courses": completed_courses,
            "certificate": certificate_count
        }

crud_course_enrollment = CRUDCourseEnrollment(CourseEnrollment)