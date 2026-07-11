"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  getCurriculums, 
  uploadCurriculums, 
  createCurriculum,
  updateCurriculum,
  deleteCurriculum
} from "@/actions/getCurriculum";

type DisplayStatus = "Bản nháp" | "Thẩm định" | "Đang hoạt động" | "Tạm ngưng";

interface Curriculum {
  curriculum_id: string;
  assigner_id: string | null;
  curriculum_name: string;
  description: string;
  course_type: string;
  course_finished_months: number;
  curriculum_file_path: string | null;
  certificate_name: string;
  status_id: string;
}

const STATUS_MAP_TO_FRONTEND: Record<string, DisplayStatus> = {
  "CURRICULUM_DRAFT": "Bản nháp",
  "CURRICULUM_REVIEWING": "Thẩm định",
  "CURRICULUM_ACTIVE": "Đang hoạt động",
  "CURRICULUM_SUSPENDED": "Tạm ngưng"
};

const STATUS_MAP_TO_BACKEND: Record<DisplayStatus, string> = {
  "Bản nháp": "CURRICULUM_DRAFT",
  "Thẩm định": "CURRICULUM_REVIEWING",
  "Đang hoạt động": "CURRICULUM_ACTIVE",
  "Tạm ngưng": "CURRICULUM_SUSPENDED"
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const getFileNameFromUrl = (url: string | null): string => {
  if (!url) return "Chưa có file đính kèm";
  const parts = url.split("/");
  const rawFileName = parts[parts.length - 1];
  if (rawFileName.includes("-") && rawFileName.length > 37) {
    return rawFileName.substring(rawFileName.indexOf("-") + 1);
  }
  return rawFileName;
};

const getFullAssetUrl = (url: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost${cleanUrl}`; 
};

interface FormDataState {
  curriculumName: string;
  description: string;
  courseFinishedMonths: number; 
  status: DisplayStatus;
  certificateName: string;
  courseType: string;
  syllabusFile: File | null;
}

export default function LumerCurriculumManagement() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null); 
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    curriculumName: "",
    description: "",
    courseFinishedMonths: 3,
    status: "Bản nháp",
    certificateName: "",
    courseType: "SHORT_TERM",
    syllabusFile: null,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("token") || "";
      const data = await getCurriculums(token);
      setCurriculums(data || []);
      if (data && data.length > 0) {
        setSelectedCurriculum(data[0]);
      } else {
        setSelectedCurriculum(null);
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCurriculums = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return curriculums;
    return curriculums.filter(c => c.curriculum_name.toLowerCase().includes(lowerSearch));
  }, [curriculums, searchTerm]);

  const stats = useMemo(() => {
    const total = curriculums.length;
    const active = curriculums.filter(c => STATUS_MAP_TO_FRONTEND[c.status_id] === "Đang hoạt động").length;
    const draft = curriculums.filter(c => STATUS_MAP_TO_FRONTEND[c.status_id] === "Bản nháp").length;
    const avgMonths = total > 0 ? Math.round(curriculums.reduce((acc, c) => acc + c.course_finished_months, 0) / total) : 0;
    return { total, active, draft, avgMonths };
  }, [curriculums]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      curriculumName: "", 
      description: "", 
      courseFinishedMonths: 3, 
      status: "Bản nháp", 
      certificateName: "", 
      courseType: "SHORT_TERM",
      syllabusFile: null, 
    });
    setIsOpenModal(true);
  };

  const openEditModal = (curriculum: Curriculum, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    setIsEditMode(true);
    setSelectedCurriculum(curriculum);
    setFormData({
      curriculumName: curriculum.curriculum_name,
      description: curriculum.description || "",
      courseFinishedMonths: curriculum.course_finished_months,
      status: STATUS_MAP_TO_FRONTEND[curriculum.status_id] || "Bản nháp",
      certificateName: curriculum.certificate_name || "",
      courseType: curriculum.course_type || "SHORT_TERM",
      syllabusFile: null, 
    });
    setIsOpenModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFormData(prev => ({ ...prev, syllabusFile: selectedFile }));
    }
  };

  const handleDelete = async (curriculumId: string, e: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    if (!confirm("Hệ thống Lumer cảnh báo: Bạn có chắc chắn muốn xóa Chương trình đào tạo này không?")) return;
    setIsLoading(true);
    try {
      const token = getCookie("token") || "";
      await deleteCurriculum(curriculumId, token);
      alert("Xóa chương trình đào tạo thành công!");
      fetchInitialData(); 
    } catch (error: any) {
      alert(`Lỗi khi xóa bản ghi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = getCookie("token") || "";

    try {
      let uploadedFilePath = selectedCurriculum?.curriculum_file_path || null;
      if (formData.syllabusFile) {
        const uploadRes = await uploadCurriculums(formData.syllabusFile, token, selectedCurriculum?.curriculum_id);
        uploadedFilePath = uploadRes?.curriculum_file_path || uploadRes?.filePath || uploadRes?.url || null;
      }

      const curriculumPayload = {
        curriculum_name: formData.curriculumName,
        description: formData.description,
        course_type: formData.courseType, 
        course_finished_months: Number(formData.courseFinishedMonths),
        certificate_name: formData.certificateName,
        status_id: STATUS_MAP_TO_BACKEND[formData.status], 
        curriculum_file_path: uploadedFilePath
      };

      if (isEditMode && selectedCurriculum) {
        await updateCurriculum(selectedCurriculum.curriculum_id, curriculumPayload, token);
        alert("Cập nhật Chương trình đào tạo thành công!");
      } else {
        await createCurriculum(curriculumPayload, token);
        alert("Khởi tạo Chương trình đào tạo mới thành công!");
      }

      setIsOpenModal(false);
      fetchInitialData(); 
    } catch (error: any) {
      alert(`Thao tác thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans antialiased">
      <Navbar />

      <div className="w-full bg-[#0066FF] text-white pt-10 pb-20 px-6 shadow-sm relative">
        <div className="max-w-7xl w-full mx-auto">
          <Link href="/training-management" className="text-xs text-blue-100 font-bold hover:text-white transition-all mb-4 inline-flex items-center gap-1 no-underline">
            ⬅ Quay về Dashboard Phòng Đào Tạo
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-2">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Quản lý Chương trình đào tạo</h1>
              <p className="text-sm text-blue-100/90 mt-1.5 font-medium">Thiết kế cấu trúc lộ trình học và quản lý file nội dung chương trình đào tạo của hệ thống</p>
            </div>
            <button onClick={openAddModal} className="bg-white hover:bg-blue-50 text-[#0066FF] text-xs font-black px-5 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-md border-none">
              ➕ Tạo chương trình đào tạo mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-center flex flex-col justify-center min-h-25">
            <div className="text-xl font-black text-[#0066FF]">{stats.total}</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-1">Tổng chương trình</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-center flex flex-col justify-center min-h-25">
            <div className="text-xl font-black text-green-600">{stats.active}</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-1">Đang hoạt động</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-center flex flex-col justify-center min-h-25">
            <div className="text-xl font-black text-amber-500">{stats.draft}</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-1">Bản nháp tạm lưu</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-center flex flex-col justify-center min-h-25">
            <div className="text-xl font-black text-purple-600">{stats.avgMonths} tháng</div>
            <div className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-1">Thời gian học TB</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 pt-8">
        <div className="max-w-sm">
          <input type="text" placeholder="Tìm theo tên chương trình đào tạo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-blue-500 shadow-sm text-gray-800 font-medium" />
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 pb-12 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Danh sách chương trình học ({filteredCurriculums.length})
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-xs text-gray-500 font-medium bg-white border rounded-2xl">🔄 Đang đồng bộ dữ liệu máy chủ...</div>
          ) : (
            filteredCurriculums.map((c) => (
              <div key={c.curriculum_id} onClick={() => setSelectedCurriculum(c)} className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col bg-white gap-3 shadow-sm ${selectedCurriculum?.curriculum_id === c.curriculum_id ? "border-[#0066FF] ring-2 ring-blue-500/10" : "border-gray-100 hover:border-gray-300"}`}>
                <div className="flex items-start justify-between w-full">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      STATUS_MAP_TO_FRONTEND[c.status_id] === "Đang hoạt động" ? "bg-green-50 text-green-600" : STATUS_MAP_TO_FRONTEND[c.status_id] === "Bản nháp" ? "bg-amber-50 text-amber-600" : STATUS_MAP_TO_FRONTEND[c.status_id] === "Thẩm định" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}>
                      {STATUS_MAP_TO_FRONTEND[c.status_id] || "Bản nháp"}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1">{c.curriculum_name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={(e) => openEditModal(c, e)} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-[#0066FF] hover:text-white border-none rounded-lg cursor-pointer text-[11px] font-bold transition-all flex items-center gap-0.5">
                      ✏️ Sửa
                    </button>
                    <button onClick={(e) => handleDelete(c.curriculum_id, e)} className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white border-none rounded-lg cursor-pointer text-[11px] font-bold transition-all flex items-center gap-0.5">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{c.description || "Chương trình hiện chưa tích hợp mô tả tóm tắt hệ thống."}</p>

                <div className="border-t border-gray-50 pt-3 flex items-center justify-between gap-2 text-[11px] font-semibold text-gray-500">
                  <span>⏱ Thời lượng: {c.course_finished_months} tháng</span>
                  <span className="text-[#0066FF] truncate max-w-50">
                    File: {getFileNameFromUrl(c.curriculum_file_path)}
                  </span>
                </div>
              </div>
            ))
          )}

          {!isLoading && filteredCurriculums.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">Chưa tìm thấy chương trình học nào khớp.</div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin chi tiết đính kèm</div>
          
          {selectedCurriculum ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đang xem cấu trúc:</h4>
                <h2 className="text-sm font-black text-gray-900 leading-snug">{selectedCurriculum.curriculum_name}</h2>
              </div>

              <div className="text-xs space-y-2 border-t border-gray-50 pt-3 font-medium">
                <p className="text-gray-600"><span className="text-gray-400">⏱ Thời lượng dự kiến:</span> {selectedCurriculum.course_finished_months} tháng</p>
                <p className="text-gray-600"><span className="text-gray-400">🏅 Loại hình:</span> {selectedCurriculum.course_type}</p>
                <p className="text-gray-600"><span className="text-gray-400">🏅 Chứng chỉ cấp phát:</span> {selectedCurriculum.certificate_name || "N/A"}</p>
                <div className="pt-1">
                  <span className="text-gray-400 block mb-1">📁 File học liệu đính kèm:</span>
                  {selectedCurriculum.curriculum_file_path ? (
                    <a href={getFullAssetUrl(selectedCurriculum.curriculum_file_path)} target="_blank" rel="noreferrer" className="text-[#0066FF] font-bold hover:underline break-all block no-underline bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                      📥 {getFileNameFromUrl(selectedCurriculum.curriculum_file_path)}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic font-medium block p-2 bg-gray-50 rounded-lg text-center">Chưa cung cấp file tài liệu</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-150">
                <button onClick={() => openEditModal(selectedCurriculum)} className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition border-none text-xs cursor-pointer shadow-sm">
                  ✏️ Sửa đổi
                </button>
                <button onClick={(e) => handleDelete(selectedCurriculum.curriculum_id, e)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl transition border-none text-xs cursor-pointer shadow-sm">
                  🗑️ Xóa bỏ
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-xs text-gray-400">Vui lòng chọn một chương trình đào tạo ở danh sách bên cạnh.</div>
          )}
        </div>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">
              {isEditMode ? "Cập nhật chương trình đào tạo" : "Thiết kế chương trình đào tạo mới"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-gray-500 font-bold">
              <div>
                <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Tên chương trình đào tạo (curriculum_name)</label>
                <input type="text" placeholder="Ví dụ: Kỹ nghệ phần mềm chuyên sâu" value={formData.curriculumName} onChange={(e) => setFormData(prev => ({...prev, curriculumName: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 placeholder-gray-300 focus:outline-blue-500 text-xs bg-white" required />
              </div>

              <div>
                <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Mô tả tóm tắt chương trình đào tạo</label>
                <textarea rows={3} placeholder="Tóm lược mục tiêu cấu trúc lộ trình..." value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 placeholder-gray-300 focus:outline-blue-500 text-xs bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Số tháng hoàn thành (integer)</label>
                  <input type="number" min={1} max={48} value={formData.courseFinishedMonths} onChange={(e) => setFormData(prev => ({...prev, courseFinishedMonths: parseInt(e.target.value) || 0}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 focus:outline-blue-500 text-xs bg-white" required />
                </div>
                <div>
                  <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Loại chương trình (course_type)</label>
                  <select value={formData.courseType} onChange={(e) => setFormData(prev => ({...prev, courseType: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 focus:outline-blue-500 text-xs bg-white cursor-pointer">
                    <option value="SHORT_TERM">Ngắn hạn (SHORT_TERM)</option>
                    <option value="LONG_TERM">Dài hạn (LONG_TERM)</option>
                  </select>
                </div>
              </div>

              {isEditMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Trạng thái phát hành</label>
                    <select value={formData.status} onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as DisplayStatus}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 focus:outline-blue-500 text-xs bg-white cursor-pointer">
                      <option value="Bản nháp">Bản nháp (CURRICULUM_DRAFT)</option>
                      <option value="Thẩm định">Thẩm định (CURRICULUM_REVIEWING)</option>
                      <option value="Đang hoạt động">Đang hoạt động (CURRICULUM_ACTIVE)</option>
                      <option value="Tạm ngưng">Tạm ngưng (CURRICULUM_SUSPENDED)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Tên chứng chỉ cấp phát (certificate_name)</label>
                    <input type="text" placeholder="Ví dụ: LUMER Certified Engineer" value={formData.certificateName} onChange={(e) => setFormData(prev => ({...prev, certificateName: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 placeholder-gray-300 focus:outline-blue-500 text-xs bg-white" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">Tên chứng chỉ cấp phát (certificate_name)</label>
                  <input type="text" placeholder="Ví dụ: LUMER Certified Engineer" value={formData.certificateName} onChange={(e) => setFormData(prev => ({...prev, certificateName: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-800 placeholder-gray-300 focus:outline-blue-500 text-xs bg-white" />
                </div>
              )}

              <div>
                <label className="block text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">
                  {isEditMode ? "Thay đổi file đính kèm (Để trống nếu giữ file cũ)" : "Tải lên file chương trình (curriculum_file_path)"}
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="bg-[#F1F5F9] hover:bg-slate-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition border border-gray-200 shadow-sm inline-flex items-center gap-2 text-xs">
                    📁 Chọn tập tin (.pdf, .docx)...
                    <input type="file" className="hidden" accept=".pdf,.docx,.xlsx" onChange={handleFileChange} />
                  </label>
                  <span className="text-gray-400 font-medium italic text-xs truncate max-w-62.5">
                    {formData.syllabusFile ? formData.syllabusFile.name : isEditMode ? "Giữ nguyên file cũ của hệ thống" : "Chưa có file nào được chọn"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => setIsOpenModal(false)} className="px-6 py-2.5 bg-[#F1F5F9] hover:bg-slate-200 text-gray-700 font-bold rounded-full transition cursor-pointer border-none text-xs" disabled={isLoading}>Hủy</button>
                <button type="submit" className="px-6 py-2.5 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold rounded-full transition cursor-pointer border-none text-xs shadow-md" disabled={isLoading}>
                  {isLoading ? "⌛ Đang ghi nhận thay đổi..." : isEditMode ? "Cập nhật dữ liệu" : "Xác nhận tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}