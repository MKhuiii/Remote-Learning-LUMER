export type SubjectStatus =
  | "SUBJECT_ACTIVE"
  | "SUBJECT_DEVELOPING"
  | "SUBJECT_SUSPENDED";

// Enum lấy từ TYPE questiontype trong CSDL
export type QuestionTypeEnum = "MULTIPLE_CHOICE" | "ESSAY";

export interface SubjectInfo {
  subject_id: string; // uuid (Khóa chính)
  course_id?: string; // uuid (Khóa ngoại liên kết bảng course)
  title: string; // Tên môn học
  code?: string; // Mã môn học (ví dụ: INT311)
  description?: string; // Mô tả chi tiết môn học
  instructor?: string; // Tên giảng viên phụ trách
  image?: string; // URL hình ảnh đại diện
  order_index?: number; // Thứ tự hiển thị
  status_id: SubjectStatus; // Trạng thái môn học
}
// Bảng question_option
export interface QuestionOption {
  option_id: string; // uuid
  question_id: string; // uuid
  option_text: string;
  is_correct: boolean;
}

// Bảng question
export interface Question {
  question_id: string; // uuid
  subject_id: string; // uuid (liên kết với courses_db)
  question_type: QuestionTypeEnum;
  content: string; // HTML từ RichTextEditor
  max_points: number; // Điểm tối đa
  options?: QuestionOption[]; // Danh sách đáp án nếu là MULTIPLE_CHOICE
}
