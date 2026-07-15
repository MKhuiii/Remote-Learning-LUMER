"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Subject {
  id: string;
  code: string;
  title: string;
  description: string;
  image: string;
  totalQuestions: number;
  totalModules: number;
}

export default function QuestionBankPage() {
  const router = useRouter();

  const subjects: Subject[] = [
    {
      id: "sub001",
      code: "CNTT301",
      title: "Python Programming",
      description: "Learn Python from basic to advanced.",
      image: "https://picsum.photos/400/200?1",
      totalQuestions: 124,
      totalModules: 8,
    },
    {
      id: "sub002",
      code: "CNTT302",
      title: "ReactJS & Next.js",
      description: "Modern Frontend Development.",
      image: "https://picsum.photos/400/200?2",
      totalQuestions: 96,
      totalModules: 10,
    },
    {
      id: "sub003",
      code: "CNTT401",
      title: "Java Spring Boot",
      description: "Enterprise Backend Development.",
      image: "https://picsum.photos/400/200?3",
      totalQuestions: 158,
      totalModules: 12,
    },
    {
      id: "sub004",
      code: "CNTT210",
      title: "Database Systems",
      description: "SQL & Database Design.",
      image: "https://picsum.photos/400/200?4",
      totalQuestions: 84,
      totalModules: 7,
    },
  ];

  const totalSubjects = subjects.length;
  const totalQuestions = subjects.reduce(
    (sum, item) => sum + item.totalQuestions,
    0,
  );

  const totalModules = subjects.reduce(
    (sum, item) => sum + item.totalModules,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <button
            onClick={() => router.push("/instructor-management")}
            className="mb-6 flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm transition"
          >
            ← Quay lại Quản lý Giảng viên
          </button>

          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Question Bank
          </span>

          <h1 className="text-4xl font-extrabold mt-3">Ngân hàng câu hỏi</h1>

          <p className="text-blue-100 mt-2 text-sm">
            Chọn môn học để quản lý ngân hàng câu hỏi.
          </p>
        </div>
      </section>

      {/* Statistic */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-md border p-6 text-center">
            <div className="text-3xl font-extrabold text-[#0066FF]">
              {totalSubjects}
            </div>

            <div className="text-xs mt-2 text-slate-500">Subject phụ trách</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border p-6 text-center">
            <div className="text-3xl font-extrabold text-blue-500">
              {totalQuestions}
            </div>

            <div className="text-xs mt-2 text-slate-500">Tổng câu hỏi</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border p-6 text-center">
            <div className="text-3xl font-extrabold text-emerald-500">
              {totalModules}
            </div>

            <div className="text-xs mt-2 text-slate-500">Tổng Module</div>
          </div>
        </div>
      </section>

      {/* Subject */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Danh sách Subject
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Chỉ hiển thị các môn học bạn đang đảm nhận.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
            >
              <img src={subject.image} className="h-44 w-full object-cover" />

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-[#0066FF] uppercase">
                      {subject.code}
                    </p>

                    <h3 className="text-xl font-bold mt-1 text-slate-900">
                      {subject.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                  {subject.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-[#0066FF]">
                      {subject.totalQuestions}
                    </div>

                    <div className="text-xs text-slate-500">Câu hỏi</div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xl font-bold text-emerald-500">
                      {subject.totalModules}
                    </div>

                    <div className="text-xs text-slate-500">Module</div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/instructor-management/questions-bank/${subject.id}`,
                    )
                  }
                  className="w-full mt-6 bg-[#0066FF] hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
                >
                  Quản lý câu hỏi →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
