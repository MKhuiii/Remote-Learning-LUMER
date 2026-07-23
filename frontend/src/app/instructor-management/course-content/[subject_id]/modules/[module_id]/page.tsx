"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/editors/RichTextEditor"; // Component RichTextEditor đã có
import {
  ArrowLeft,
  Plus,
  Video,
  FileText,
  FileCode,
  Trash2,
  Edit3,
  Layers,
  Clock,
  X,
  FileUp,
} from "lucide-react";

interface Lesson {
  lesson_id: string;
  title: string;
  type: string;
  duration: string;
  content: string; // Nội dung HTML từ RichTextEditor
  video_url?: string;
}

const MOCK_LESSONS: Lesson[] = [
  {
    lesson_id: "les-1",
    title: "Bài 1.1: Giới thiệu kiến trúc Microservices",
    type: "video",
    duration: "15 phút",
    content:
      "<p>Trong bài học này, chúng ta sẽ tìm hiểu khái niệm <strong>Microservices</strong> và cách phân chia các service độc lập.</p>",
    video_url: "https://www.youtube.com/watch?v=sample",
  },
  {
    lesson_id: "les-2",
    title: "Bài 1.2: Tài liệu hướng dẫn cài đặt môi trường",
    type: "document",
    duration: "10 phút",
    content:
      "<p>Hãy làm theo các bước dưới đây để thiết lập môi trường <code>FastAPI</code> và <code>Next.js</code>.</p>",
  },
];

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = (params.subject_id as string) || "";
  const moduleId = (params.module_id as string) || "";

  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [showModal, setShowModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState(""); // Lưu content HTML từ RichTextEditor

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingLessonId(null);
    setTitle("");
    setType("video");
    setDuration("15 phút");
    setVideoUrl("");
    setContent("<p>Nhập nội dung bài học tại đây...</p>");
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.lesson_id);
    setTitle(lesson.title);
    setType(lesson.type);
    setDuration(lesson.duration);
    setVideoUrl(lesson.video_url || "");
    setContent(lesson.content || "");
    setShowModal(true);
  };

  // Xử lý Submit Form (Tạo / Sửa)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingLessonId) {
      // Cập nhật Lesson
      setLessons((prev) =>
        prev.map((item) =>
          item.lesson_id === editingLessonId
            ? { ...item, title, type, duration, video_url: videoUrl, content }
            : item,
        ),
      );
    } else {
      // Tạo Lesson mới
      const newLesson: Lesson = {
        lesson_id: `les-${Date.now()}`,
        title,
        type,
        duration: duration || "10 phút",
        video_url: videoUrl,
        content,
      };
      setLessons((prev) => [...prev, newLesson]);
    }

    setShowModal(false);
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      setLessons((prev) => prev.filter((item) => item.lesson_id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation Header */}
        <div className="space-y-4">
          <button
            onClick={() =>
              router.push(`/instructor-management/course-content/${subjectId}`)
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách Module
          </button>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Subject: {subjectId}</span>
                <span>•</span>
                <span className="text-blue-600">Module ID: {moduleId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Chi Tiết Module & Nội Dung Bài Học
              </h1>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <Plus size={18} />
              Tạo Lesson Mới
            </button>
          </div>
        </div>

        {/* Danh sách Lesson */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers size={20} className="text-indigo-600" />
              Danh Sách Bài Học ({lessons.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {lessons.map((lesson) => (
              <div key={lesson.lesson_id} className="py-4 space-y-3">
                <div className="flex items-center justify-between gap-4 hover:bg-slate-50/80 p-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                      {lesson.type === "video" && (
                        <Video size={18} className="text-blue-600" />
                      )}
                      {lesson.type === "document" && (
                        <FileText size={18} className="text-emerald-600" />
                      )}
                      {lesson.type === "code" && (
                        <FileCode size={18} className="text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="capitalize font-semibold text-slate-600">
                          Loại: {lesson.type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(lesson)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.lesson_id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Preview nội dung RichText đã soạn thảo */}
                {lesson.content && (
                  <div className="ml-12 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Nội dung bài học:
                    </span>
                    <div
                      className="prose prose-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                  </div>
                )}
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                Module này chưa có bài học nào. Hãy nhấn "Tạo Lesson Mới".
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Tạo/Chỉnh sửa Lesson có RichTextEditor */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingLessonId ? "Chỉnh Sửa Lesson" : "Tạo Lesson Mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên bài học *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bài 1.1: Giới thiệu..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời lượng dự kiến
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 15 phút"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại bài học
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="video">Video Bài giảng</option>
                    <option value="document">Tài liệu Bài đọc</option>
                    <option value="code">Bài tập Thực hành Code</option>
                  </select>
                </div>

                {type === "video" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link Video (YouTube/Vimeo)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Tích hợp RichTextEditor vào đây */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nội dung chi tiết bài học
                </label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={content}
                    onChange={(val: string) => setContent(val)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition shadow-sm"
                >
                  {editingLessonId ? "Lưu thay đổi" : "Tạo Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
