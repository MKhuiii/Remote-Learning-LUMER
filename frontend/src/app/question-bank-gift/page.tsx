"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

interface Question {
  id: number;
  courseId: string;
  courseName: string;
  giftText: string;
}

interface ParsedGift {
  question: string;
  type: "multiple" | "essay";
  options: string[];
  correctAnswer: string;
}

function parseGift(giftText: string): ParsedGift {
  const result: ParsedGift = {
    question: "",
    type: "essay",
    options: [],
    correctAnswer: "",
  };

  if (!giftText.includes("{")) {
    result.question = giftText;
    return result;
  }

  const start = giftText.indexOf("{");
  const end = giftText.lastIndexOf("}");

  result.question = giftText.substring(0, start).trim();

  const body = giftText.substring(start + 1, end).trim();

  if (body === "") {
    result.type = "essay";
    return result;
  }

  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let correct = "";

  lines.forEach((line) => {
    if (line.startsWith("=")) {
      const value = line.replace("=", "").trim();

      result.options.push(value);
      correct = value;
    }

    if (line.startsWith("~")) {
      result.options.push(line.replace("~", "").trim());
    }
  });

  if (result.options.length > 0) {
    result.type = "multiple";
    result.correctAnswer = correct;
  } else {
    result.type = "essay";
  }

  return result;
}

function getQuestionTitle(giftText: string) {
  const parsed = parseGift(giftText);

  return parsed.question.length > 120
    ? parsed.question.slice(0, 120) + "..."
    : parsed.question;
}

