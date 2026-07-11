"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, Pencil, Trash2, FileText, Search, Layers, GraduationCap, 
  FolderOpen, LayoutGrid, X, Activity, CheckCircle, FolderMinus, 
  Paperclip, Download, ChevronRight, ArrowLeft, Video, BookOpen,
  BookMarked, HelpCircle, ArrowUpRight
} from "lucide-react";

import { 
  getCoursesAction, createSubjectAction, updateSubjectAction, deleteSubjectAction,
  Course, Subject
} from "@/actions/getSyllabus";

import { 
  createModuleAction, getModulesBySubjectAction,
  createLessonAction, getLessonsByModuleAction,
  CourseModule, CourseLesson
} from "@/actions/getSyllabus";

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const getFullAssetUrl = (url: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost${url.startsWith("/") ? url : `/${url}`}`; 
};

export default function QuanLyBiensOanSyllabus() {
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState<string>("");
  const [trangThaiLoc, setTrangThaiLoc] = useState<string>("ALL");

  // --- ĐIỀU HƯỚNG TẦNG SÂU CỦA ĐỀ CƯƠNG ---
  const [dangChonCourseId, setDangChonCourseId] = useState<string | null>(null);
  const [dangChonSubjectId, setDangChonSubjectId] = useState<string | null>(null);
  const [dangChonModuleId, setDangChonModuleId] = useState<string | null>(null);

  // --- DỮ LIỆU ĐƯỢC FETCH ĐỘNG TỪ API ---
  const [danhSachModules, setDanhSachModules] = useState<CourseModule[]>([]);
  const [danhSachLessons, setDanhSachLessons] = useState<CourseLesson[]>([]);

  // --- STATE QUẢN LÝ POPUP MODAL ---
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [subjectForm, setSubjectForm] = useState({ title: "", description: "" });

  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);
  const [moduleForm, setModuleForm] = useState({ title: "" });

  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [lessonForm, setLessonForm] = useState({ title: "", duration_minutes: 45, video_url: "", content_body: "" });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const taiDuLieu = async () => {
    setLoading(true);
    try {
      const token = getCookie("token") || "";
      const data = await getCoursesAction(token);
      setDanhSachKhoaHoc(data || []);
    } catch (error) {
      console.error("Lỗi nạp danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { taiDuLieu(); }, []);

  useEffect(() => {
    if (dangChonSubjectId) {
      const token = getCookie("token") || "";
      getModulesBySubjectAction(dangChonSubjectId, token).then(res => setDanhSachModules(res || []));
    } else {
      setDanhSachModules([]);
    }
    setDangChonModuleId(null);
  }, [dangChonSubjectId]);

  useEffect(() => {
    if (dangChonModuleId) {
      const token = getCookie("token") || "";
      getLessonsByModuleAction(dangChonModuleId, token).then(res => setDanhSachLessons(res || []));
    } else {
      setDanhSachLessons([]);
    }
  }, [dangChonModuleId]);

  const khoaHocHienTai = useMemo(() => danhSachKhoaHoc.find(k => k.course_id === dangChonCourseId) || null, [danhSachKhoaHoc, dangChonCourseId]);
  const subjectHienTai = useMemo(() => khoaHocHienTai?.subjects?.find(s => s.subject_id === dangChonSubjectId) || null, [khoaHocHienTai, dangChonSubjectId]);
  const moduleHienTai = useMemo(() => danhSachModules.find(m => m.module_id === dangChonModuleId) || null, [danhSachModules, dangChonModuleId]);

  const danhSachDaLoc = useMemo(() => {
    return danhSachKhoaHoc.filter(khoa => {
      const matchesSearch = (khoa.title || "").toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
      const matchesStatus = trangThaiLoc === "ALL" || (khoa.status_id || "").toUpperCase() === trangThaiLoc.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [danhSachKhoaHoc, tuKhoaTimKiem, trangThaiLoc]);

  // Thống kê số liệu nhanh ở màn hình chính
  const tongSoKhoaHoc = danhSachKhoaHoc.length;
  const khoaHocDangHoatDong = danhSachKhoaHoc.filter(k => (k.status_id || "").toUpperCase() === "COURSE_ONGOING").length;
  const tongSoHocPhan = danhSachKhoaHoc.reduce((acc, cur) => acc + (cur.subjects?.length || 0), 0);

  const tenFileDinhKem = useMemo(() => {
    if (!khoaHocHienTai || !khoaHocHienTai.curriculum_file_path) return null;
    const parts = khoaHocHienTai.curriculum_file_path.split("/");
    const fullFileName = parts[parts.length - 1];
    if (fullFileName.includes("-") && fullFileName.length > 37) {
      return fullFileName.substring(fullFileName.indexOf("-") + 1);
    }
    return fullFileName.length > 35 ? fullFileName.substring(0, 18) + "..." + fullFileName.substring(fullFileName.length - 12) : fullFileName;
  }, [khoaHocHienTai]);

  // --- SUBMIT HANDLERS ---
  const handleSubjectSubmit = async () => {
    if (!subjectForm.title.trim() || !dangChonCourseId) return alert("Vui lòng nhập tiêu đề!");
    setIsSubmitting(true);
    const token = getCookie("token") || "";
    const res = await createSubjectAction({ course_id: dangChonCourseId, ...subjectForm }, token);
    if (res.success) {
      setShowSubjectModal(false);
      setSubjectForm({ title: "", description: "" });
      await taiDuLieu();
    } else alert(res.error);
    setIsSubmitting(false);
  };

  const handleModuleSubmit = async () => {
    if (!moduleForm.title.trim() || !dangChonSubjectId) return alert("Vui lòng nhập tên chương học!");
    setIsSubmitting(true);
    const token = getCookie("token") || "";
    const res = await createModuleAction({ subject_id: dangChonSubjectId, title: moduleForm.title }, token);
    if (res.success) {
      setShowModuleModal(false);
      setModuleForm({ title: "" });
      const updatedModules = await getModulesBySubjectAction(dangChonSubjectId, token);
      setDanhSachModules(updatedModules || []);
    } else alert("Lỗi khi tạo chương học");
    setIsSubmitting(false);
  };

  const handleLessonSubmit = async () => {
    if (!lessonForm.title.trim() || !dangChonModuleId) return alert("Vui lòng nhập tên bài học!");
    setIsSubmitting(true);
    const token = getCookie("token") || "";
    const res = await createLessonAction({ module_id: dangChonModuleId, ...lessonForm }, token);
    if (res.success) {
      setShowLessonModal(false);
      setLessonForm({ title: "", duration_minutes: 45, video_url: "", content_body: "" });
      const updatedLessons = await getLessonsByModuleAction(dangChonModuleId, token);
      setDanhSachLessons(updatedLessons || []);
    } else alert("Lỗi khi tạo bài học");
    setIsSubmitting(false);
  };

  if (loading && danhSachKhoaHoc.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#4364F7] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 tracking-wide">Đang đồng bộ dữ liệu liên kết cấu trúc...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] antialiased font-sans pb-20">
      
      {/* BANNER ĐẦU TRANG */}
      <section className="bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] text-white pt-12 pb-24 relative overflow-hidden shadow-xs">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80 mb-4">
            <Link href="/training-management" className="hover:text-white transition-all flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs no-underline text-white">
              &larr; Quay về Dashboard Phòng Đào Tạo
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-3 drop-shadow-xs">
                <GraduationCap size={36} className="text-blue-200" />
                QUẢN LÝ ĐỀ CƯƠNG CHI TIẾT & SYLLABUS
              </h1>
              <p className="text-blue-50 text-xs md:text-sm font-medium opacity-90 max-w-2xl">
                {khoaHocHienTai 
                  ? `Không gian thiết kế chương trình học phần nâng cao cho khóa học: ${khoaHocHienTai.title}`
                  : "Thiết kế cấu trúc lộ trình học nâng cao, phân phối chương mục độc lập và biên soạn nội dung giảng dạy đa tầng."
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIỆN MẠO MÀN HÌNH 1: DANH SÁCH KHÓA HỌC KHÁI QUÁT */}
      {!khoaHocHienTai ? (
        <>
          {/* STATS TIỆN ÍCH */}
          <section className="max-w-7xl mx-auto px-6 -mt-10 mb-10 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng Số Khóa Học</span>
                  <span className="text-3xl font-black text-[#4364F7] block leading-none">{tongSoKhoaHoc}</span>
                </div>
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#4364F7]">
                  <Activity size={22} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đang Hoạt Động</span>
                  <span className="text-3xl font-black text-emerald-600 block leading-none">{khoaHocDangHoatDong}</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <CheckCircle size={22} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số Học Phần (Subject)</span>
                  <span className="text-3xl font-black text-amber-500 block leading-none">{tongSoHocPhan}</span>
                </div>
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-500">
                  <Layers size={22} />
                </div>
              </div>
            </div>
          </section>

          {/* BỘ LỌC TÌM KIẾM */}
          <section className="max-w-7xl mx-auto px-6 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                  placeholder="Tìm kiếm theo tên khóa học muốn biên soạn đề cương..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#4364F7] focus:bg-white transition-all"
                />
              </div>
              <div className="w-full md:w-64 shrink-0">
                <select
                  value={trangThaiLoc} onChange={(e) => setTrangThaiLoc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-[#4364F7]"
                >
                  <option value="ALL">📋 TẤT CẢ TRẠNG THÁI</option>
                  <option value="COURSE_ONGOING">🟢 COURSE_ONGOING</option>
                </select>
              </div>
            </div>
          </section>

          {/* GRID KẾT QUẢ KHÓA HỌC */}
          <section className="max-w-7xl mx-auto px-6">
            {danhSachDaLoc.length === 0 ? (
              <div className="bg-white border rounded-2xl p-20 text-center shadow-2xs">
                <FolderMinus size={48} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-600">Không tìm thấy dữ liệu khóa học tương ứng</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {danhSachDaLoc.map((khoa) => (
                  <div key={khoa.course_id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-slate-50 text-slate-500 font-mono font-bold px-2 py-0.5 rounded-md border">
                          ID: {khoa.course_id.substring(0, 6)}...
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide bg-emerald-50 border border-emerald-200 text-emerald-700">
                          {khoa.status_id || "ONGOING"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-[#4364F7] transition-colors line-clamp-2 min-h-[40px] pt-1">
                        {khoa.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">
                        {khoa.description || "Chương trình hiện chưa cập nhật mô tả tổng quan."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                        <Layers size={14} className="text-[#4364F7]" />
                        <strong>{(khoa.subjects || []).length}</strong> Học phần
                      </span>
                      <button
                        onClick={() => setDangChonCourseId(khoa.course_id)}
                        className="bg-[#4364F7] hover:bg-[#0052D4] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Biên soạn &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* MÀN HÌNH 2: WORKSPACE KHÔNG GIAN BIÊN SOẠN NÂNG CAO */
        <section className="max-w-7xl mx-auto px-6 mt-6 space-y-6 animate-in fade-in duration-150">
          
          {/* THANH THANG ĐIỀU HƯỚNG BREADCRUMB PHÂN TẦNG */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 font-bold text-xs text-slate-500">
              <button onClick={() => { setDangChonCourseId(null); setDangChonSubjectId(null); }} className="text-[#4364F7] hover:underline flex items-center gap-1 font-black">
                <LayoutGrid size={14}/> Khóa học
              </button>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <span className="text-slate-900 font-black max-w-[140px] truncate">{khoaHocHienTai.title}</span>
              
              {subjectHienTai && (
                <>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <button onClick={() => setDangChonModuleId(null)} className="text-blue-600 hover:underline font-black">
                    📚 Học phần: {subjectHienTai.title}
                  </button>
                </>
              )}

              {moduleHienTai && (
                <>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-black">
                    📂 Chương: {moduleHienTai.title}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => {
                if (dangChonModuleId) setDangChonModuleId(null);
                else if (dangChonSubjectId) setDangChonSubjectId(null);
                else setDangChonCourseId(null);
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={12} /> Cấp trên
            </button>
          </div>

          {/* TÀI LIỆU CURRICULUM ĐÍNH KÈM */}
          {!dangChonSubjectId && (
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl mt-0.5"><Paperclip size={18} /></div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Tài liệu khung chương trình đào tạo gốc (Curriculum File)</h4>
                  <p className="text-xs text-amber-700/90 font-medium">Bản gốc dùng để đối chiếu cấu trúc Syllabus bài giảng.</p>
                </div>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                {khoaHocHienTai.curriculum_file_path ? (
                  <a 
                    href={getFullAssetUrl(khoaHocHienTai.curriculum_file_path)} target="_blank" rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-white hover:bg-amber-100/60 text-amber-800 border border-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs no-underline"
                  >
                    <Download size={13} /> {tenFileDinhKem || "Download_File.pdf"}
                  </a>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-400 font-bold px-3 py-2 rounded-xl border border-dashed block text-center select-none">⚠️ Chưa đính kèm file</span>
                )}
              </div>
            </div>
          )}

          {/* ----- PHẦN HIỂN THỊ DỮ LIỆU ĐA TẦNG CỰC KỲ ĐẸP VÀ GỌN ----- */}

          {/* CẤP 2: QUẢN LÝ HỌC PHẦN (SUBJECT) */}
          {!dangChonSubjectId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-2">
                  <BookMarked size={16} className="text-[#4364F7]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Tầng 2: Danh sách Học phần ({khoaHocHienTai.subjects?.length || 0} môn học)</h3>
                </div>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="bg-[#4364F7] hover:bg-[#0052D4] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Thêm Học Phần Mới
                </button>
              </div>

              {khoaHocHienTai.subjects && khoaHocHienTai.subjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {khoaHocHienTai.subjects.map((sbj, index) => (
                    <div key={sbj.subject_id} className="p-5 border border-slate-200/80 bg-[#F8FAFC]/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:bg-white hover:border-slate-300 transition-all duration-150 group">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4364F7] border border-blue-100 font-mono text-xs font-black flex items-center justify-center shrink-0 shadow-inner">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">SUBJECT ID: {sbj.subject_id}</span>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#4364F7] transition-colors">{sbj.title}</h4>
                          <p className="text-xs text-slate-400 font-medium line-clamp-1">{sbj.description || "Chưa cập nhật tóm tắt mục tiêu đầu ra."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto justify-end">
                        <button
                          onClick={() => setDangChonSubjectId(sbj.subject_id)}
                          className="bg-white hover:bg-slate-50 text-[#4364F7] border border-blue-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                        >
                          Cấu trúc Chương Mục (Module) <ArrowUpRight size={12}/>
                        </button>
                        <button className="text-rose-600 hover:bg-rose-50 border border-slate-200 p-2 rounded-xl transition-all cursor-pointer"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                  <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">Chưa có Học phần nào trong khóa học này</h4>
                </div>
              )}
            </div>
          )}

          {/* CẤP 3: QUẢN LÝ CHƯƠNG MỤC (MODULE) */}
          {dangChonSubjectId && !dangChonModuleId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Tầng 3: Danh sách các Chương Mục (Module)</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Thuộc học phần học tập: <strong className="text-slate-700">{subjectHienTai?.title}</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Thêm Chương Mục Mới
                </button>
              </div>

              {danhSachModules.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {danhSachModules.map((mod, index) => (
                    <div key={mod.module_id} className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl flex justify-between items-center hover:bg-white hover:border-emerald-300 transition-all duration-150 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono font-black flex items-center justify-center text-xs shadow-2xs">{index + 1}</div>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{mod.title}</h4>
                      </div>
                      <button
                        onClick={() => setDangChonModuleId(mod.module_id)}
                        className="bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/50 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        Biên soạn Bài Học Chi Tiết (Lesson) <ChevronRight size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                  <HelpCircle size={32} className="text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-600">Bảng dữ liệu module trống học phần này chưa được chia chương.</h4>
                </div>
              )}
            </div>
          )}

          {/* CẤP 4: BIÊN SOẠN BÀI HỌC CHI TIẾT VÀ SYLLABUS (LESSON) */}
          {dangChonModuleId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-600" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Tầng 4: Phân phối Bài học chi tiết & Syllabus (Lesson)</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Định vị cấu trúc bên trong: <strong className="text-emerald-700">{moduleHienTai?.title}</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLessonModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Thêm Bài Học Mới
                </button>
              </div>

              {danhSachLessons.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {danhSachLessons.map((les, index) => (
                    <div key={les.lesson_id} className="p-4 border border-purple-100 bg-purple-50/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group hover:bg-white hover:border-purple-300 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-xs flex flex-wrap items-center gap-2">
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-mono">Bài {index + 1}</span>
                          {les.title}
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 text-slate-500 rounded font-normal font-mono">⏱️ {les.duration_minutes} phút</span>
                        </h4>
                        {les.video_url && (
                          <p className="text-slate-400 font-mono text-[10px] flex items-center gap-1 mt-0.5"><Video size={11}/> Link Streaming: <span className="text-blue-500 underline truncate max-w-md">{les.video_url}</span></p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0 self-end sm:self-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-500 font-bold border bg-white px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 text-[10px] cursor-pointer">Sửa</button>
                        <button className="text-rose-600 font-bold border border-rose-100 bg-white px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-rose-50 text-[10px] cursor-pointer">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                  <Video size={32} className="text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-600">Chương này chưa có nội dung bài học hoặc video bài giảng.</h4>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ----------------- HỆ THỐNG POPUP MODALS CHUẨN THẨM MỸ ----------------- */}

      {/* 1. Modal Thêm Học Phần */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-tight">🚀 Tạo học phần mới (Subject)</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Tiêu đề học phần *</label>
                <input type="text" value={subjectForm.title} onChange={e => setSubjectForm({ ...subjectForm, title: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-[#4364F7] bg-white text-slate-800" placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Tóm tắt nội dung mục tiêu đầu ra</label>
                <textarea rows={3} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-[#4364F7] bg-white text-slate-800 resize-none" placeholder="Mô tả tóm tắt..."/>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t flex justify-end gap-2.5">
              <button onClick={() => setShowSubjectModal(false)} className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs rounded-xl text-slate-600 transition hover:bg-slate-50 cursor-pointer">Hủy bỏ</button>
              <button onClick={handleSubjectSubmit} disabled={isSubmitting} className="px-5 py-2 bg-[#4364F7] hover:bg-[#0052D4] text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer">Lưu cấu trúc</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Thêm Chương Học */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-xs text-emerald-900 uppercase tracking-tight">📂 Tạo chương mục mới (Module)</h3>
              <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Tên chương học mới *</label>
                <input type="text" value={moduleForm.title} onChange={e => setModuleForm({ title: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-emerald-600 bg-white text-slate-800" placeholder="Ví dụ: Chương 2: Các giải thuật sắp xếp tuyến tính"/>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t flex justify-end gap-2.5">
              <button onClick={() => setShowModuleModal(false)} className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs rounded-xl text-slate-600 transition hover:bg-slate-50 cursor-pointer">Hủy</button>
              <button onClick={handleModuleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer">Tạo chương</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Thêm Bài Học Chi Tiết */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-xs text-purple-900 uppercase tracking-tight">📝 Thêm bài học & Syllabus (Lesson)</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-500 font-medium">Tên bài học học phần *</label>
                <input type="text" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-purple-600 bg-white text-slate-800" placeholder="Ví dụ: Bài 2.1: Phân tích thuật toán Quick Sort"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-medium">Thời lượng (phút)</label>
                  <input type="number" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-purple-600 bg-white text-slate-800"/>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-medium">Đường dẫn Video giảng</label>
                  <input type="text" value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:outline-none focus:border-purple-600 bg-white text-slate-800" placeholder="https://youtube.com/..."/>
                </div>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t flex justify-end gap-2.5">
              <button onClick={() => setShowLessonModal(false)} className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs rounded-xl text-slate-600 transition hover:bg-slate-50 cursor-pointer">Hủy bỏ</button>
              <button onClick={handleLessonSubmit} disabled={isSubmitting} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer">Lưu bài học</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}