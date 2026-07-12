'use server'
import { cookies } from 'next/headers'
import { CurriculumCreatePayload } from '@/types/course';

const userBackendUrl = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8001";

// Hàm helper nội bộ lấy token trực tiếp từ Cookie của hệ thống Server
async function getServerToken(): Promise<string> {
  const cookieStore = await cookies();
  const tokenObj = cookieStore.get("token");
  const token = tokenObj ? tokenObj.value : "";
  
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error("Không tìm thấy mã xác thực Access Token trên hệ thống. Vui lòng đăng nhập lại!");
  }
  return token.trim().replace(/^"|"$/g, "");
}

// 🟢 1. Upload file Curriculum
// Sửa đối số từ 'file: File' thành 'formData: FormData'
export async function uploadCurriculums(formData: FormData, curriculumId?: string) {
  try {
    const token = await getServerToken();

    let apiUrl = `${userBackendUrl}/curriculums/upload`;
    if (curriculumId) apiUrl += `?curriculum_id=${curriculumId}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // KHÔNG set 'Content-Type' khi gửi FormData, để tự trình duyệt định nghĩa kèm boundary
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Lỗi: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// 🟢 2. Lấy danh sách Curriculum
export async function getCurriculums() {
  const token = await getServerToken();
  const response = await fetch(`${userBackendUrl}/curriculums/`, { 
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tải danh sách chương trình đào tạo");
  }
  return await response.json();
}

// 🟢 3. Tạo mới Curriculum
export async function createCurriculum(data: CurriculumCreatePayload) {
  const token = await getServerToken();
  const response = await fetch(`${userBackendUrl}/curriculums/`, { 
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
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
export async function updateCurriculum(curriculumId: string, payload: any) {
  const token = await getServerToken();
  const response = await fetch(`${userBackendUrl}/curriculums/${curriculumId}`, {
    method: "PUT",
    headers: { 
      "Authorization": `Bearer ${token}`,
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
export async function deleteCurriculum(curriculumId: string) {
  const token = await getServerToken();
  const response = await fetch(`${userBackendUrl}/curriculums/${curriculumId}`, {
    method: "DELETE",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Không thể tiến hành xóa dữ liệu.");
  }
  return true;
}

// === CÁC HÀM CRUD CỦA COURSES BÊN DƯỚI BẠN CŨNG ÁP DỤNG TƯƠNG TỰ (Bỏ tham số token đi và gọi: const token = await getServerToken()) ===