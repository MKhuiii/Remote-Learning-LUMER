"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { InstructorStatistics, Subject } from "@/types/statistic";
import { fetchInstructorStatistics } from "@/actions/getStatistic";
import {
  Search,
  BookOpen,
  FolderKanban,
  FileQuestion,
  ArrowRight,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";

const MOCK_DATA = {
  subjects: [
    {
      subject_id: "33333333-3333-3333-3333-333333333333",
      title: "Môn học Cấu trúc dữ liệu và Giải thuật với Python",
      description: "Học cấu trúc dữ liệu cơ bản đến nâng cao: Mảng, Danh sách liên kết, Cây, Đồ thị và các thuật toán tối ưu.",
      moduleCount: 8,
      quizCount: 2,
      status: "SUBJECT_ACTIVE",
    },
    {
      subject_id: "44444444-4444-4444-4444-444444444444",
      title: "Môn học Xây dựng RESTful API với FastAPI",
      description: "Thiết kế hệ thống API hiệu năng cao, kết nối SQLModel, Pydantic, bảo mật OAuth2 và triển khai API Gateway.",
      moduleCount: 6,
      quizCount: 1,
      status: "SUBJECT_ACTIVE",
    },
    {
      subject_id: "55555555-5555-5555-5555-555555555555",
      title: "Môn học Truy vấn dữ liệu nâng cao với PostgreSQL",
      description: "Tối ưu hóa câu lệnh SQL, Indexing, Partitioning và quản trị cơ sở dữ liệu quy mô lớn.",
      moduleCount: 10,
      quizCount: 3,
      status: "SUBJECT_SUSPENDED",
    },
    {
      subject_id: "902fa727-bad0-41ec-a625-5063d5f47fdf",
      title: "Môn học thử nghiệm (Test Subject)",
      description: "Đề cương chi tiết môn học test để kiểm tra tính năng tạo bài học (Lesson).",
      moduleCount: 2,
      quizCount: 0,
      status: "SUBJECT_DEVELOPING",
    },
  ] as Subject[],
};

const getStatusBadge = (status: Subject["status"]) => {
  switch (status) {
    case "SUBJECT_ACTIVE":
      return {
        text: "Sẵn sàng giảng dạy",
        className: "bg-green-100 text-green-700 border border-green-200",
      };
    case "SUBJECT_DEVELOPING":
      return {
        text: "Đang xây dựng",
        className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      };
    case "SUBJECT_SUSPENDED":
      return {
        text: "Tạm dừng",
        className: "bg-red-100 text-red-700 border border-red-200",
      };
    default:
      return {
        text: "Không rõ",
        className: "bg-slate-100 text-slate-700",
      };
  }
};

export default function CourseContentPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // States quản lý dữ liệu API
  const [stats, setStats] = useState<InstructorStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Gọi Server Action tự động dựa trên Token trong Cookie
  useEffect(() => {
    fetchInstructorStatistics()
      .then((data) => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Lỗi đồng bộ dữ liệu thống kê:", err.message);
        setLoadingStats(false);
      });
  }, []); // Gọi 1 lần duy nhất khi component mount

  const filteredSubjects = useMemo(() => {
    return MOCK_DATA.subjects.filter((subject) =>
      subject.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-bold">Course Content</h1>
          <p className="mt-3 text-blue-100 text-lg max-w-3xl">
            Quản lý toàn bộ nội dung các môn học được phân công giảng dạy. Chọn
            một môn học để quản lý cấu trúc các Module, Lesson và Đề cương chi tiết.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Khối Thống kê động lấy từ Token của Giảng viên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-2xl shadow p-6">
            <BookOpen className="text-[#0066FF] mb-3" size={34} />
            <p className="text-slate-500">Môn Được Phân Công</p>
            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {loadingStats ? "..." : stats?.total_subjects ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FolderKanban className="text-[#0066FF] mb-3" size={34} />
            <p className="text-slate-500">Tổng Số Module</p>
            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {loadingStats ? "..." : stats?.total_modules ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <CheckCircle className="text-green-500 mb-3" size={34} />
            <p className="text-slate-500">Môn Đang Hoạt Động</p>
            <h2 className="text-3xl font-bold text-green-500 mt-2">
              {loadingStats ? "..." : stats?.total_active_subject ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FileText className="text-yellow-500 mb-3" size={34} />
            <p className="text-slate-500">Môn Đang Phát Triển</p>
            <h2 className="text-3xl font-bold text-yellow-500 mt-2">
              {loadingStats ? "..." : stats?.total_developing_subject ?? 0}
            </h2>
          </div>

        </div>

        {/* Khung Tìm kiếm */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh tên môn học cần quản lý..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-white border border-slate-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#66CCFF]"
          />
        </div>

        {/* Danh sách các Môn học */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => {
            const statusConfig = getStatusBadge(subject.status);

            return (
              <div
                key={subject.subject_id}
                onClick={() => router.push(`/instructor-management/course-content/${subject.subject_id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition cursor-pointer p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-xl font-bold text-slate-800 hover:text-[#0066FF] transition line-clamp-2">
                      {subject.title}
                    </h2>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusConfig.className}`}>
                      {statusConfig.text}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3">
                    {subject.description}
                  </p>
                </div>

                <div>
                  <div className="flex gap-6 mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <FolderKanban size={18} className="text-[#0066FF]" />
                      <span className="text-slate-600 text-sm">
                        {subject.moduleCount} Modules
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileQuestion size={18} className="text-[#0066FF]" />
                      <span className="text-slate-600 text-sm">
                        {subject.quizCount} Quiz
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#0066FF]">
                      Quản lý môn học
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trạng thái danh sách rỗng */}
        {filteredSubjects.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <AlertCircle size={40} className="text-slate-300" />
            <span>Không tìm thấy môn học nào khớp với từ khóa tìm kiếm.</span>
          </div>
        )}
      </section>
    </div>
  );
}