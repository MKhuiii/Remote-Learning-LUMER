import QuizManager from "@/components/QuizManager";
import LessonManager from "@/components/LessonManager";

export default function ModulePage() {
  const moduleId = "M001"; // giả lập
  const subjectId = "S001";

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý Module {moduleId}</h1>
      <LessonManager subjectId={subjectId} moduleId={moduleId} />
      <QuizManager subjectId={subjectId} moduleId={moduleId} />
    </div>
  );
}
