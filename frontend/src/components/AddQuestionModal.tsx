"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Question, QuestionTypeEnum } from "@/types/questions-bank";

const RichTextEditor = dynamic(
  () => import("@/components/editors/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 rounded-xl border bg-slate-50 animate-pulse p-4">
        Đang tải trình soạn thảo...
      </div>
    ),
  },
);

interface AddQuestionModalProps {
  open: boolean;
  subjectId: string;
  onClose: () => void;
  onSave: (question: Question) => void;
  editQuestion?: Question;
}

export default function AddQuestionModal({
  open,
  subjectId,
  onClose,
  onSave,
  editQuestion,
}: AddQuestionModalProps) {
  const [content, setContent] = useState("");
  const [questionType, setQuestionType] =
    useState<QuestionTypeEnum>("MULTIPLE_CHOICE");
  const [maxPoints, setMaxPoints] = useState<number>(1.0);

  useEffect(() => {
    if (editQuestion) {
      setContent(editQuestion.content);
      setQuestionType(editQuestion.question_type);
      setMaxPoints(editQuestion.max_points);
    } else {
      setContent("");
      setQuestionType("MULTIPLE_CHOICE");
      setMaxPoints(1.0);
    }
  }, [editQuestion, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return alert("Vui lòng nhập nội dung câu hỏi!");

    const payload: Question = {
      question_id: editQuestion
        ? editQuestion.question_id
        : crypto.randomUUID(),
      subject_id: subjectId,
      question_type: questionType,
      content: content, // HTML string từ CKEditor
      max_points: maxPoints,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {editQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CKEditor cho Nội dung câu hỏi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nội dung câu hỏi
            </label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Loại câu hỏi (khớp ENUM DB) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Loại câu hỏi
              </label>
              <select
                value={questionType}
                onChange={(e) =>
                  setQuestionType(e.target.value as QuestionTypeEnum)
                }
                className="w-full rounded-lg border border-slate-300 p-2.5"
              >
                <option value="MULTIPLE_CHOICE">
                  Trắc nghiệm (MULTIPLE_CHOICE)
                </option>
                <option value="ESSAY">Tự luận (ESSAY)</option>
              </select>
            </div>

            {/* Điểm tối đa (max_points) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Điểm tối đa
              </label>
              <input
                type="number"
                step="0.5"
                value={maxPoints}
                onChange={(e) => setMaxPoints(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Lưu câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
