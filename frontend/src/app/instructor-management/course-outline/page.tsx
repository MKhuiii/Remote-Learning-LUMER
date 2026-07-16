"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Trash2, 
  Plus, 
  RefreshCw, 
  GraduationCap, 
  AlertCircle,
  ChevronRight,
  ClipboardList,
  FileText,
  User,
  Loader2
} from "lucide-react";

// Import Navbar đồng bộ với Dashboard của bạn
import Navbar from "@/components/Navbar";

// Import Server Actions thực tế từ dự án
import { getCoursesAction } from "@/actions/getCourse";
import { getSubjectsAction } from "@/actions/getSubject";
import { getSyllabusAction , createSyllabusAction} from "@/actions/getSyllabus"; 

// Import Course type chuẩn
import { Course } from "@/types/course";

interface Subject {
  subject_id: string;
  course_id: string;
  title: string;
  description?: string | null;
}

interface SyllabusItem {
  syllabus_id: string;
  subject_id: string;
  assigner_id?: string | null;
  instructor_id?: string | null;
  description?: string | null;
  syllabus_file_path?: string | null;
  status_id?: string | null;
}

// --- HÀM BỔ TRỢ LẤY COOKIE CLIENT-SIDE ---
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }
  return "";
}

export default function QuanLyBiensOanSyllabus() {
  // --- STATE LƯU TRỮ DỮ LIỆU ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([]);
  
  // Lưu trữ ID và Email của Giảng viên đăng nhập
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  // --- STATE ĐIỀU HƯỚNG & TRẠNG THÁI ---
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyllabusLoading, setIsSyllabusLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- STATE MODAL SYLLABUS ---
  const [showSyllabusModal, setShowSyllabusModal] = useState<boolean>(false);
  const [syllabusForm, setSyllabusForm] = useState({
    description: "",       
    syllabus_file_path: "", 
    status_id: "SYLLABUS_DRAFT" 
  });

  // --- 1. LẤY THÔNG TIN USER TỪ COOKIE "USER_INFO" ---
  useEffect(() => {
    try {
      const userInfoCookie = getCookie("user_info");
      if (userInfoCookie) {
        const decodedString = decodeURIComponent(userInfoCookie);
        const userObj = JSON.parse(decodedString);
        
        console.log("👤 [USER INFO LOADED]:", userObj);
        
        // Lưu email để dùng làm định danh (hoặc ID nếu hệ thống của bạn cập nhật sau này)
        if (userObj?.email) {
          setCurrentUserEmail(userObj.email);
        }
        
        // Ưu tiên lấy ID nếu có, nếu không tạm thời gán bằng email hoặc username làm định danh tạm thời
        const userId = userObj?.id || userObj?.userId || userObj?.user_id || userObj?.username || "";
        setCurrentUserId(userId);
      }
    } catch (err) {
      console.error("Lỗi khi đọc cookie user_info:", err);
    }
  }, []);

  // --- 2. TẢI DANH SÁCH COURSE & SUBJECT ---
  const taiDuLieuBanDau = async () => {
    setIsLoading(true);
    try {
      const [coursesData, subjectsData] = await Promise.all([
        getCoursesAction(),
        getSubjectsAction(),
      ]);

      const finalCourses = Array.isArray(coursesData) 
        ? coursesData 
        : ((coursesData as any)?.data || []);

      const finalSubjects = Array.isArray(subjectsData) 
        ? subjectsData 
        : ((subjectsData as any)?.data || []);

      setCourses(finalCourses);
      setAllSubjects(finalSubjects);
    } catch (error) {
      console.error("Lỗi tải Course/Subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieuBanDau();
  }, []);

  // --- 3. LỌC DANH SÁCH SUBJECT KHI CHỌN COURSE ---
  useEffect(() => {
    if (selectedCourseId) {
      const filtered = allSubjects.filter(
        (sub) => String(sub.course_id).trim() === String(selectedCourseId).trim()
      );
      setFilteredSubjects(filtered);
      setSelectedSubjectId(""); 
      setSyllabusList([]); 
    } else {
      setFilteredSubjects([]);
      setSelectedSubjectId("");
      setSyllabusList([]);
    }
  }, [selectedCourseId, allSubjects]);

  // --- 4. LẤY SYLLABUS TỪ DATABASE KHI CHỌN SUBJECT (Gửi kèm Token lấy từ Cookie Client-side) ---
  const taiSyllabusThangTuDB = async (subjectId: string) => {
    if (!subjectId) {
      setSyllabusList([]);
      return;
    }
    setIsSyllabusLoading(true);
    try {
      // Vì Cookie của bạn tên là 'token' chứa chuỗi JWT (Mục HttpOnly), 
      // Trên một số cấu hình localhost Next.js Client-side, việc truyền token từ Client-action có thể bị trống.
      // Chúng ta lấy thủ công 'token' (nếu trình duyệt cho phép đọc) hoặc gửi kèm định dạng Session.
      const token = getCookie("token") || ""; 
      
      const data = await getSyllabusAction(subjectId);
      
      const finalSyllabus = Array.isArray(data) 
        ? data 
        : ((data as any)?.data || []);
        
      setSyllabusList(finalSyllabus);
    } catch (error) {
      console.error("Lỗi tải Syllabus thực tế từ Server:", error);
      setSyllabusList([]); 
    } finally {
      setIsSyllabusLoading(false);
    }
  };

  useEffect(() => {
    taiSyllabusThangTuDB(selectedSubjectId);
  }, [selectedSubjectId]);

  // --- 5. XỬ LÝ GỬI THÔNG TIN TẠO ĐỀ CƯƠNG ---
  // Tìm hàm này trong component "QuanLyBiensOanSyllabus" của bạn
const handleSyllabusSubmit = async () => {
  if (!selectedSubjectId) {
    alert("Vui lòng chọn học phần trước!");
    return;
  }
  if (!syllabusForm.description.trim()) {
    alert("Vui lòng nhập mô tả cho đề cương!");
    return;
  }

  setIsSubmitting(true);
  try {
    // Gọi Action tạo mới mà không cần truyền Instructor_ID (Backend tự lấy từ token)
    const result = await createSyllabusAction({
      subject_id: selectedSubjectId,
      description: syllabusForm.description.trim(),
      syllabus_file_path: syllabusForm.syllabus_file_path.trim() || null,
      status_id: "SYLLABUS_DRAFT" // Mặc định là bản nháp
    });

    if (result.success) {
      alert("🎉 Đã lưu và khởi tạo đề cương thành công!");
      setShowSyllabusModal(false); // Đóng modal soạn thảo
      
      // Reset form
      setSyllabusForm({
        description: "",
        syllabus_file_path: "",
        status_id: "SYLLABUS_DRAFT"
      });
      
      // Tải lại dữ liệu đề cương mới nhất từ DB để hiển thị lên màn hình
      await taiSyllabusThangTuDB(selectedSubjectId);
    } else {
      alert(`⚠️ Lỗi: ${result.error}`);
    }
  } catch (error) {
    console.error("Lỗi submit đề cương:", error);
    alert("Có lỗi xảy ra trong quá trình lưu đề cương.");
  } finally {
    setIsSubmitting(false);
  }
};

  const selectedCourseTitle = courses.find(c => c.course_id === selectedCourseId)?.title || "";
  const selectedSubjectTitle = allSubjects.find(s => s.subject_id === selectedSubjectId)?.title || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#0066FF]/10 text-[#0066FF] rounded-xl shadow-xs">
                <GraduationCap size={24} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Biên Soạn Đề Cương Chi Tiết (Syllabus)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 pl-1 sm:pl-14">
              Chọn khóa học <span className="text-[#0066FF] font-semibold">➔</span> Chọn học phần (Subject) để tiến hành quản lý & soạn thảo đề cương.
            </p>
          </div>

          <button
            onClick={taiDuLieuBanDau}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-[#0066FF]" : ""} />
            Đồng bộ dữ liệu
          </button>
        </div>

        {/* BỐ CỤC 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Chọn Khóa học chính
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] focus:bg-white transition"
                >
                  <option value="">-- Chọn một Khóa Học --</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourseId && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    2. Chọn học phần thuộc khóa học
                  </label>

                  {filteredSubjects.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      Khóa học này chưa có học phần nào.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {filteredSubjects.map((sub) => {
                        const isSelected = sub.subject_id === selectedSubjectId;
                        return (
                          <button
                            key={sub.subject_id}
                            onClick={() => setSelectedSubjectId(sub.subject_id)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-[#0066FF] border-[#0066FF] text-white shadow-sm font-semibold"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xs font-bold truncate max-w-[85%]">
                              {sub.title}
                            </span>
                            <ChevronRight size={14} className={isSelected ? "text-white animate-pulse" : "text-slate-400"} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[450px] flex flex-col">
              
              <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 rounded-t-2xl">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#0066FF]" />
                    Đề Cương Chi Tiết (Syllabus)
                  </h2>
                  {selectedSubjectId && (
                    <p className="text-xs text-[#0066FF] font-bold">
                      Học phần: {selectedSubjectTitle}
                    </p>
                  )}
                </div>

                {selectedSubjectId && (
                  <button
                    onClick={() => setShowSyllabusModal(true)}
                    className="px-4 py-2.5 bg-[#0066FF] hover:bg-[#0052D4] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition duration-150 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus size={14} /> Khởi Tạo Giáo Trình Đề Cương
                  </button>
                )}
              </div>

              {/* LIST VIEW */}
              <div className="p-6 flex-1 flex flex-col justify-center">
                {isSyllabusLoading ? (
                  <div className="text-center py-12 space-y-3">
                    <Loader2 className="animate-spin mx-auto text-[#0066FF]" size={28} />
                    <p className="text-xs text-slate-400 font-bold">Đang truy xuất dữ liệu đề cương...</p>
                  </div>
                ) : !selectedCourseId ? (
                  <div className="text-center py-12 max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <BookOpen size={20} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-700">Chưa Chọn Khóa Học</h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Vui lòng chọn một Khóa học ở danh sách bên trái.
                      </p>
                    </div>
                  </div>
                ) : !selectedSubjectId ? (
                  <div className="text-center py-12 max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#0066FF]">
                      <ChevronRight size={20} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-700">Chưa Chọn Học Phần (Subject)</h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Hãy nhấp chọn một học phần con ở cột bên trái để tải dữ liệu.
                      </p>
                    </div>
                  </div>
                ) : syllabusList.length === 0 ? (
                  <div className="text-center py-12 max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <AlertCircle size={20} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-700">Đề cương chưa được khởi tạo</h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Học phần này hiện chưa có giáo trình hay đề cương (Syllabus) nào được lưu.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSyllabusModal(true)}
                      className="px-4 py-2 border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/5 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Khởi tạo ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 self-start w-full">
                    {syllabusList.map((item, idx) => (
                      <div
                        key={item.syllabus_id}
                        className="p-5 border border-slate-100 hover:border-slate-200 bg-slate-50/50 rounded-xl hover:shadow-xs transition-all duration-200 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-black flex items-center justify-center shrink-0">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="text-xs font-bold text-slate-900 leading-normal">
                              Syllabus ID: {item.syllabus_id.slice(0, 8)}...
                            </span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status_id === "SYLLABUS_DRAFT" 
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : item.status_id === "SYLLABUS_APPROVED" 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {item.status_id || "DRAFT"}
                          </span>
                        </div>

                        {item.description && (
                          <div className="text-xs text-slate-600 font-medium pl-7 border-l-2 border-slate-200 leading-relaxed">
                            {item.description}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7 pt-2 text-[11px] text-slate-500 font-semibold border-t border-slate-100">
                          {item.instructor_id && (
                            <div className="flex items-center gap-1.5">
                              <User size={12} className="text-slate-400" />
                              <span className="truncate">GV Phụ Trách: {item.instructor_id}</span>
                            </div>
                          )}
                          {item.syllabus_file_path && (
                            <div className="flex items-center gap-1.5 col-span-1 md:col-span-2 text-[#0066FF] hover:underline cursor-pointer">
                              <FileText size={12} />
                              <a href={item.syllabus_file_path} target="_blank" rel="noopener noreferrer" className="truncate">
                                Tài liệu đề cương: {item.syllabus_file_path}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL THÊM MỚI SYLLABUS */}
      {showSyllabusModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                🚀 Khởi Tạo Giáo Trình Đề Cương (Syllabus)
              </h3>
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-bold text-slate-700 max-h-[480px] overflow-y-auto">

              {/* 1. SYLLABUS FILE PATH */}
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Đường dẫn tệp tài liệu (Syllabus File Path)</label>
                <input
                  type="text"
                  value={syllabusForm.syllabus_file_path}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, syllabus_file_path: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] bg-white text-slate-800"
                  placeholder="Ví dụ: https://drive.google.com/file/... (Nếu có)"
                />
              </div>

              {/* 2. DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Mô tả giáo trình / đề cương chi tiết *</label>
                <textarea
                  rows={4}
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] bg-white text-slate-800 resize-none leading-relaxed"
                  placeholder="Mô tả cụ thể mục tiêu, tài liệu tham khảo..."
                />
              </div>

            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs rounded-xl text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSyllabusSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#0066FF] hover:bg-[#0052D4] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                {isSubmitting ? "Đang lưu..." : "Lưu đề cương"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}