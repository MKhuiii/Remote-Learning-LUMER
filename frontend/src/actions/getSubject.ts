"use server"; // 👈 Bắt buộc phải có dòng này ở đầu file

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// Hàm trợ giúp lấy token an toàn trên Server
async function getServerToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return token.trim().replace(/^"|"$/g, "");
}

// 🔵 Lấy danh sách môn học theo ID chương trình
export async function getSubjectsByCurriculum(curriculumId: string) {
  try {
    const token = await getServerToken();
    
    const response = await fetch(`${BACKEND_URL}/subjects/curriculum/${curriculumId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Lỗi Server (${response.status})`);
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Lỗi kết nối Server Action [getSubjects]");
  }
}

// 🟢 Tạo mới một môn học
export async function createSubject(payload: any) {
  try {
    const token = await getServerToken();
    const response = await fetch(`${BACKEND_URL}/subjects/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Tạo môn học thất bại trên hệ thống");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// 🔴 Xóa môn học
export async function deleteSubject(subjectId: string) {
  try {
    const token = await getServerToken();
    const response = await fetch(`${BACKEND_URL}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Xóa môn học thất bại");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getSubjectsAction(): Promise<any[]> {
  try {
    const cleanToken = await getServerToken();
    const res = await fetch(`${BACKEND_URL}/subjects/?limit=1000`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách học phần");
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy danh sách học phần:", error);
    return [];
  }
}