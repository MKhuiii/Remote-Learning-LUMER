"use server";

import { cookies } from "next/headers";
import { GeneralInfoInstructorSubject } from "@/types/subject";

const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// Hàm trợ giúp lấy token an toàn trên Server (Sử dụng hàm sẵn có của bạn)
async function getServerToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return token.trim().replace(/^"|"$/g, "");
}

// 🟣 Lấy thông tin tổng quan các môn học của Giảng viên
export async function getInstructorGeneralInfoAction(
  searchQuery?: string
): Promise<GeneralInfoInstructorSubject[]> {
  try {
    const token = await getServerToken();

    if (!token) {
      throw new Error("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
    }

    // Xây dựng URL động
    const url = new URL(`${BACKEND_URL}/subjects/instructor-general-info`);

    // Nếu người dùng truyền từ khóa tìm kiếm, đính kèm param ?search=...
    if (searchQuery && searchQuery.trim() !== "") {
      url.searchParams.append("search", searchQuery.trim());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Không cache để luôn nhận dữ liệu tìm kiếm mới nhất
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Lỗi Server (${response.status}): Không thể tải danh sách môn học`
      );
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      error.message || "Lỗi kết nối Server Action [getInstructorGeneralInfoAction]"
    );
  }
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

// 🟡 Lấy tất cả môn học
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