export default function QuestionBankPage() {
  const [selectedCourse, setSelectedCourse] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    {
      id: "1",
      name: "Lập trình Java",
    },
    {
      id: "2",
      name: "ReactJS",
    },
    {
      id: "3",
      name: "Mạng máy tính",
    },
    {
      id: "4",
      name: "Cơ sở dữ liệu",
    },
  ];

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      courseId: "1",
      courseName: "Lập trình Java",

      giftText: `
Java được phát triển bởi công ty nào?
{
~Oracle
=Sun Microsystems
~Microsoft
~Google
}
`,
    },

    {
      id: 2,
      courseId: "2",
      courseName: "ReactJS",

      giftText: `
ReactJS được phát triển bởi tổ chức nào?
{
~Google
~Microsoft
=Meta (Facebook)
~Amazon
}
`,
    },

    {
      id: 3,
      courseId: "3",
      courseName: "Mạng máy tính",

      giftText: `
Trình bày mô hình OSI gồm bao nhiêu tầng và chức năng của từng tầng.
{}
`,
    },
  ]);

  const [showFormModal, setShowFormModal] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    courseId: "",
    giftText: "",
  });

  const filteredQuestions = questions.filter((question) => {
    const matchCourse =
      selectedCourse === "all" || question.courseId === selectedCourse;

    const parsed = parseGift(question.giftText);

    const matchSearch = parsed.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchCourse && matchSearch;
  });

  const resetForm = () => {
    setFormData({
      courseId: "",
      giftText: "",
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
      giftText: question.giftText,
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

    if (!formData.giftText.trim()) {
      alert("Vui lòng nhập câu hỏi GIFT");
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
                giftText: formData.giftText,
              }
            : q,
        ),
      );
    } else {
      const newQuestion: Question = {
        id: Date.now(),

        courseId: course.id,

        courseName: course.name,

        giftText: formData.giftText,
      };

      setQuestions([...questions, newQuestion]);
    }

    setShowFormModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h1 className="text-2xl font-black">📚 Quản lý Ngân hàng Câu hỏi</h1>

          <p className="mt-2">Quản lý câu hỏi theo chuẩn Moodle GIFT</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
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
              placeholder="Tìm kiếm..."
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

        {/* Danh sách */}
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
              <div className="flex justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">#{index + 1}</span>

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

              <p className="mt-4 font-medium">
                {getQuestionTitle(question.giftText)}
              </p>

              <p className="mt-3 text-sm text-blue-600 font-semibold">
                Nhấn để xem chi tiết →
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p>
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
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-black">
                {editingQuestion ? "Sửa câu hỏi GIFT" : "Thêm câu hỏi GIFT"}
              </h2>

              <button
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                className="text-xl text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-black">
              {/* Chọn khóa học */}
              <select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseId: e.target.value,
                  })
                }
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  text-black
                "
              >
                <option value="">Chọn khóa học</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              {/* Hướng dẫn */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="font-bold text-[#0066FF] mb-2">
                  Định dạng Moodle GIFT
                </p>
                <p className="text-sm">
                  Dùng dấu "=" cho đáp án đúng, dấu "~" cho đáp án sai.
                </p>
              </div>

              {/* Ví dụ */}
              <div className="bg-slate-100 rounded-xl p-4">
                <p className="font-bold mb-2">Ví dụ câu trắc nghiệm</p>

                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {`Java được phát triển bởi công ty nào?
{
~Oracle
=Sun Microsystems
~Microsoft
~Google
}`}
                </pre>
              </div>

              <div className="bg-slate-100 rounded-xl p-4">
                <p className="font-bold mb-2">Ví dụ câu tự luận</p>

                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {`Trình bày mô hình OSI gồm bao nhiêu tầng?
{}
`}
                </pre>
              </div>

              {/* Textarea nhập GIFT */}
              <textarea
                rows={12}
                value={formData.giftText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    giftText: e.target.value,
                  })
                }
                placeholder={`Nhập câu hỏi theo chuẩn GIFT...`}
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  text-black
                  font-mono
                "
              />

              {/* Preview */}
              {formData.giftText.trim() && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <p className="font-bold text-green-700 mb-3">Xem trước</p>

                  {(() => {
                    const preview = parseGift(formData.giftText);

                    return (
                      <div className="space-y-3">
                        <p className="font-semibold">{preview.question}</p>

                        {preview.type === "multiple" ? (
                          preview.options.map((option, index) => (
                            <div
                              key={index}
                              className={`
                                  p-3
                                  rounded-lg
                                  border
                                  ${
                                    option === preview.correctAnswer
                                      ? "bg-green-100 border-green-400"
                                      : "bg-white"
                                  }
                                `}
                            >
                              <span className="font-bold mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>

                              {option}
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-3 border">
                            Câu hỏi tự luận
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="
                    px-5
                    py-3
                    border
                    border-gray-200
                    rounded-xl
                    font-semibold
                  "
                >
                  Hủy
                </button>

                <button
                  onClick={handleSaveQuestion}
                  className="
                    px-5
                    py-3
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
          <div className="bg-white w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-black">
                Chi tiết câu hỏi
              </h2>

              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-xl text-black"
              >
                ✕
              </button>
            </div>

            {(() => {
              const parsed = parseGift(selectedQuestion.giftText);

              return (
                <div className="space-y-5 text-black">
                  {/* Khóa học */}
                  <div>
                    <span className="font-bold">Khóa học:</span>{" "}
                    {selectedQuestion.courseName}
                  </div>

                  {/* Loại */}
                  <div>
                    <span className="font-bold">Loại:</span>{" "}
                    {parsed.type === "multiple" ? "Trắc nghiệm" : "Tự luận"}
                  </div>

                  {/* Câu hỏi */}
                  <div>
                    <p className="font-bold mb-2">Nội dung câu hỏi</p>

                    <div className="bg-slate-50 rounded-xl p-4 text-black">
                      {parsed.question}
                    </div>
                  </div>

                  {/* Trắc nghiệm */}
                  {parsed.type === "multiple" ? (
                    <>
                      <div>
                        <p className="font-bold mb-3">Các đáp án</p>

                        <div className="space-y-3">
                          {parsed.options.map((option, index) => (
                            <div
                              key={index}
                              className={`
                                  border
                                  rounded-xl
                                  p-4
                                  ${
                                    option === parsed.correctAnswer
                                      ? "bg-green-50 border-green-400"
                                      : "bg-white border-gray-200"
                                  }
                                `}
                            >
                              <span className="font-bold mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>

                              {option}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                        <span className="font-bold">Đáp án đúng:</span>{" "}
                        <span className="text-green-700 font-bold">
                          {parsed.correctAnswer}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="font-bold">Câu hỏi tự luận</p>

                      <p className="mt-2">Không có đáp án lựa chọn.</p>
                    </div>
                  )}

                  {/* Hiển thị GIFT gốc */}
                  <div>
                    <p className="font-bold mb-2">Nội dung GIFT gốc</p>

                    <pre
                      className="
                        bg-slate-100
                        p-4
                        rounded-xl
                        overflow-auto
                        whitespace-pre-wrap
                        font-mono
                        text-sm
                      "
                    >
                      {selectedQuestion.giftText}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
