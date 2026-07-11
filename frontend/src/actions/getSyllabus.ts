'use server'

import { cookies } from 'next/headers'

const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// ==========================================
// ĐỊNH NGHĨA INTERFACES (Đã đồng bộ TypeScript)
// ==========================================

export interface Subject {
  subject_id: string;
  course_id: string;
  title: string;
  description?: string;
  status_id?: string;
  subject_name?: string;
  order_index?: number;
}

export interface Course {
  course_id: string;
  title: string;
  description?: string;
  status_id?: string;
  instructor_id?: string | null;       // 🟢 Sửa từ 'string | null' thành optional để khớp với API (Tránh lỗi Type ở hình 2)
  curriculum_id: string;               // Khóa ngoại kết nối
  curriculum_file_path?: string | null; // Sẽ được map chéo từ dữ liệu Curriculum gốc
  subjects: Subject[];                 // Danh sách chương học con
}

export interface Curriculum {
  curriculum_id: string;
  title?: string;
  description?: string;                // 🟢 Thêm dấu '?' để chấp nhận cả undefined (Tránh lỗi Type ở hình 3)
  curriculum_file_path?: string | null;
  status_id?: string;
}


// --- PHẦN ĐỊNH NGHĨA THÊM INTERFACES ---
export interface CourseModule {
  module_id: string;
  subject_id: string;
  title: string;
  order_index?: number;
  lessons?: CourseLesson[]; // Chứa danh sách bài học con bên trong
}

export interface CourseLesson {
  lesson_id: string;
  module_id: string;
  title: string;
  video_url?: string;
  content_body?: string;
  duration_minutes?: number;
  order_index?: number;
  is_optional?: boolean;
}





// ==========================================
// CÁC HÀM XỬ LÝ ACTIONS
// ==========================================

/**
 * Lấy danh sách toàn bộ khóa học cùng đề cương chi tiết 
 * (Đã được map chéo file từ Curriculum và gom nhóm toàn bộ Subjects)
 */
export async function getCoursesAction(token: string): Promise<Course[]> {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    // 🟢 Bước 1: Fetch song song đồng thời cả 3 thực thể: Courses, Curriculums và Subjects
    const [coursesResponse, curriculumsResponse, subjectsResponse] = await Promise.all([
      fetch(`${userBackendUrl}/courses/`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
      }),
      fetch(`${userBackendUrl}/curriculums/`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
      }),
      fetch(`${userBackendUrl}/subjects/`, { // <-- Gọi thêm endpoint lấy tất cả các chương học con để giải quyết việc UI rỗng
        method: "GET",
        headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
      }).catch(() => null) // Bọc catch phòng trường hợp API /subjects/ bị lỗi đơn lẻ không làm sập luồng chính
    ]);

    if (!coursesResponse.ok) {
      throw new Error(`Không thể lấy danh sách khóa học: ${coursesResponse.status}`);
    }

    const coursesData: Course[] = await coursesResponse.json();
    let curriculumsData: Curriculum[] = [];
    let subjectsData: Subject[] = [];
    
    if (curriculumsResponse.ok) {
      curriculumsData = await curriculumsResponse.json();
    }

    if (subjectsResponse && subjectsResponse.ok) {
      subjectsData = await subjectsResponse.json();
    }

    // 🟢 Bước 2: Map chéo dữ liệu để đắp dữ liệu hoàn chỉnh cho từng Course
    const mappedCourses = coursesData.map((course) => {
      // 1. Tìm curriculum tương ứng để lấy đường dẫn file gốc
      const matchingCurriculum = curriculumsData.find(
        (curr) => curr.curriculum_id === course.curriculum_id
      );

      // 2. Lọc ra toàn bộ các chương học (subject) thuộc về khóa học này trong DB
      const courseSubjects = subjectsData.filter(
        (sub) => sub.course_id === course.course_id
      );

      return {
        ...course,
        // Đảm bảo không bị undefined lỗi type, chuẩn hóa instructor_id
        instructor_id: course.instructor_id ?? null,
        // Đắp đường dẫn file thực tế vào đây để client sử dụng
        curriculum_file_path: matchingCurriculum ? matchingCurriculum.curriculum_file_path : null,
        // Đổ mảng subject thật đã được lọc từ DB vào để hiển thị lên UI chương mục
        subjects: courseSubjects
      };
    });

    return mappedCourses;
  } catch (error: any) {
    console.error("Lỗi xử lý kết hợp dữ liệu tại getCoursesAction:", error);
    return [];
  }
}

/**
 * Thêm mới một chương học con (Subject) vào khóa học
 */
export async function createSubjectAction(payload: { course_id: string; title: string; description: string }, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/subjects/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.detail || "Không thể tạo chương học" };
    }
    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cập nhật thông tin chương học (Subject)
 */
export async function updateSubjectAction(subjectId: string, payload: { title: string; description: string }, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/subjects/${subjectId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.detail || "Không thể cập nhật chương học" };
    }
    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gỡ bỏ chương học (Subject) khỏi hệ thống
 */
export async function deleteSubjectAction(subjectId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.detail || "Không thể xóa chương học" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



// --- ACTIONS CHO TẦNG MODULE ---
export async function getModulesBySubjectAction(subjectId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    // Backend nên có endpoint lấy module theo subject_id, hoặc lấy tất cả rồi frontend tự filter
    const response = await fetch(`${process.env.NEXT_PUBLIC_COURSE_BACKEND_URL}/modules/?subject_id=${subjectId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function createModuleAction(payload: { subject_id: string; title: string }, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_COURSE_BACKEND_URL}/modules/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: response.ok, data: response.ok ? await response.json() : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ACTIONS CHO TẦNG LESSON ---
export async function getLessonsByModuleAction(moduleId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_COURSE_BACKEND_URL}/lessons/?module_id=${moduleId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function createLessonAction(payload: { module_id: string; title: string; duration_minutes: number; video_url?: string; content_body?: string }, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_COURSE_BACKEND_URL}/lessons/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: response.ok, data: response.ok ? await response.json() : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}