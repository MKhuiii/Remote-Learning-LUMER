'use server'
import { cookies } from 'next/headers'
import { CurriculumCreatePayload, CoursePayload } from '@/types/curriculum';

const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;


// 🟢 1. Upload file Curriculum
export async function uploadCurriculums(file: File, token: string, curriculumId?: string) {
  try {
    const cleanToken = token.trim().replace(/^"|"$/g, "");
    const formData = new FormData();
    formData.append("file", file);

    let url = `${userBackendUrl}/curriculums/upload`; 
    
    if (curriculumId) {
      url += `?curriculum_id=${curriculumId}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Accept": "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Lỗi upload: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// 🟢 2. Lấy danh sách Curriculum
export async function getCurriculums(token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/curriculums/`, { 
    method: "GET",
    headers: { "Authorization": `Bearer ${cleanToken}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tải danh sách chương trình đào tạo");
  }
  return await response.json();
}

// 🟢 3. Tạo mới Curriculum
export async function createCurriculum(data: CurriculumCreatePayload, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/curriculums/`, { 
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tạo chương trình đào tạo mới");
  }
  return await response.json();
}

// 🟢 4. Cập nhật Curriculum
export async function updateCurriculum(curriculumId: string, payload: any, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  
  const response = await fetch(`${userBackendUrl}/curriculums/${curriculumId}`, {
    method: "PUT",
    headers: { 
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể cập nhật chương trình đào tạo");
  }

  return response.json();
}

// 🟢 5. Xóa Curriculum
export async function deleteCurriculum(curriculumId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");

  const response = await fetch(`${userBackendUrl}/curriculums/${curriculumId}`, {
    method: "DELETE",
    headers: { 
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tiến hành xóa dữ liệu.");
  }

  return true;
}

// ==========================================
// 🚀 COURSES SERVER ACTIONS (FIX FULL CRUD)
// ==========================================

// 🔵 1. Lấy danh sách Course 
export async function getCourses(token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/courses/`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${cleanToken}` },
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tải danh sách khóa học hiện hành");
  }
  return await response.json();
}

// 🔵 2. Tạo mới một Course
export async function createCourse(data: CoursePayload, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/courses/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể khởi tạo khóa học mới");
  }
  return await response.json();
}

// 🔵 3. Cập nhật thông tin Course
export async function updateCourse(courseId: string, data: CoursePayload, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/courses/${courseId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể cập nhật cấu hình khóa học");
  }
  return await response.json();
}

// 🔵 4. Xóa bỏ một Course
export async function deleteCourse(courseId: string, token: string) {
  const cleanToken = token.trim().replace(/^"|"$/g, "");
  const response = await fetch(`${userBackendUrl}/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể gỡ bỏ khóa học này khỏi hệ thống");
  }
  return true;
}