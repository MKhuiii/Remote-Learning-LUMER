"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Upload, 
  ImageIcon, 
  Clock, 
  Award, 
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
} from "lucide-react";

import {
  getCoursesAction,
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  uploadCourseImageAction, 
  Course,
} from "@/actions/getCourse";
  
import { getCurriculums } from "@/actions/getCurriculum";

// --- UTILS HELPER FUNCTIONS ---

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export default function CourseManagementPage() {
  // --- STATES ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]); 
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [selectedCourseRow, setSelectedCourseRow] = useState<Course | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const NGINX_URL = process.env.NEXT_PUBLIC_NGINX_URL || "http://localhost"; 

  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    price: 0,
    curriculum_id: "", 
  });


// --- MEMOS & OPTIMIZATIONS (ĐÃ FIX THEO CONSOLE LOG THỰC TẾ) ---

// 🚀 Tối ưu hóa lưu trữ Curriculum Map: Tra cứu thông tin gốc O(1) từ bảng Curriculum
const curriculumMap = useMemo(() => {
  const map = new Map<string, { type: string; finishedMonths: string | number; name: string }>();
  
  curriculums.forEach(c => {
    // Đảm bảo lấy đúng ID bằng mọi giá
    const targetId = c.curriculum_id || c.curriculumId || c._id;
    if (!targetId) return;

    const targetIdStr = typeof targetId === "object" && targetId?.$oid 
      ? String(targetId.$oid).toLowerCase() 
      : String(targetId).toLowerCase();
    
    const type = c.course_type || c.courseType || "SHORT_TERM";
    // 💡 Lấy số tháng hoàn thành (ví dụ: số 3 trong ảnh)
    const finishedMonths = c.course_finished_months !== undefined ? c.course_finished_months : "Chưa rõ";
    const name = c.curriculum_name || "N/A";

    map.set(targetIdStr, { 
      type: String(type).toUpperCase(), 
      finishedMonths: finishedMonths,
      name: name
    });
  });
  return map;
}, [curriculums]);

// 1. Helper lấy loại hình đào tạo gốc
const getCourseTypeFromCurriculum = (curriculumId: any) => {
  if (!curriculumId) return "SHORT_TERM";
  const searchId = typeof curriculumId === "object" && curriculumId?.$oid 
    ? String(curriculumId.$oid).toLowerCase() 
    : String(curriculumId).toLowerCase();
  
  return curriculumMap.get(searchId)?.type || "SHORT_TERM";
};

