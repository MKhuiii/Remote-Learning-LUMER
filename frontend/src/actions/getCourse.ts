"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // 🟢 THÊM DÒNG NÀY: Để tự động đọc Cookie từ Server
import { Course } from '@/types/course';

const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;

// 🟢 THÊM HÀM HELPER: Tự lấy token tự động ở tầng Server giống hệt file Curriculum
async function getServerToken(): Promise<string> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  const token = tokenObj ? tokenObj.value : "";
  
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error("Không tìm thấy mã xác thực Access Token trên hệ thống. Vui lòng đăng nhập lại!");
  }
  return token.trim().replace(/^"|"$/g, "");
}

// 🔵 Lấy danh sách khóa học từ Backend
export async function getCoursesAction(): Promise<Course[]> { // 🟢 ĐÃ BỎ: tham số token
  try {
    const cleanToken = await getServerToken(); // 🟢 TỰ ĐỘNG LẤY TOKEN
    const res = await fetch(`${BACKEND_URL}/courses/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách khóa học");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}   

// 🟢 Tạo mới khóa học
export async function createCourseAction(payload: any) { // 🟢 ĐÃ BỎ: tham số token
  try {
    const cleanToken = await getServerToken(); // 🟢 TỰ ĐỘNG LẤY TOKEN
    const res = await fetch(`${BACKEND_URL}/courses/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.log("Backend error:", err);
      throw new Error(
        typeof err.detail === "string" ? err.detail : JSON.stringify(err)
      );
    }
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCourseAction(courseId: string, payload: any) { 
  try {
    console.log("PAYLOAD TRƯỚC KHI BẮN SANG BACKEND API:", payload);
    const cleanToken = await getServerToken(); // 🟢 TỰ ĐỘNG LẤY TOKEN
    const url = `${BACKEND_URL}/courses/${courseId}/`; 
    
    console.log("🚀 Đang gửi dữ liệu cập nhật tới:", url);
    console.log("📦 Payload:", JSON.stringify(payload));

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Cập nhật thất bại từ phía Backend server.");
    }

    const data = await res.json();
    console.log("✅ Kết quả Backend trả về thực tế:", data);

    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Lỗi tại Server Action Update:", error.message);
    return { success: false, error: error.message };
  }
}

// 🔴 Xóa khóa học
export async function deleteCourseAction(courseId: string) { // 🟢 ĐÃ BỎ: tham số token
  try {
    const cleanToken = await getServerToken(); // 🟢 TỰ ĐỘNG LẤY TOKEN
    const res = await fetch(`${BACKEND_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
      },
    });
    if (!res.ok) throw new Error("Xóa khóa học thất bại");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 📷 Upload ảnh đại diện khóa học
export async function uploadCourseImageAction(file: File) { // 🟢 ĐÃ BỎ: tham số token
  try {
    
    const cleanToken = await getServerToken(); // 🟢 TỰ ĐỘNG LẤY TOKEN
    const formData = new FormData();
    formData.append("file", file); 

    const response = await fetch(`${BACKEND_URL}/courses/course-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errData.detail || `Upload thất bại, Server phản hồi mã lỗi: ${response.status}` 
      };
    }
    
    const data = await response.json();
    return { success: true, imageUrl: data.image_url }; 
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi kết nối mạng đến server vật lý." };
  }
}