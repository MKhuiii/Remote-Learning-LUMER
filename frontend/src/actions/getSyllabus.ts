'use server'

import { cookies } from 'next/headers'

const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

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
  instructor_id?: string | null;       
  curriculum_id: string;               
  curriculum_file_path?: string | null; 
  subjects: Subject[];                 
}

export interface Curriculum {
  curriculum_id: string;
  title?: string;
  description?: string;                
  curriculum_file_path?: string | null;
  status_id?: string;
}

export interface CourseModule {
  module_id: string;
  subject_id: string;
  title: string;
  order_index?: number;
  lessons?: CourseLesson[]; 
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

export async function getCoursesAction(token: string): Promise<Course[]> {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/courses/`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách khóa học: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Lỗi getCoursesAction:", error);
    return [];
  }
}

export async function getSubjectsAction(token: string): Promise<Subject[]> {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/subjects/`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách học phần: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Lỗi getSubjectsAction:", error);
    return [];
  }
}

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




export async function getSyllabusAction(subjectId: string) {
  try {
    // const baseUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || "http://localhost:8001";
    const baseUrl = userBackendUrl || "";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/syllabus/subject/${subjectId}`;

    // TỰ ĐỘNG ĐỌC TOKEN TỪ COOKIE TRÊN SERVER NEXT.JS
    const cookieStore = await cookies(); // Thêm await nếu dùng Next.js 15+
    const token = cookieStore.get("token")?.value; 

    console.log("📡 [NEXTJS FETCH] Gọi API Syllabus chính xác tại:", url);
    console.log("🔑 [DEBUG] Trạng thái Token gửi đi:", token ? "CÓ TOKEN (Đang gửi)" : "TRỐNG (NULL)");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Đính kèm Token dạng Bearer
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    if (res.status === 401) {
      console.error("❌ API trả về lỗi 401: Token không hợp lệ, hết hạn, hoặc Backend giải mã lỗi!");
      return null;
    }

    if (res.status === 404) {
      console.log("ℹ️ Môn học này chưa có syllabus (404).");
      return null;
    }

    if (!res.ok) {
      console.error(`❌ Fetch Syllabus thất bại. Status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Lỗi kết nối API Syllabus:", error);
    return null;
  }
}




export async function createSyllabusAction(payload: {
  subject_id: string;
  description: string;
  syllabus_file_path?: string | null;
  status_id?: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || "";
    const url = `${baseUrl.replace(/\/$/, "")}/syllabus/`;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // 1. Giải mã token tự động để lấy instructor_id (UUID)
    let instructorId = null;
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        instructorId = decodedPayload.user_id || decodedPayload.sub; 
      } catch (e) {
        console.error("Không thể giải mã token:", e);
      }
    }
    const finalPayload = {
      subject_id: payload.subject_id,
      description: payload.description || "Chưa có mô tả",
      instructor_id: instructorId, 
      
      syllabus_file_path: payload.syllabus_file_path || "documents/syllabi/placeholder.pdf",
      
      status_id: payload.status_id || "SYLLABUS_DRAFT"
    };

    console.log("📤 [NEXTJS POST] Gửi dữ liệu chuẩn lên Backend:", finalPayload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(finalPayload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Tạo Syllabus thất bại từ Backend:", data);
      return { success: false, error: JSON.stringify(data.detail) || "Không thể tạo đề cương" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("❌ Lỗi kết nối khi POST Syllabus:", error);
    return { success: false, error: "Lỗi kết nối đến máy chủ." };
  }
}




export async function createModuleAction(payload: { subject_id: string; title: string }, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/modules/`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${cleanToken}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });
    return { success: response.ok, data: response.ok ? await response.json() : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLessonsByModuleAction(moduleId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  try {
    const response = await fetch(`${userBackendUrl}/lessons/?module_id=${moduleId}`, {
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
    const response = await fetch(`${userBackendUrl}/lessons/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${cleanToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: response.ok, data: response.ok ? await response.json() : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

