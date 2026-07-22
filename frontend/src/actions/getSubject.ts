"use server";
import { cookies } from "next/headers";
import { GeneralInfoInstructorSubject } from "@/types/subject";

const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;


// Hàm trợ giúp lấy token an toàn
async function getServerToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  return token.trim().replace(/^"|"$/g, "");
}

export async function createSubjectAction(payload: any) {
  try {
    // 🟢 1. LẤY TOKEN TỪ COOKIE
    const token = await getServerToken();

    if (!token) {
      throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
    }

    // 🟢 2. CẤU HÌNH API ENDPOINT (Đảm bảo BACKEND_URL đúng cổng FastAPI)
    const endpoint = `${BACKEND_URL}/subjects/`; 

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🟢 3. TRUYỀN TOKEN ĐỂ PASS QUA RoleChecker
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let errorMessage = `Lỗi Backend (${response.status})`;
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Render chi tiết lỗi từng trường Pydantic
        errorMessage = errorData.detail.map((e: any) => `${e.loc?.slice(1).join(".")}: ${e.msg}`).join(" | ");
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error("❌ Lỗi createSubjectAction:", error.message);
    throw new Error(error.message || "Lỗi kết nối Server Action");
  }
}

// 2. Bổ sung hàm getSubjectsByCourseAction mà Client đang cần
export async function getSubjectsByCourseAction(courseId: string | number) {
  try {
    const token = await getServerToken();
    const response = await fetch(`${BACKEND_URL}/subjects/course/${courseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Lỗi Server (${response.status}) khi tải môn học`);
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Lỗi kết nối Server Action [getSubjectsByCourseAction]");
  }
}

// 3. Lấy thông tin tổng quan các môn học của Giảng viên
export async function getInstructorGeneralInfoAction(
  searchQuery?: string
): Promise<GeneralInfoInstructorSubject[]> {
  try {
    const token = await getServerToken();

    if (!token) {
      throw new Error("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
    }

    const url = new URL(`${BACKEND_URL}/subjects/instructor-general-info`);
    if (searchQuery && searchQuery.trim() !== "") {
      url.searchParams.append("search", searchQuery.trim());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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

// 4. Lấy danh sách môn học theo ID chương trình
export async function getSubjectsByCurriculum(curriculumId: string) {
  try {
    const token = await getServerToken();
    const response = await fetch(`${BACKEND_URL}/subjects/curriculum/${curriculumId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Lỗi Server (${response.status})`);
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Lỗi kết nối Server Action [getSubjectsByCurriculum]");
  }
}

// 5. Xóa môn học
export async function deleteSubject(subjectId: string) {
  try {
    const token = await getServerToken();
    const response = await fetch(`${BACKEND_URL}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Xóa môn học thất bại");
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// 6. Lấy tất cả môn học
export async function getSubjectsAction(): Promise<any[]> {
  try {
    const cleanToken = await getServerToken();
    const res = await fetch(`${BACKEND_URL}/subjects/?limit=1000`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
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