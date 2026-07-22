export interface Lesson {
  lesson_id: string;
  module_id: string;
  title: string;
  duration: string;
  video_url?: string | null;
}

// 🟢 2. Cấu trúc chương học (Module) chứa danh sách bài học
export interface Module {
  module_id: string;
  course_id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  course_id: string;
  curriculum_id: string;
  instructor_id: string;
  title: string;
  course_type: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at?: string;
  status_id: string;
  assigner_id?: string;
  modules?: Module[];
}

export interface CurriculumCreatePayload {
  curriculum_name: string;
  description: string;
  course_type: string;
  course_finished_months: number;
  certificate_name: string;
  status_id: string;
  curriculum_file_path: string;
}

export enum CourseType {
  SHORT_TERM = "SHORT_TERM",
  LONG_TERM = "LONG_TERM",
}

export interface GeneralCourseInfo {
  course_id: string;
  title: string;
  description: string;
  price: number;
  course_type?: string;   // "LONG" | "SHORT"
  is_long_term?: boolean;
  enrollment_count?: number;
  tags: string[];         // Mảng tên tag ["Python", "FastAPI"]
}

export interface CourseSearchPaginatedResponse {
  items: GeneralCourseInfo[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface CourseSearchParams {
  q?: string;
  tag_id?: string;
  course_type?: CourseType;
  max_price?: number;
  page?: number;
  size?: number;
}

export interface FeaturedCoursesResponse {
  success: boolean;
  data: GeneralCourseInfo[];
}