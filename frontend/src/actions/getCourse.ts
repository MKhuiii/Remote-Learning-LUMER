  "use server";

  import { revalidatePath } from "next/cache";
  import { cookies } from "next/headers";
  import { Course } from "@/types/course";

  // const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || "http://localhost:8001";
  const BACKEND_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL;
  async function getServerToken(): Promise<string> {
    const cookieStore = await cookies();
    const tokenObj = cookieStore.get("token");
    const token = tokenObj ? tokenObj.value : "";
    
    if (!token || token === 'undefined' || token === 'null') {
      throw new Error("Không tìm thấy mã xác thực Access Token trên hệ thống. Vui lòng đăng nhập lại!");
    }
    return token.trim().replace(/^"|"$/g, "");
  }

  // 🟢 1. Lấy danh sách khóa học từ Backend
  export async function getCoursesAction(): Promise<Course[]> {
    try {
      const cleanToken = await getServerToken();
      const res = await fetch(`${BACKEND_URL}/courses/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store", 
      });

      if (!res.ok) {
        throw new Error(`Không thể lấy danh sách khóa học. Mã lỗi: ${res.status}`);
      }
      return await res.json();
    } catch (error: any) {
      console.error("❌ Lỗi tại getCoursesAction:", error.message);
      return [];
    }
  }   

  // 🟢 2. Tạo mới khóa học
  export async function createCourseAction(payload: any) {
    try {
      const cleanToken = await getServerToken();
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
        console.error("Backend error:", err);
        throw new Error(
          typeof err.detail === "string" ? err.detail : JSON.stringify(err)
        );
      }
      revalidatePath("/courses");
      revalidatePath("/training-management/course-assignment");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Lỗi tại createCourseAction:", error.message);
      return { success: false, error: error.message };
    }
  }

  // 🟢 3. Cập nhật khóa học
  export async function updateCourseAction(courseId: string, payload: any) { 
    try {
      const cleanToken = await getServerToken();
      const url = `${BACKEND_URL}/courses/${courseId}`; 
      
      console.log("🚀 Đang gửi dữ liệu cập nhật tới:", url);

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
      
      // Làm mới cache các trang liên quan
      revalidatePath("/courses");
      revalidatePath("/training-management/course-assignment");

      return { success: true, data };
    } catch (error: any) {
      console.error("❌ Lỗi tại updateCourseAction:", error.message);
      return { success: false, error: error.message };
    }
  }

  // 🟢 4. Xóa khóa học
  export async function deleteCourseAction(courseId: string) {
    try {
      const cleanToken = await getServerToken();
      const res = await fetch(`${BACKEND_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${cleanToken}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Xóa khóa học thất bại.");
      }
      revalidatePath("/courses");
      revalidatePath("/training-management/course-assignment");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Lỗi tại deleteCourseAction:", error.message);
      return { success: false, error: error.message };
    }
  }

  // 🟢 5. Upload ảnh đại diện khóa học (Nhận vào FormData từ Client)
  export async function uploadCourseImageAction(formData: FormData) {
    try {
      const cleanToken = await getServerToken();

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
      console.error("❌ Lỗi tại uploadCourseImageAction:", error.message);
      return { success: false, error: error.message || "Lỗi kết nối mạng đến server." };
    }
  }

// 🟢 6. Phân công giảng viên
export async function assignInstructorAction(payload: {
  course_id: string;
  instructor_id: string;
}) {
  try {
    const cleanToken = await getServerToken(); 
    if (!cleanToken) {
      return { success: false, error: "Phiên đăng nhập hết hạn!" };
    }
    const url = `${BACKEND_URL}/courses/${payload.course_id}/assign-instructor?instructor_id=${payload.instructor_id}`;

    const res = await fetch(url, {
      method: "PUT", 
      headers: {
        "Authorization": `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.detail || `Lỗi hệ thống Backend: ${res.status}` 
      };
    }
    revalidatePath("/training-management/course-assignment");
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "Không thể kết nối đến máy chủ" 
    };
  }
}