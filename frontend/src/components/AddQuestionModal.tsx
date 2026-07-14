"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import BasicInformation from "./form/BasicInformation";
import TopicInput from "./form/TopicInput";
import MultipleChoiceEditor from "./editors/MultipleChoiceEditor";
import EssayEditor from "./editors/EssayEditor";

import { CauHoi, DapAnTracNghiem } from "@/types/questions-bank";

interface Props {
  open: boolean;

  onClose: () => void;

  onSave: (question: CauHoi) => void;

  modules: string[];

  editQuestion?: CauHoi;
}

export default function AddQuestionModal({
  open,
  onClose,
  onSave,
  modules,
  editQuestion,
}: Props) {
  const [question, setQuestion] = useState("");

  const [module, setModule] = useState(modules[0] || "Module 1");

  const [type, setType] = useState<"Trắc nghiệm" | "Tự luận">("Trắc nghiệm");

  const [difficulty, setDifficulty] = useState<"Dễ" | "Trung bình" | "Khó">(
    "Dễ",
  );

  const [topics, setTopics] = useState<string[]>([]);

  const [topicInput, setTopicInput] = useState("");

  const [answers, setAnswers] = useState<DapAnTracNghiem[]>([
    {
      id: "A",
      noiDung: "",
    },
    {
      id: "B",
      noiDung: "",
    },
  ]);

  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [guideline, setGuideline] = useState("");

  const resetForm = () => {
    setQuestion("");

    setModule(modules[0] || "Module 1");

    setType("Trắc nghiệm");

    setDifficulty("Dễ");

    setTopics([]);

    setTopicInput("");

    setAnswers([
      {
        id: "A",
        noiDung: "",
      },
      {
        id: "B",
        noiDung: "",
      },
    ]);

    setCorrectAnswer("A");

    setGuideline("");
  };

  useEffect(() => {
    if (!open) return;

    if (!editQuestion) {
      resetForm();

      return;
    }

    setQuestion(editQuestion.noiDung);

    setModule(editQuestion.module);

    setType(editQuestion.loaiCauHoi);

    setDifficulty(editQuestion.mucDo);

    setTopics(editQuestion.chuDe);

    setGuideline(editQuestion.huongDanTuLuan || "");

    setAnswers(
      editQuestion.cacDapAn || [
        {
          id: "A",
          noiDung: "",
        },
        {
          id: "B",
          noiDung: "",
        },
      ],
    );

    setCorrectAnswer(editQuestion.dapAnDungId || "A");
  }, [open, editQuestion]);

  const handleSave = () => {
    if (question.trim() === "") {
      alert("Vui lòng nhập nội dung câu hỏi.");

      return;
    }

    if (topics.length === 0) {
      alert("Vui lòng thêm ít nhất một chủ đề.");

      return;
    }

    if (type === "Trắc nghiệm") {
      if (answers.length < 2) {
        alert("Câu hỏi phải có ít nhất 2 đáp án.");

        return;
      }

      const hasEmpty = answers.some((a) => a.noiDung.trim() === "");

      if (hasEmpty) {
        alert("Không được để trống nội dung đáp án.");

        return;
      }
    }

    const newQuestion: CauHoi = {
      id: editQuestion?.id ?? `CH${Date.now()}`,

      noiDung: question,

      module,

      loaiCauHoi: type,

      mucDo: difficulty,

      chuDe: topics,

      ngayTao: editQuestion?.ngayTao ?? new Date().toLocaleDateString(),

      cacDapAn: type === "Trắc nghiệm" ? answers : undefined,

      dapAnDungId: type === "Trắc nghiệm" ? correctAnswer : undefined,

      huongDanTuLuan: type === "Tự luận" ? guideline : undefined,
    };

    onSave(newQuestion);

    onClose();

    resetForm();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {editQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Điền đầy đủ thông tin bên dưới.
            </p>
          </div>

          <button
            onClick={() => {
              onClose();

              resetForm();
            }}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}

        <div className="overflow-y-auto max-h-[75vh] px-8 py-8 space-y-8">
          {/* Basic Information */}

          <section className="rounded-2xl border border-slate-200 p-6">
            <h3 className="mb-5 text-lg font-bold text-slate-800">
              Thông tin cơ bản
            </h3>

            <BasicInformation
              question={question}
              setQuestion={setQuestion}
              module={module}
              setModule={setModule}
              type={type}
              setType={setType}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              modules={modules}
            />
          </section>

          {/* Topic */}

          <section className="rounded-2xl border border-slate-200 p-6">
            <h3 className="mb-5 text-lg font-bold text-slate-800">Chủ đề</h3>

            <TopicInput
              topics={topics}
              setTopics={setTopics}
              input={topicInput}
              setInput={setTopicInput}
            />
          </section>

          {/* Question Editor */}

          <section className="rounded-2xl border border-slate-200 p-6">
            <h3 className="mb-5 text-lg font-bold text-slate-800">
              Nội dung câu hỏi
            </h3>

            {type === "Trắc nghiệm" ? (
              <MultipleChoiceEditor
                answers={answers}
                setAnswers={setAnswers}
                correctAnswer={correctAnswer}
                setCorrectAnswer={setCorrectAnswer}
              />
            ) : (
              <EssayEditor guideline={guideline} setGuideline={setGuideline} />
            )}
          </section>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-4 border-t border-slate-200 px-8 py-5 bg-slate-50">
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-[#0066FF] px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            {editQuestion ? "Lưu thay đổi" : "Thêm câu hỏi"}
          </button>
        </div>
      </div>
    </div>
  );
}
