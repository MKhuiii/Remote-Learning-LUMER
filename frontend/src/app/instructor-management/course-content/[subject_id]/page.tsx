"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  BookOpen,
  FolderKanban,
  FileQuestion,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";

const subject = {
  id: "sub001",
  title: "Python Programming",
  description: "Learn Python from basic to advanced through hands-on projects.",
  course: "Python Fullstack Developer",
  status: "Published",
};

const modules = [
  {
    id: "m1",
    title: "Introduction",
    lessons: 3,
    quizzes: 1,
  },
  {
    id: "m2",
    title: "Variables",
    lessons: 4,
    quizzes: 1,
  },
  {
    id: "m3",
    title: "Functions",
    lessons: 5,
    quizzes: 0,
  },
];

const subjectQuiz = [
  {
    id: "q1",
    title: "Final Exam",
    questions: 30,
    duration: 60,
  },
  {
    id: "q2",
    title: "Midterm Test",
    questions: 20,
    duration: 30,
  },
];

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();

  const subjectId = params.subject_id as string;

  const [tab, setTab] = useState<"module" | "quiz">("module");

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Header */}

      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-100 hover:text-white"
          >
            <ArrowLeft size={18} />
            Course Content
          </button>

          <h1 className="text-4xl font-bold mt-5">{subject.title}</h1>

          <p className="text-blue-100 mt-3 text-lg">
            Thuộc khóa học: {subject.course}
          </p>

          <p className="text-blue-100 mt-2">
            Quản lý Module, Lesson và Quiz của môn học này.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <FolderKanban className="text-[#0066FF]" size={34} />

            <p className="mt-3 text-slate-500">Modules</p>

            <h2 className="text-3xl font-bold text-[#0066FF]">
              {modules.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <BookOpen className="text-[#0066FF]" size={34} />

            <p className="mt-3 text-slate-500">Lessons</p>

            <h2 className="text-3xl font-bold text-[#0066FF]">
              {modules.reduce((s, m) => s + m.lessons, 0)}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FileQuestion className="text-[#0066FF]" size={34} />

            <p className="mt-3 text-slate-500">Subject Quiz</p>

            <h2 className="text-3xl font-bold text-[#0066FF]">
              {subjectQuiz.length}
            </h2>
          </div>
        </div>

        {/* Subject Information */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-[#0066FF] mb-5">
            Subject Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-500">Subject</p>
              <h3 className="font-semibold">{subject.title}</h3>
            </div>

            <div>
              <p className="text-slate-500">Course</p>
              <h3 className="font-semibold">{subject.course}</h3>
            </div>

            <div>
              <p className="text-slate-500">Status</p>
              <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm">
                {subject.status}
              </span>
            </div>

            <div className="md:col-span-2">
              <p className="text-slate-500">Description</p>
              <p>{subject.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab("module")}
            className={`px-6 py-3 rounded-xl font-semibold ${
              tab === "module" ? "bg-[#0066FF] text-white" : "bg-white"
            }`}
          >
            Modules
          </button>

          <button
            onClick={() => setTab("quiz")}
            className={`px-6 py-3 rounded-xl font-semibold ${
              tab === "quiz" ? "bg-[#0066FF] text-white" : "bg-white"
            }`}
          >
            Subject Quiz
          </button>
        </div>

        {/* Module */}

        {tab === "module" && (
          <>
            <div className="flex justify-end mb-6">
              <button className="bg-[#0066FF] text-white rounded-xl px-5 py-3 flex items-center gap-2">
                <Plus size={18} />
                New Module
              </button>
            </div>

            <div className="space-y-5">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="text-sm text-[#0066FF] font-semibold">
                        Module {(index + 1).toString().padStart(2, "0")}
                      </span>

                      <h2 className="text-2xl font-bold mt-2">
                        {module.title}
                      </h2>
                    </div>

                    <div className="flex gap-3">
                      <button>
                        <Pencil className="text-blue-600" />
                      </button>

                      <button>
                        <Trash2 className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-8 mt-6 text-slate-600">
                    <span>{module.lessons} Lessons</span>

                    <span>{module.quizzes} Quiz</span>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() =>
                        router.push(
                          `/instructor-management/course-content/${subjectId}/modules/${module.id}`,
                        )
                      }
                      className="flex items-center gap-2 text-[#0066FF] font-semibold hover:text-blue-700 transition"
                    >
                      Open Module
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Subject Quiz */}

        {tab === "quiz" && (
          <>
            <div className="flex justify-end mb-6">
              <button className="bg-[#0066FF] text-white rounded-xl px-5 py-3 flex items-center gap-2">
                <Plus size={18} />
                New Quiz
              </button>
            </div>

            <div className="space-y-5">
              {subjectQuiz.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-2xl shadow p-6">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{quiz.title}</h2>

                      <p className="text-slate-500 mt-2">
                        {quiz.questions} Questions • {quiz.duration} Minutes
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button>
                        <Pencil className="text-blue-600" />
                      </button>

                      <button>
                        <Trash2 className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