// 2. 🛠️ Helper lấy Số tháng hoàn thành từ Curriculum (Giải quyết dứt điểm lỗi hiển thị)
const getMonthFromCurriculum = (curriculumId: any): string => {
  if (!curriculumId) return "Chưa cập nhật";
  const searchId = typeof curriculumId === "object" && curriculumId?.$oid 
    ? String(curriculumId.$oid).toLowerCase() 
    : String(curriculumId).toLowerCase();
  
  const months = curriculumMap.get(searchId)?.finishedMonths;
  if (months === undefined || months === "Chưa rõ") return "Chưa cập nhật";
  
  return `${months} Tháng`; // Kết quả hiển thị trực quan: "3 Tháng"
};

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    const lowerKeyword = keyword.toLowerCase();
    return courses.filter((c) =>
      c.title?.toLowerCase().includes(lowerKeyword)
    );
  }, [courses, keyword]);

  // --- API OPERATIONS ---

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("token") || "";
      const [courseData, curriculumData] = await Promise.all([
        getCoursesAction(token),
        getCurriculums(token)
      ]);
      console.log("=== THÔNG TIN COURSE THÔ ===", courseData?.[0]);
      console.log("=== THÔNG TIN CURRICULUM THÔ ===", curriculumData?.[0]);
      const safeCourses = courseData || [];
      const safeCurriculums = curriculumData || [];

      setCourses(safeCourses);
      setCurriculums(safeCurriculums);
      
      setSelectedCourseRow(safeCourses.length > 0 ? safeCourses[0] : null);

      if (safeCurriculums.length > 0 && !form.curriculum_id) {
        setForm(prev => ({ ...prev, curriculum_id: safeCurriculums[0].curriculum_id }));
      }
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu hệ thống:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  const handleForceSyncDatabase = async () => {
    if (!courses.length || !curriculums.length) {
      alert("Không có dữ liệu để thực hiện đồng bộ!");
      return;
    }

    const mismatchedCourses = courses.filter(course => {
      const dbType = String(course.course_type).toUpperCase();
      const actualType = getCourseTypeFromCurriculum(course.curriculum_id || (course as any).curriculumId);
      return dbType !== actualType;
    });

    if (mismatchedCourses.length === 0) {
      alert("Tuyệt vời! Dữ liệu bảng Course trong CSDL đã khớp hoàn toàn với Curriculum, không cần đồng bộ.");
      return;
    }

    if (!confirm(`Phát hiện ${mismatchedCourses.length} khóa học có 'course_type' bị lệch trong CSDL. Thực hiện cập nhật cưỡng bức xuống Postgres ngay?`)) {
      return;
    }

    setIsSyncing(true);
    const token = getCookie("token") || "";

    try {
      const syncPromises = mismatchedCourses.map(course => {
        const correctType = getCourseTypeFromCurriculum(course.curriculum_id || (course as any).curriculumId);
        const payload = {
          curriculum_id: course.curriculum_id || (course as any).curriculumId,
          title: course.title,
          course_type: correctType,
          description: course.description || "",
          price: Number(course.price),
          image_url: course.image_url || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
          status_id: "COURSE_REGISTRATION",
        };
        return updateCourseAction(course.course_id, payload, token);
      });

      const results = await Promise.all(syncPromises);
      const successCount = results.filter(res => res.success).length;

      alert(`Hoàn tất! Đã đồng bộ thành công ${successCount}/${mismatchedCourses.length} bản ghi lỗi xuống CSDL.`);
      await fetchInitialData(); 
    } catch (error: any) {
      alert(`Đồng bộ gián đoạn: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- FORM HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.curriculum_id) {
      alert("Vui lòng chọn một Chương trình đào tạo!");
      return;
    }

    setIsLoading(true);
    const token = getCookie("token") || "";
    let finalImageUrl = form.image_url;

    try {
      if (selectedFile) {
        const uploadRes = await uploadCourseImageAction(selectedFile, token);
        if (!uploadRes.success) throw new Error(uploadRes.error);
        finalImageUrl = uploadRes.imageUrl || "";
      }

      const autoCourseType = getCourseTypeFromCurriculum(form.curriculum_id);
      const payload = {
        curriculum_id: form.curriculum_id,
        title: form.title,
        course_type: autoCourseType, 
        description: form.description,
        price: Number(form.price),
        image_url: finalImageUrl || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        status_id: "COURSE_REGISTRATION", 
      };

      const res = editing 
        ? await updateCourseAction(editing.course_id, payload, token)
        : await createCourseAction(payload, token);

      if (res.success) {
        alert(editing ? "Cập nhật thông tin thành công!" : "Khởi tạo khóa học mới thành công!");
        resetForm();
        fetchInitialData();
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      alert(`Thao tác thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setShowModal(false); 
    setEditing(null);
    setSelectedFile(null);
    setImagePreview("");
    setForm({
      title: "",
      description: "",
      image_url: "",
      price: 0,
      curriculum_id: curriculums.length > 0 ? curriculums[0].curriculum_id : "",
    });
  };

  const handleEdit = (course: Course) => {
    setEditing(course);
    const currentCurriculumId = course.curriculum_id || (course as any).curriculumId || "";

    setForm({
      title: course.title,
      description: course.description || "",
      image_url: course.image_url || "",
      price: course.price,
      curriculum_id: currentCurriculumId, 
    });

    setImagePreview(
      course.image_url?.startsWith("/") 
        ? `${NGINX_URL}${course.image_url}` 
        : course.image_url || ""
    );
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khóa học này khỏi hệ thống?")) {
      const token = getCookie("token") || "";
      const res = await deleteCourseAction(id, token);
      if (res.success) {
        alert("Xóa khóa học thành công!");
        fetchInitialData();
      } else {
        alert(`Không thể xóa bản ghi: ${res.error}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#1E293B] antialiased">
      <Navbar />

      <section className="bg-[#0066FF] text-white pt-8 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 mb-4">
            <Link href="/training-management" className="hover:text-white transition flex items-center gap-1 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Quản lý đào tạo
            </Link>
            <ChevronRight size={12} className="text-white/40" />
            <span className="text-white font-medium">Khóa học hệ thống</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="text-blue-100 text-[10px] font-bold tracking-widest uppercase block bg-white/10 px-2 py-0.5 rounded w-max">
                LUMER ENGINE DB-SYNC
              </span>
              <h1 className="text-3xl font-black tracking-tight uppercase pt-1">QUẢN LÝ KHÓA HỌC HỆ THỐNG</h1>
              <p className="text-blue-100/80 text-xs font-medium">
                Sử dụng nút "Đồng bộ CSDL" để ép ghi đè lại toàn bộ các dữ liệu cũ bị kẹt trong Postgres.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 space-y-6 -mt-12 pb-16 relative z-10">
        
        {/* Widget thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-lg text-center">
            <p className="text-2xl font-black text-[#0066FF]">{courses?.length || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Tổng khóa học</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-lg text-center">
            <p className="text-2xl font-black text-emerald-600">
              {courses?.reduce((sum, c) => sum + (c.price || 0), 0).toLocaleString() || 0}đ
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Tổng giá trị lưu trữ</p>
          </div>
        </div>

        {/* Tìm kiếm & Nút bấm */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề khóa học..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <button
              onClick={handleForceSyncDatabase}
              disabled={isSyncing}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Đang đẩy data lên CSDL..." : "Đồng bộ CSDL"}
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full md:w-auto bg-[#0066FF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition shadow-sm whitespace-nowrap"
            >
              <Plus size={16} /> Thêm khóa học mới
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        {isLoading ? (
          <div className="bg-white rounded-xl border p-12 text-center text-slate-400 text-xs font-bold shadow-xs">
            Đang đồng bộ hóa dữ liệu Postgres...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* DANH SÁCH BÊN TRÁI */}
            <div className="lg:col-span-2 space-y-4">
              {filteredCourses.length === 0 ? (
                <div className="bg-white p-8 border rounded-xl text-center text-slate-400 text-xs italic">
                  Không tìm thấy khóa học phù hợp.
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const isSelected = selectedCourseRow?.course_id === course.course_id;
                  const currentCurriculumId = course.curriculum_id || (course as any).curriculumId;
                  const currentType = getCourseTypeFromCurriculum(currentCurriculumId);
                  const isMismatched = String(course.course_type).toUpperCase() !== currentType;

                  return (
                    <div
                      key={course.course_id}
                      onClick={() => setSelectedCourseRow(course)}
                      className={`bg-white p-4 rounded-xl border transition-all cursor-pointer relative hover:shadow-md ${
                        isSelected ? "border-[#0066FF] ring-2 ring-[#0066FF]/10 shadow-md bg-blue-50/10" : "border-slate-200"
                      } ${isMismatched ? "border-l-4 border-l-amber-500" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          <img 
                            src={course.image_url?.startsWith("http") ? course.image_url : `${NGINX_URL}${course.image_url}`} 
                            alt={course.title} 
                            className="w-16 h-16 object-cover rounded-xl border bg-slate-50 shrink-0 shadow-2xs"
                            onError={(e) => {(e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4";}}
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{course.title}</h4>
                              {isMismatched && (
                                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                  Sai lệch CSDL
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1">{course.description || "Chưa cập nhật mô tả."}</p>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-[11px] text-slate-500 font-medium">
                              <span className="font-semibold text-slate-700">💰 {(course.price || 0).toLocaleString()}đ</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                currentType === "LONG_TERM" ? "text-purple-600 bg-purple-50" : "text-[#0066FF] bg-blue-50"
                              }`}>
                                ⏱️ {currentType === "LONG_TERM" ? "DÀI HẠN" : "NGẮN HẠN"}
                              </span>
                              {/* 🔄 FIX: Lấy tháng bằng cách map ngược vào bảng Curriculum qua ID */}
                              <span className="text-slate-400 flex items-center gap-1 font-bold">
                                <Calendar size={12} /> {getMonthFromCurriculum(currentCurriculumId)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleEdit(course)} className="bg-white text-slate-700 font-bold text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-lg cursor-pointer transition flex items-center gap-1">
                            <Pencil size={12} /> Sửa
                          </button>
                          <button onClick={() => handleDelete(course.course_id)} className="bg-white text-rose-600 font-bold text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-lg cursor-pointer transition flex items-center gap-1">
                            <Trash2 size={12} /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* THÔNG TIN CHI TIẾT BÊN PHẢI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl sticky top-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0066FF]"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3.5 pl-1">Thông tin chi tiết đính kèm</p>
              
              {selectedCourseRow ? (
                <div className="space-y-4 pl-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Đang xem:</span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">{selectedCourseRow.title}</h3>
                  </div>
                  <div className="space-y-2.5 pt-3 border-t text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>
                        Loại hình gốc:{" "}
                        <strong className="text-slate-800">
                          {getCourseTypeFromCurriculum(selectedCourseRow.curriculum_id || (selectedCourseRow as any).curriculumId)}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-red-400" />
                      <span>
                        Lưu trong CSDL:{" "}
                        <strong className="text-red-600 font-black">
                          {String(selectedCourseRow.course_type).toUpperCase()}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-slate-400" />
                      <span>Chi phí khóa: <strong className="text-emerald-600">{(selectedCourseRow.price || 0).toLocaleString()}đ</strong></span>
                    </div>
                    {/* 🔄 FIX: Lấy tháng từ Curriculum hiển thị ở chi tiết bên phải */}
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Thời gian Curriculum: <strong className="text-slate-800">{getMonthFromCurriculum(selectedCourseRow.curriculum_id || (selectedCourseRow as any).curriculumId)}</strong></span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="w-full h-36 rounded-xl border overflow-hidden relative shadow-inner">
                      <img 
                        src={selectedCourseRow.image_url?.startsWith("http") ? selectedCourseRow.image_url : `${NGINX_URL}${selectedCourseRow.image_url}`} 
                        alt="Đại diện" className="w-full h-full object-cover"
                        onError={(e) => {(e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4";}}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-8 text-center">Vui lòng chọn một khóa học bên danh sách để xem.</p>
              )}
            </div>

          </div>
        )}

        {/* MODAL POPUP FORM */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 text-black p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="font-black text-lg mb-5 border-b pb-3 text-slate-900">
                {editing ? "Cập nhật thông tin khóa học" : "Thiết lập cấu trúc khóa học mới"}
              </h2>

              <div className="space-y-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5 uppercase text-gray-400 text-[10px]">Thuộc Chương trình đào tạo (Curriculum)</label>
                  <select
                    value={form.curriculum_id}
                    onChange={(e) => setForm({ ...form, curriculum_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 bg-white font-medium text-gray-800 text-xs cursor-pointer focus:outline-blue-500"
                    required
                  >
                    <option value="" disabled>-- Nhấp để chọn một Chương trình đào tạo... --</option>
                    {curriculums.map((curr) => {
                      const typeBadge = String(curr.course_type || curr.courseType || "SHORT_TERM").toUpperCase();
                      return (
                        <option key={curr.curriculum_id} value={curr.curriculum_id}>
                          {curr.curriculum_name} (Loại: {typeBadge === "LONG_TERM" ? "DÀI HẠN" : "NGẮN HẠN"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-gray-400 text-[10px]">Tên khóa học</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 font-medium text-gray-800 focus:outline-blue-500 text-xs bg-white"
                    placeholder="Nhập tiêu đề hiển thị" required
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-gray-400 text-[10px]">Mô tả tóm tắt</label>
                  <textarea
                    rows={3} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 font-medium text-gray-800 focus:outline-blue-500 text-xs bg-white"
                    placeholder="Nội dung chi tiết..."
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-gray-400 text-[10px]">Học phí khóa học (VNĐ)</label>
                  <input
                    type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-3 font-medium text-gray-800 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-gray-400 text-[10px]">Hình ảnh đại diện khóa học</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col md:flex-row gap-4 items-center border border-dashed border-gray-300 rounded-xl p-4 bg-slate-50/50">
                    <div className="w-32 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border shadow-inner">
                      {imagePreview ? (
                        <img 
                          src={imagePreview.startsWith("blob:") || imagePreview.startsWith("http") ? imagePreview : `${NGINX_URL}${imagePreview}`} 
                          alt="Xem trước" className="w-full h-full object-cover"
                          onError={(e) => {(e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4";}}
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button
                        type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-slate-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        <Upload size={14} /> Chọn ảnh từ thiết bị
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                  type="button" onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-100 text-gray-700 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-200 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button" onClick={handleSubmit}
                  className="bg-[#0066FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md cursor-pointer transition"
                  disabled={isLoading}
                >
                  {isLoading ? "⌛ Đang xử lý dữ liệu..." : editing ? "Cập nhật thay đổi" : "Lưu vào Database"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}