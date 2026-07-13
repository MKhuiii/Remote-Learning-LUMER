"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Search,
  BookOpen,
  FolderKanban,
  FileQuestion,
  ArrowRight,
} from "lucide-react";

interface Subject {
  subject_id: string;
  title: string;
  description: string;
  moduleCount: number;
  quizCount: number;
  status: "Published" | "Draft";
}

export default function CourseContentPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  // Demo Data
  const subjects: Subject[] = [
    {
      subject_id: "sub001",
      title: "Python Programming",
      description:
        "Learn Python from basic to advanced with practical exercises.",
      moduleCount: 8,
      quizCount: 2,
      status: "Published",
    },
    {
      subject_id: "sub002",
      title: "FastAPI Development",
      description: "Build RESTful APIs using FastAPI and PostgreSQL.",
      moduleCount: 6,
      quizCount: 1,
      status: "Draft",
    },
    {
      subject_id: "sub003",
      title: "Next.js Framework",
      description: "Modern full-stack web development using Next.js.",
      moduleCount: 10,
      quizCount: 3,
      status: "Published",
    },
  ];

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const totalModules = subjects.reduce(
    (sum, item) => sum + item.moduleCount,
    0,
  );

  const totalQuiz = subjects.reduce((sum, item) => sum + item.quizCount, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-bold">Course Content</h1>

          <p className="mt-3 text-blue-100 text-lg max-w-3xl">
            Quản lý toàn bộ nội dung các môn học được phân công giảng dạy. Chọn
            một môn học để quản lý Module, Lesson và Quiz.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-6">
            <BookOpen className="text-[#0066FF] mb-3" size={34} />

            <p className="text-slate-500">Assigned Subjects</p>

            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {subjects.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FolderKanban className="text-[#0066FF] mb-3" size={34} />

            <p className="text-slate-500">Total Modules</p>

            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {totalModules}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FileQuestion className="text-[#0066FF] mb-3" size={34} />

            <p className="text-slate-500">Total Subject Quiz</p>

            <h2 className="text-3xl font-bold text-[#0066FF] mt-2">
              {totalQuiz}
            </h2>
          </div>
        </div>

        {/* Search */}

        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-white border border-slate-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#66CCFF]"
          />
        </div>

        {/* Subject List */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.subject_id}
              onClick={() =>
                router.push(
                  `/instructor-management/course-content/${subject.subject_id}`,
                )
              }
              className="bg-white rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition cursor-pointer p-7"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#0066FF]">
                    {subject.title}
                  </h2>

                  <p className="text-slate-500 mt-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    subject.status === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {subject.status}
                </span>
              </div>

              <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <FolderKanban size={20} className="text-[#0066FF]" />

                  <span className="text-slate-600">
                    {subject.moduleCount} Modules
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FileQuestion size={20} className="text-[#0066FF]" />

                  <span className="text-slate-600">
                    {subject.quizCount} Quiz
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <span className="flex items-center gap-2 font-semibold text-[#0066FF]">
                  Quản lý môn học
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-slate-500">
            Không tìm thấy môn học phù hợp.
          </div>
        )}
      </section>
    </div>
  );
}
