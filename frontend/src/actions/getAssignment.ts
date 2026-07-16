"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface CourseLink {
  course_id: string;
  instructor_id: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// Hàm helper tự động lấy token từ Cookie ở tầng Server
async function getServerToken(): Promise<string> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  const token = tokenObj ? tokenObj.value : "";
  
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error("Không tìm thấy mã xác thực Access Token. Vui lòng đăng nhập lại!");
  }
  return token.trim().replace(/^"|"$/g, "");
}

// Hàm phân công giảng viên (Code đầy đủ)
export async function assignInstructorAction(payload: CourseLink) { 
  try {
    const cleanToken = await getServerToken(); 
    
    // Khớp đúng prefix /assignment của Backend
    const url = `${BACKEND_URL}/course-instructor-link/`; 

    console.log("🚀 Đang gửi yêu cầu phân công tới:", url);

    const res = await fetch(url, {
      method: "POST", 
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Cập nhật liên kết thất bại.");
    }

    const data = await res.json();

    // 🔥 QUAN TRỌNG: Xóa cache trang này để Next.js ép buộc load lại dữ liệu mới nhất từ DB
    revalidatePath("/training-management/course-assignment"); 

    return { success: true, data };
  } catch (error: any) {    
    console.error("❌ Lỗi tại Server Action:", error.message);
    return { success: false, error: error.message };
  }
}