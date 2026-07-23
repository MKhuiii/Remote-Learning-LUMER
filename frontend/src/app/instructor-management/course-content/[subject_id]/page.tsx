"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Plus,
  CheckCircle,
  Download,
  Upload,
  Trash2,
  Edit3,
  ArrowRight,
  HelpCircle,
  FileQuestion,
} from "lucide-react";

const MOCK_MODULES = [
  {
    module_id: "mod-101",
    title: "Chương 1: Tổng quan về FastAPI & Microservices",
    description: "Cơ bản về RESTful API, Routing, Dependency Injection.",
    total_lessons: 5,
    order: 1,
  },
  {
    module_id: "mod-102",
    title: "Chương 2: Xác thực JWT & Phân quyền RBAC",
    description: "Xây dựng Middleware xác thực Token và phân quyền Giảng viên.",
    total_lessons: 4,
    order: 2,
  },
];

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = (params.subject_id as string) || "";

  const [modules, setModules] = useState(MOCK_MODULES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMod = {
      module_id: `mod-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      total_lessons: 0,
      order: modules.length + 1,
    };

    setModules([...modules, newMod]);
    setNewTitle("");
    setNewDesc("");
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation & Banner */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/instructor-management/course-content")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách môn học
          </button>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  Mã môn: {subjectId}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                  Đang hoạt động
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Quản Lý Nội Dung Môn Học
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  router.push(
                    `/instructor-management/course-content/${subjectId}/quizzes`,
                  )
                }
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                <HelpCircle size={18} className="text-blue-600" />
                Quản lý Quiz
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                <Plus size={18} />
                Tạo Module Mới
              </button>
            </div>
          </div>
        </div>

        {/* Khối Đề Cương Môn Học */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                Đề Cương Chi Tiết (Syllabus)
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={14} /> Đã phê duyệt
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-blue-600">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  De_cuong_mon_hoc_{subjectId}.pdf
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cập nhật lần cuối: 2026-03-20
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition">
                <Download size={15} />
                Tải về
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition">
                <Upload size={15} />
                Cập nhật File
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách Modules */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-indigo-600" size={22} />
              Danh Sách Module ({modules.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.module_id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1 max-w-3xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Module #{mod.order}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {mod.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {mod.description || "Chưa có mô tả cho module này."}
                  </p>
                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <FileQuestion size={15} className="text-indigo-500" />
                      {mod.total_lessons} Bài học
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition">
                    <Edit3 size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition">
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/instructor-management/course-content/${subjectId}/modules/${mod.module_id}`,
                      )
                    }
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Vào Module & Tạo Lesson
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Tạo Module Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tạo Module Mới</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Module
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chương 1: Giới thiệu..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  placeholder="Nội dung chính của module..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                >
                  Tạo Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
