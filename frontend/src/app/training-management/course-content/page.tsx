"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Search, ArrowLeft, ChevronRight, BookOpen, Layers, FileText, Plus, X, Paperclip, ExternalLink, Info
} from "lucide-react";

import { Course } from "@/types/course";
import { getCoursesAction } from "@/actions/getCourse";
import { getSubjectsByCourseAction, createSubjectAction } from "@/actions/getSubject";
import { getSyllabusBySubjectAction, createSyllabusAction, uploadFileAction} from "@/actions/getSyllabus";
import { getCurriculumsAction } from "@/actions/getCurriculum";

const URL_NGINX = process.env.NEXT_PUBLIC_NGINX_URL || "";

const getFullAssetUrl = (path?: string | null): string => {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = URL_NGINX.replace(/\/$/, "");
  return `${baseUrl}${cleanPath}`;
};

function FileCard({ filePath, label = "Tài liệu đính kèm" }: { filePath?: string | null; label?: string }) {
  if (!filePath) return null;
  const fullUrl = getFullAssetUrl(filePath);
  
  const fileName = filePath.split("/").pop() || "Tai-lieu";
  const rawExt = fileName.split(".").pop() || "FILE";
  const extension = rawExt.length <= 5 ? rawExt.toUpperCase() : "FILE";

  return (
    <div className="flex items-center justify-between p-2.5 my-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-all shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0066FF] font-bold flex items-center justify-center text-[10px] shrink-0 uppercase tracking-wider">
          {extension}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-[11px] truncate">{label}</p>
          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <Paperclip size={10} /> {fileName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-[#0066FF] hover:text-[#0066FF] text-slate-700 font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
        >
          <ExternalLink size={12} /> Xem
        </a>
      </div>
    </div>
  );
}

export default function CourseContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  const [syllabuses, setSyllabuses] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");

  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState<boolean>(false);

  const [subjectForm, setSubjectForm] = useState({
    title: "",
    description: "",
    order_index: 1
  });

  const [syllabusForm, setSyllabusForm] = useState({
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true);
      try {
        const data = await getCoursesAction();
        if (data && Array.isArray(data)) {
          setCourses(data);
          if (data.length > 0) {
            handleSelectCourse(data[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    setSyllabuses([]);
    setCurriculumFile(null);

    if (course?.curriculum_id) {
      try {
        const currRes: any = await getCurriculumsAction();
        const curriculumList = Array.isArray(currRes) ? currRes : currRes?.data || [];
        
        const currData = curriculumList.find(
          (c: any) => (c.curriculum_id || c.id) === course.curriculum_id
        );

        if (currData) {
          const filePath = 
            currData?.file_path || 
            currData?.curriculum_file_path || 
            currData?.file_url || 
            currData?.syllabus_file_path;

          setCurriculumFile(filePath || null);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin Curriculum:", error);
      }
    }
    
    try {
      const res: any = await getSubjectsByCourseAction(course.course_id);
      const subjectList = Array.isArray(res) ? res : res?.data || [];
      setSubjects(subjectList);

      if (subjectList.length > 0) {
        handleSelectSubject(subjectList[0]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
      setSubjects([]);
    }
  };

  // 💡 HÀM ĐÃ SỬA: Xử lý dữ liệu Đề cương trả về dạng Object chuẩn
  const handleSelectSubject = async (subject: any) => {
    setSelectedSubject(subject);
    try {
      const res: any = await getSyllabusBySubjectAction(subject.subject_id);
      
      // Backend trả về Object { syllabus_id: "..." } nếu tìm thấy
      if (res && (res.syllabus_id || res.id)) {
        setSyllabuses([res]);
      } else if (Array.isArray(res)) {
        setSyllabuses(res);
      } else {
        setSyllabuses([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải đề cương:", error);
      setSyllabuses([]);
    }
  };

  const handleCreateSubject = async () => {
    if (!selectedCourse) return alert("Chưa chọn khóa học!");
    if (!subjectForm.title.trim()) return alert("Vui lòng nhập tên môn học!");

    setIsLoading(true);
    try {
      const payload: any = {
        course_id: selectedCourse.course_id,
        title: subjectForm.title.trim(),
        description: subjectForm.description.trim() || subjectForm.title.trim(), 
        order_index: Number(subjectForm.order_index) || 1,
      };

      await createSubjectAction(payload);
      alert("Tạo môn học thành công!");
      
      setShowSubjectModal(false);
      setSubjectForm({ title: "", description: "", order_index: subjects.length + 1 });
      await handleSelectCourse(selectedCourse);
    } catch (error: any) {
      alert(`Lỗi khi tạo môn học: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 HÀM ĐÃ SỬA: Upload File thật trước khi tạo Đề cương
  const handleCreateSyllabus = async () => {
    if (!selectedSubject) return alert("Chưa chọn môn học!");
    if (!syllabusForm.description.trim()) return alert("Vui lòng nhập mô tả đề cương!");

    setIsLoading(true);
    try {
      let filePath: string | null = null;

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        
        // Gọi API upload file thực tế
        const uploadRes = await uploadFileAction(uploadData);
        filePath = uploadRes.file_path; 
      }

      const payload = {
        subject_id: String(selectedSubject.subject_id),
        description: syllabusForm.description,
        syllabus_file_path: filePath, 
      };

      await createSyllabusAction(payload);

      alert("Tạo đề cương thành công!");

      setShowSyllabusModal(false);
      setSyllabusForm({ description: "" });
      setSelectedFile(null);
      await handleSelectSubject(selectedSubject);
    } catch (error: any) {
      alert(`Lỗi khi tạo đề cương: ${error?.message || "Không xác định"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Navbar />

      <section className="bg-[#0066FF] text-white pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Link href="/training-management" className="hover:text-white flex items-center gap-1">
              <ArrowLeft size={14} /> Quản lý đào tạo
            </Link>
            <ChevronRight size={12} />
            <span className="text-white font-medium">Nội dung khóa học</span>
          </div>
          <h1 className="text-2xl font-black uppercase">QUẢN LÝ MÔN HỌC & ĐỀ CƯƠNG KHÓA HỌC</h1>
          <p className="text-xs text-blue-100">
            Chọn Khóa học → Tạo Môn học (Subject) → Thiết lập Đề cương (Syllabus)
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-8 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT 1: DANH SÁCH KHÓA HỌC */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-800">
              <Layers size={16} className="text-[#0066FF]" /> 1. Chọn Khóa Học
            </h3>
            <span className="text-xs bg-blue-50 text-[#0066FF] font-bold px-2 py-0.5 rounded-full">
              {filteredCourses.length} Khóa
            </span>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm khóa học..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredCourses.map((course) => {
              const isSelected = selectedCourse?.course_id === course.course_id;
              return (
                <div
                  key={course.course_id}
                  onClick={() => handleSelectCourse(course)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected 
                      ? "border-[#0066FF] bg-blue-50/50 font-bold shadow-2xs" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-slate-900 font-bold line-clamp-1">{course.title}</p>
                  {course.description && (
                    <p className="text-[11px] text-slate-500 font-normal mt-1 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5 font-normal">ID: {course.course_id}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT 2: DANH SÁCH MÔN HỌC */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-800">
              <BookOpen size={16} className="text-amber-500" /> 2. Môn Học (Subject)
            </h3>
            {selectedCourse && (
              <button
                onClick={() => {
                  setSubjectForm({ title: "", description: "", order_index: subjects.length + 1 });
                  setShowSubjectModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={14} /> Thêm Môn
              </button>
            )}
          </div>

          {selectedCourse ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[11px] text-slate-500">
                  Đang xem khóa: <strong className="text-slate-800 font-bold">{selectedCourse.title}</strong>
                </p>

                {selectedCourse.description && (
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed space-y-0.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Info size={12} className="text-blue-500" /> Mô tả khóa học:
                    </span>
                    <p className="text-slate-600 italic">{selectedCourse.description}</p>
                  </div>
                )}

                {curriculumFile ? (
                  <FileCard filePath={curriculumFile} label="File Khung Chương Trình (Curriculum)" />
                ) : (
                  <span className="text-[10px] text-slate-400 italic block pt-1">
                    (Khóa học chưa đính kèm file Khung Chương Trình)
                  </span>
                )}
              </div>

              {subjects.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic border border-dashed rounded-xl">
                  Khóa học này chưa có môn học nào. Bấm nút "+ Thêm Môn" để tạo.
                </div>
              ) : (
                subjects.map((sub: any) => {
                  const isSelected = selectedSubject?.subject_id === sub.subject_id;
                  const subjectFile = sub.file_url || sub.file_path || sub.syllabus_file;

                  return (
                    <div
                      key={sub.subject_id}
                      onClick={() => handleSelectSubject(sub)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? "border-amber-500 bg-amber-50/40 font-bold shadow-2xs" 
                          : "border-slate-100 hover:border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-slate-900 font-bold">STT {sub.order_index || 1}: {sub.title}</span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>

                      {sub.description && (
                        <p className="text-[11px] text-slate-500 font-normal mt-1.5 leading-relaxed bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-600 block text-[10px] uppercase text-amber-600 mb-0.5">Mô tả môn học:</span>
                          {sub.description}
                        </p>
                      )}

                      {subjectFile && (
                        <FileCard filePath={subjectFile} label={`Tài liệu môn: ${sub.title}`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-10 text-center">Vui lòng chọn một Khóa học ở Cột 1.</div>
          )}
        </div>

        {/* CỘT 3: ĐỀ CƯƠNG (SYLLABUS) CHI TIẾT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-800">
              <FileText size={16} className="text-emerald-600" /> 3. Đề Cương (Syllabus)
            </h3>
            {selectedSubject && (
              <button
                onClick={() => setShowSyllabusModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={14} /> Thêm Đề Cương
              </button>
            )}
          </div>

          {selectedSubject ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              <p className="text-[11px] text-slate-400 italic">
                Đề cương môn: <strong className="text-slate-700">{selectedSubject.title}</strong>
              </p>

              {syllabuses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic border border-dashed rounded-xl">
                  Môn học này chưa có đề cương. Hãy bấm "+ Thêm Đề Cương".
                </div>
              ) : (
                syllabuses.map((syl: any) => {
                  const syllabusFile = syl.syllabus_file_path || syl.file_path;

                  return (
                    <div key={syl.syllabus_id || syl.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <FileText size={12} /> Nội dung / Mô tả đề cương:
                        </span>
                        <p className="font-medium text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60 whitespace-pre-line">
                          {syl.description}
                        </p>
                      </div>
                      
                      {syllabusFile && (
                        <FileCard filePath={syllabusFile} label="File Đề Cương Chi Tiết" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-10 text-center">Vui lòng chọn một Môn học ở Cột 2.</div>
          )}
        </div>
      </main>

      {/* MODAL TẠO SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-base text-slate-900">Tạo Môn Học Mới (Subject)</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500">Khóa học: <strong className="text-slate-800">{selectedCourse?.title}</strong></p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tên Môn Học *</label>
                <input
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  placeholder="Ví dụ: Lập trình TypeScript Căn Bản"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mô Tả Môn Học</label>
                <textarea
                  rows={3}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Nhập giới thiệu/mô tả tóm tắt môn học..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Thứ Tự Môn (Order Index)</label>
                <input
                  type="number"
                  value={subjectForm.order_index}
                  onChange={(e) => setSubjectForm({ ...subjectForm, order_index: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowSubjectModal(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">Hủy</button>
              <button onClick={handleCreateSubject} disabled={isLoading} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold">
                {isLoading ? "Đang lưu..." : "Lưu Môn Học"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO SYLLABUS */}
      {showSyllabusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-base text-slate-900">Tạo Đề Cương (Syllabus)</h3>
              <button onClick={() => setShowSyllabusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500">Môn học: <strong className="text-slate-800">{selectedSubject?.title}</strong></p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mô Tả / Nội Dung Đề Cương *</label>
                <textarea
                  rows={4}
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                  placeholder="Mục tiêu môn học, chuẩn đầu ra, cấu trúc bài học..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tải File Đề Cương từ Máy Tính</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowSyllabusModal(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">Hủy</button>
              <button onClick={handleCreateSyllabus} disabled={isLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
                {isLoading ? "Đang lưu..." : "Lưu Đề Cương"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}