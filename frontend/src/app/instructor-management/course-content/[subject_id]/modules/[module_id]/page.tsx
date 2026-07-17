"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";

import ModuleHeader from "@/components/ModuleHeader";
import ModuleInformation from "@/components/ModuleInformation";
import ModuleStatistics from "@/components/ModuleStatistics";

// Phần 2 sẽ tạo
import LessonTimeline from "@/components/LessonTimeline";
import ModuleQuizList from "@/components/ModuleQuizList";
import ModuleTabs from "@/components/ModuleTab";

export default function ModulePage() {
  const params = useParams();

  const subjectId = params.subject_id as string;
  const moduleId = params.module_id as string;

  const [tab, setTab] = useState<"lesson" | "quiz">("lesson");

  // Mock Data
  const subject = {
    title: "Python Programming",
  };

  const moduleData = {
    title: "Introduction",
    description:
      "Introduce learners to the Python programming language and prepare the development environment.",
    status: "Published",
  };

  const lessons = [
    {
      lesson_id: "1",
      title: "Introduction",
      duration_minutes: 10,
      order_index: 1,
      is_optional: false,
      video_url: "",
    },
    {
      lesson_id: "2",
      title: "Installing Python",
      duration_minutes: 20,
      order_index: 2,
      is_optional: false,
      video_url: "",
    },
  ];

  const quizzes = [
    {
      quiz_id: "1",
      title: "Module Quiz",
      description: "",
      duration_minutes: 15,
      passing_score: 70,
      max_attempts: 3,
      is_active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <ModuleHeader
        subjectTitle={subject.title}
        moduleTitle={moduleData.title}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <ModuleStatistics
          lessonCount={lessons.length}
          quizCount={quizzes.length}
        />

        <ModuleInformation
          moduleTitle={moduleData.title}
          subjectTitle={subject.title}
          description={moduleData.description}
          status={moduleData.status}
        />

        <ModuleTabs activeTab={tab} setActiveTab={setTab} />

        {tab === "lesson" ? (
          <LessonTimeline
            lessons={lessons}
            subjectId={subjectId}
            moduleId={moduleId}
          />
        ) : (
          <ModuleQuizList quizzes={quizzes} />
        )}
      </main>
    </div>
  );
}
