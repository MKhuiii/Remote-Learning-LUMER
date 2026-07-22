'use server'

import { cookies } from 'next/headers'

const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// --- TYPES ---
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

// --- HELPER: LẤY TOKEN TỪ COOKIES ---
async function getTokenFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("token")?.value || "";
  return rawToken.trim().replace(/^"|"$/g, "");
}

// 1. Khóa học (Không cần truyền token từ client)
export async function getCoursesAction(): Promise<Course[]> {
  try {
    const token = await getTokenFromCookie();
    const response = await fetch(`${userBackendUrl}/courses/`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json" 
      },
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

// 2. Lấy danh sách Môn học theo Course ID (Bổ sung cho Client)
export async function getSubjectsByCourseAction(courseId: string): Promise<Subject[]> {
  try {
    const token = await getTokenFromCookie();
    const response = await fetch(`${userBackendUrl}/subjects/course/${courseId}`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json" 
      },
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Lỗi getSubjectsByCourseAction:", error);
    return [];
  }
}

// 3. Lấy tất cả Môn học
export async function getSubjectsAction(): Promise<Subject[]> {
  try {
    const token = await getTokenFromCookie();
    const response = await fetch(`${userBackendUrl}/subjects/`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json" 
      },
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

// 4. Tạo Môn học
export async function createSubjectAction(payload: { course_id: string; title: string; description: string; order_index?: number }) {
  try {
    const token = await getTokenFromCookie();
    const response = await fetch(`${userBackendUrl}/subjects/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Không thể tạo môn học");
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi tạo môn học");
  }
}

// 5. Lấy Đề cương (Syllabus) - Đã khớp tên getSyllabusBySubjectAction
export async function getSyllabusBySubjectAction(subjectId: string) {
  try {
    const baseUrl = userBackendUrl || "";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/syllabus/subject/${subjectId}`;

    const token = await getTokenFromCookie();

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("❌ Lỗi kết nối API Syllabus:", error);
    return null;
  }
}

// 6. Tạo Đề cương (Syllabus)
// 6. Tạo Đề cương (Syllabus)
export async function createSyllabusAction(payload: {
  subject_id: string;
  description: string;
  syllabus_file_path?: string | null;
  status_id?: string;
}) {
  try {
    const baseUrl = userBackendUrl || "";
    const url = `${baseUrl.replace(/\/$/, "")}/syllabus/`;

    const token = await getTokenFromCookie();

    let instructorId = null;
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        instructorId = decodedPayload.user_id || decodedPayload.sub; 
      } catch (e) {
        console.error("Không thể giải mã token:", e);
      }
    }

    const finalPayload = {
      subject_id: payload.subject_id,
      description: payload.description || "Chưa có mô tả",
      instructor_id: instructorId, 
      
      // ✅ FIX TẠI ĐÂY: Nếu không có file truyền vào, gán đường dẫn file mặc định
      syllabus_file_path: payload.syllabus_file_path || "documents/syllabi/placeholder.pdf",
      
      status_id: payload.status_id || "SYLLABUS_DRAFT"
    };

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
      throw new Error(typeof data.detail === "string" ? data.detail : "Không thể tạo đề cương");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi kết nối đến máy chủ.");
  }
}

export async function uploadFileAction(formData: FormData) {
  const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || "http://localhost:8000";
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value?.replace(/^"|"$/g, "") || "";

  const endpoint = `${userBackendUrl.replace(/\/$/, "")}/syllabus/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || `Lỗi khi upload file (${res.status})`);
  }

  return data; // Trả về { status: "success", file_path: "documents/syllabi/..." }
}