"use client";

import { Pencil, Trash2 } from "lucide-react";
import { CauHoi } from "@/types/questions-bank";

interface Props {
  question: CauHoi;
  index: number;

  onEdit: () => void;

  onDelete: () => void;
}

export default function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">
          {question.id}
        </span>

        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
          {question.module}
        </span>

        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
          {question.loaiCauHoi}
        </span>

        <span
          className={`px-2 py-1 rounded text-xs

          ${
            question.mucDo == "Dễ"
              ? "bg-green-100 text-green-700"
              : question.mucDo == "Trung bình"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }

        `}
        >
          {question.mucDo}
        </span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-slate-100 hover:bg-red-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg mt-4">
        Câu {index + 1}. {question.noiDung}
      </h3>

      <div className="flex flex-wrap gap-2 mt-3">
        {question.chuDe.map((item) => (
          <span
            key={item}
            className="bg-slate-100 px-2 py-1 rounded-full text-xs"
          >
            #{item}
          </span>
        ))}
      </div>

      {question.loaiCauHoi == "Trắc nghiệm" && (
        <div className="grid md:grid-cols-2 gap-3 mt-5">
          {question.cacDapAn?.map((ans) => (
            <div
              key={ans.id}
              className={`rounded-xl border p-3

              ${
                question.dapAnDungId == ans.id
                  ? "border-green-400 bg-green-50"
                  : "border-slate-200"
              }

            `}
            >
              <b>{ans.id}.</b> {ans.noiDung}
            </div>
          ))}
        </div>
      )}

      {question.loaiCauHoi == "Tự luận" && (
        <div className="bg-slate-50 rounded-xl p-4 mt-5 border-l-4 border-blue-500">
          <b>Hướng dẫn chấm</b>

          <p className="mt-2">{question.huongDanTuLuan}</p>
        </div>
      )}
    </div>
  );
}
