"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { InstructorStatistics } from "@/types/statistic";
import { GeneralInfoInstructorSubject } from "@/types/subject";
import { fetchInstructorStatistics } from "@/actions/getStatistic";
import { getInstructorGeneralInfoAction } from "@/actions/getSubject";
import {
  Search,
  BookOpen,
  FolderKanban,
  FileQuestion,
  ArrowRight,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  X,
  HelpCircle,
} from "lucide-react";

const getStatusBadge = (statusId: string) => {
  switch (statusId) {
    case "SUBJECT_ACTIVE":
      return {
        text: "Sẵn sàng giảng dạy",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    case "SUBJECT_DEVELOPING":
      return {
        text: "Đang xây dựng",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    case "SUBJECT_SUSPENDED":
      return {
        text: "Tạm dừng",
        className: "bg-red-100 text-red-700 border border-red-200",
      };
    default:
      return {
        text: "Khác",
        className: "bg-slate-100 text-slate-700 border border-slate-200",
      };
  }
};

export default function CourseContentPage() {
  const router = useRouter();

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // States Thống kê
  const [stats, setStats] = useState<InstructorStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // States Danh sách môn học
  const [subjects, setSubjects] = useState<GeneralInfoInstructorSubject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [errorSubjects, setErrorSubjects] = useState<string | null>(null);

  // 1. Fetch Thống kê tổng quan
  useEffect(() => {
    setLoadingStats(true);
    fetchInstructorStatistics()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) =>
        console.error("Lỗi đồng bộ thống kê:", err?.message || err),
      )
      .finally(() => setLoadingStats(false));
  }, []);

  // 2. Fetch Tìm kiếm Môn học được phân công (Debounce 400ms)
  useEffect(() => {
    setLoadingSubjects(true);
    setErrorSubjects(null);

    const timer = setTimeout(() => {
      getInstructorGeneralInfoAction(searchTerm)
        .then((data) => setSubjects(data || []))
        .catch((err) => {
          console.error("Lỗi tải môn học:", err?.message || err);
          setErrorSubjects(err?.message || "Không thể tải danh sách môn học.");
        })
        .finally(() => setLoadingSubjects(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-bold">Môn Học Giảng Dạy</h1>
          <p className="mt-3 text-blue-100 text-lg max-w-3xl">
            Danh sách các môn học bạn được phân công. Bạn có thể xem cấu trúc
            Module/Lesson hoặc truy cập trực tiếp Ngân hàng câu hỏi của từng
            môn.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Khối Thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <BookOpen className="text-[#0066FF] mb-3" size={34} />
            <p className="text-slate-500 text-sm">Môn Được Phân Công</p>
            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {loadingStats ? "..." : (stats?.total_subjects ?? 0)}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <FolderKanban className="text-[#0066FF] mb-3" size={34} />
            <p className="text-slate-500 text-sm">Tổng Số Module</p>
            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {loadingStats ? "..." : (stats?.total_modules ?? 0)}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <CheckCircle className="text-emerald-500 mb-3" size={34} />
            <p className="text-slate-500 text-sm">Môn Đang Hoạt Động</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              {loadingStats ? "..." : (stats?.total_active_subject ?? 0)}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <FileText className="text-amber-500 mb-3" size={34} />
            <p className="text-slate-500 text-sm">Môn Đang Phát Triển</p>
            <h2 className="text-3xl font-bold text-amber-600 mt-2">
              {loadingStats ? "..." : (stats?.total_developing_subject ?? 0)}
            </h2>
          </div>
        </div>

        {/* Ô Tìm kiếm Realtime */}
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh tên hoặc mô tả môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-white border border-slate-200 py-3.5 pl-12 pr-10 outline-none focus:ring-2 focus:ring-[#66CCFF] text-slate-800 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Trạng thái Đang Fetch API */}
        {loadingSubjects && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 size={36} className="animate-spin text-[#0066FF]" />
            <p>Đang tải danh sách môn học...</p>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {!loadingSubjects && errorSubjects && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 mb-8 flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            <span>{errorSubjects}</span>
          </div>
        )}

        {/* Danh sách Môn học Fetch từ Backend */}
        {!loadingSubjects && !errorSubjects && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjects.map((subject) => {
              const statusConfig = getStatusBadge(subject.status_id);

              return (
                <div
                  key={subject.subject_id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h2
                        onClick={() =>
                          router.push(
                            `/instructor-management/course-content/${subject.subject_id}`,
                          )
                        }
                        className="text-xl font-bold text-slate-800 hover:text-[#0066FF] transition cursor-pointer line-clamp-2"
                      >
                        {subject.title}
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusConfig.className}`}
                      >
                        {statusConfig.text}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3">
                      {subject.description ||
                        "Chưa có mô tả chi tiết cho môn học này."}
                    </p>
                  </div>

                  <div>
                    {/* Thống kê Module & Lesson */}
                    <div className="flex gap-6 mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <FolderKanban size={18} className="text-[#0066FF]" />
                        <span className="text-slate-600 text-sm font-medium">
                          {subject.total_modules || 0} Modules
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileQuestion size={18} className="text-[#0066FF]" />
                        <span className="text-slate-600 text-sm font-medium">
                          {subject.total_lessons || 0} Lessons
                        </span>
                      </div>
                    </div>

                    {/* Các Nút Thao Tác Chuyển Hướng */}
                    <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-100">
                      {/* Nút vào Ngân hàng câu hỏi */}
                      <button
                        onClick={() =>
                          router.push(
                            `/instructor-management/questions-bank/${subject.subject_id}`,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-xs font-semibold transition"
                      >
                        <HelpCircle size={15} />
                        Ngân hàng câu hỏi
                      </button>

                      {/* Nút Quản lý chi tiết môn học */}
                      <button
                        onClick={() =>
                          router.push(
                            `/instructor-management/course-content/${subject.subject_id}`,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#0066FF] hover:bg-blue-100 text-xs font-bold transition"
                      >
                        Nội dung & Đề cương
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trạng thái Không tìm thấy dữ liệu */}
        {!loadingSubjects && !errorSubjects && subjects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <AlertCircle size={40} className="text-slate-300" />
            <span>
              {searchTerm
                ? `Không tìm thấy môn học nào phù hợp với từ khóa "${searchTerm}".`
                : "Bạn chưa được phân công môn học nào."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
