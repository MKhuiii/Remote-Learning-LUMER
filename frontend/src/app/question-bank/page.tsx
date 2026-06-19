"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

interface Question {
  id: number;
  courseId: string;
  courseName: string;
  type: "multiple" | "essay";

  content: string;

  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;

  correctAnswer?: string;

  essayAnswer?: string;
}

export default function QuestionBankPage() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    { id: "1", name: "Lập trình Java" },
    { id: "2", name: "ReactJS" },
    { id: "3", name: "Mạng máy tính" },
    { id: "4", name: "Cơ sở dữ liệu" },
  ];

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      courseId: "1",
      courseName: "Lập trình Java",
      type: "multiple",

      content:
        "Java là ngôn ngữ lập trình hướng đối tượng được phát triển bởi công ty nào?",

      optionA: "Oracle",
      optionB: "Sun Microsystems",
      optionC: "Microsoft",
      optionD: "Google",

      correctAnswer: "B",
    },

    {
      id: 2,
      courseId: "2",
      courseName: "ReactJS",
      type: "multiple",

      content: "ReactJS được phát triển và duy trì bởi tổ chức nào?",

      optionA: "Google",
      optionB: "Microsoft",
      optionC: "Meta (Facebook)",
      optionD: "Amazon",

      correctAnswer: "C",
    },

    {
      id: 3,
      courseId: "3",
      courseName: "Mạng máy tính",
      type: "essay",

      content:
        "Trình bày mô hình OSI gồm bao nhiêu tầng và chức năng của từng tầng.",

      essayAnswer:
        "Mô hình OSI gồm 7 tầng: Physical, Data Link, Network, Transport, Session, Presentation và Application.",
    },
  ]);

  const [showFormModal, setShowFormModal] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    courseId: "",
    type: "multiple",

    content: "",

    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",

    correctAnswer: "A",

    essayAnswer: "",
  });

  const filteredQuestions = questions.filter((question) => {
    const matchCourse =
      selectedCourse === "all" || question.courseId === selectedCourse;

    const matchSearch = question.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchCourse && matchSearch;
  });

  const resetForm = () => {
    setFormData({
      courseId: "",
      type: "multiple",

      content: "",

      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",

      correctAnswer: "A",

      essayAnswer: "",
    });

    setEditingQuestion(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);

    setFormData({
      courseId: question.courseId,
      type: question.type,

      content: question.content,

      optionA: question.optionA || "",
      optionB: question.optionB || "",
      optionC: question.optionC || "",
      optionD: question.optionD || "",

      correctAnswer: question.correctAnswer || "A",

      essayAnswer: question.essayAnswer || "",
    });

    setShowFormModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      setQuestions(questions.filter((question) => question.id !== id));
    }
  };

  const handleSaveQuestion = () => {
    const course = courses.find((c) => c.id === formData.courseId);

    if (!course) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    if (editingQuestion) {
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,

                courseId: course.id,
                courseName: course.name,

                type: formData.type as "multiple" | "essay",

                content: formData.content,

                optionA: formData.optionA,
                optionB: formData.optionB,
                optionC: formData.optionC,
                optionD: formData.optionD,

                correctAnswer: formData.correctAnswer,

                essayAnswer: formData.essayAnswer,
              }
            : q,
        ),
      );
    } else {
      const newQuestion: Question = {
        id: Date.now(),

        courseId: course.id,
        courseName: course.name,

        type: formData.type as "multiple" | "essay",

        content: formData.content,

        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,

        correctAnswer: formData.correctAnswer,

        essayAnswer: formData.essayAnswer,
      };

      setQuestions([...questions, newQuestion]);
    }

    setShowFormModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h1 className="text-2xl font-black text-gray-900">
            📚 Quản lý Ngân hàng Câu hỏi
          </h1>

          <p className="text-black mt-2">
            Quản lý câu hỏi trắc nghiệm và tự luận theo từng khóa học.
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-black">
          <div className="flex flex-col lg:flex-row gap-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="
                lg:w-64
                px-4
                py-3
                rounded-xl
                border
                border-gray-200
              "
            >
              <option value="all">Tất cả khóa học</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                flex-1
                px-4
                py-3
                rounded-xl
                border
                border-gray-200
              "
            />

            <button
              onClick={handleOpenAdd}
              className="
                bg-[#0066FF]
                hover:bg-blue-700
                text-white
                font-bold
                px-5
                py-3
                rounded-xl
              "
            >
              + Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.id}
              onClick={() => setSelectedQuestion(question)}
              className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  cursor-pointer
                  hover:border-blue-400
                  hover:shadow-md
                  transition
                "
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-black">
                    #{index + 1}
                  </span>

                  <span
                    className="
                        bg-blue-50
                        text-[#0066FF]
                        px-3
                        py-1
                        rounded-lg
                        text-xs
                        font-bold
                      "
                  >
                    {question.courseName}
                  </span>

                  <span
                    className={`
                        px-3 py-1 rounded-lg text-xs font-bold
                        ${
                          question.type === "multiple"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      `}
                  >
                    {question.type === "multiple" ? "Trắc nghiệm" : "Tự luận"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(question);
                    }}
                    className="
                        bg-blue-50
                        text-[#0066FF]
                        px-3
                        py-2
                        rounded-lg
                        font-bold
                      "
                  >
                    Sửa
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(question.id);
                    }}
                    className="
                        bg-red-50
                        text-red-600
                        px-3
                        py-2
                        rounded-lg
                        font-bold
                      "
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <p className="mt-4 text-black font-medium">
                {question.content.length > 120
                  ? question.content.slice(0, 120) + "..."
                  : question.content}
              </p>

              <p className="mt-3 text-sm text-blue-600 font-semibold">
                Nhấn để xem chi tiết →
              </p>
            </div>
          ))}
        </div>

        {/* Thống kê */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-black">
            Tổng số câu hỏi:
            <span className="ml-2 font-black text-[#0066FF]">
              {filteredQuestions.length}
            </span>
          </p>
        </div>
      </main>

      {/* Modal Thêm / Sửa */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black">
                {editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi"}
              </h2>

              <button
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              >
                <option value="">Chọn khóa học</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              >
                <option value="multiple">Trắc nghiệm</option>

                <option value="essay">Tự luận</option>
              </select>

              <textarea
                rows={4}
                placeholder="Nhập nội dung câu hỏi..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />

              {formData.type === "multiple" ? (
                <>
                  <input
                    placeholder="Đáp án A"
                    value={formData.optionA}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionA: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />

                  <input
                    placeholder="Đáp án B"
                    value={formData.optionB}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionB: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />

                  <input
                    placeholder="Đáp án C"
                    value={formData.optionC}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionC: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />

                  <input
                    placeholder="Đáp án D"
                    value={formData.optionD}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionD: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  />

                  <select
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  >
                    <option value="A">Đáp án đúng A</option>

                    <option value="B">Đáp án đúng B</option>

                    <option value="C">Đáp án đúng C</option>

                    <option value="D">Đáp án đúng D</option>
                  </select>
                </>
              ) : (
                <textarea
                  rows={4}
                  placeholder="Đáp án tự luận..."
                  value={formData.essayAnswer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      essayAnswer: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                />
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="
                    px-5 py-3
                    border border-gray-200
                    rounded-xl
                    font-semibold
                  "
                >
                  Hủy
                </button>

                <button
                  onClick={handleSaveQuestion}
                  className="
                    px-5 py-3
                    bg-[#0066FF]
                    text-white
                    rounded-xl
                    font-bold
                  "
                >
                  {editingQuestion ? "Cập nhật" : "Lưu câu hỏi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black">Chi tiết câu hỏi</h2>

              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-bold">Khóa học:</span>{" "}
                {selectedQuestion.courseName}
              </div>

              <div>
                <span className="font-bold">Loại:</span>{" "}
                {selectedQuestion.type === "multiple"
                  ? "Trắc nghiệm"
                  : "Tự luận"}
              </div>

              <div>
                <p className="font-bold mb-2">Nội dung câu hỏi</p>

                <div className="bg-slate-50 rounded-xl p-4">
                  {selectedQuestion.content}
                </div>
              </div>

              {selectedQuestion.type === "multiple" ? (
                <>
                  <div className="border rounded-xl p-3">
                    A. {selectedQuestion.optionA}
                  </div>

                  <div className="border rounded-xl p-3">
                    B. {selectedQuestion.optionB}
                  </div>

                  <div className="border rounded-xl p-3">
                    C. {selectedQuestion.optionC}
                  </div>

                  <div className="border rounded-xl p-3">
                    D. {selectedQuestion.optionD}
                  </div>

                  <div className="bg-green-50 text-green-700 rounded-xl p-4 font-bold">
                    Đáp án đúng: {selectedQuestion.correctAnswer}
                  </div>
                </>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="font-bold mb-2">Đáp án tự luận</p>

                  {selectedQuestion.essayAnswer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
