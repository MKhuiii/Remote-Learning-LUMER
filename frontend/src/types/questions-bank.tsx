// Enum lấy từ TYPE questiontype trong CSDL
export type QuestionTypeEnum = "MULTIPLE_CHOICE" | "ESSAY";

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
