import ModuleManager from "@/components/ModuleManager";
import QuizManager from "@/components/QuizManager";

export default function SubjectManager() {
  const subjectId = "S001"; // giả lập

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Subject {subjectId}</h1>
      <ModuleManager subjectId={subjectId} />
      <QuizManager subjectId={subjectId} />
    </div>
  );
}
