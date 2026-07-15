"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

import SubjectHeader from "@/components/SubjectHeader";
import StatisticCards from "@/components/StatisticCards";
import SubjectInfo from "@/components/SubjectInfo";
import QuestionFilter from "@/components/QuestionFilter";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import AddQuestionModal from "@/components/AddQuestionModal";

import { CauHoi, SubjectInfo as Subject } from "@/types/questions-bank";

const subject: Subject = {
  id: "sub001",

  code: "CNTT301",

  title: "Python Programming",

  description:
    "Learn Python from basic to advanced through hands-on exercises and real-world projects.",

  instructor: "Nguyễn Văn A",

  image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",

  totalModules: 8,

  totalQuestions: 6,

  status: "Active",
};

const fakeQuestions: CauHoi[] = [
  {
    id: "CH001",

    noiDung: "Python là ngôn ngữ lập trình thuộc loại nào?",

    module: "Module 1",

    loaiCauHoi: "Trắc nghiệm",

    mucDo: "Dễ",

    chuDe: ["Python", "Basic"],

    ngayTao: "12/07/2026",

    cacDapAn: [
      { id: "A", noiDung: "Compiled" },

      { id: "B", noiDung: "Interpreted" },

      { id: "C", noiDung: "Assembly" },

      { id: "D", noiDung: "Machine" },
    ],

    dapAnDungId: "B",
  },

  {
    id: "CH002",

    noiDung: "Giải thích Decorator trong Python.",

    module: "Module 4",

    loaiCauHoi: "Tự luận",

    mucDo: "Khó",

    chuDe: ["Decorator"],

    ngayTao: "10/07/2026",

    huongDanTuLuan: "Sinh viên trình bày đúng khái niệm, cú pháp và ví dụ.",
  },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<CauHoi[]>(fakeQuestions);

  const [openModal, setOpenModal] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<CauHoi | undefined>();

  const [keyword, setKeyword] = useState("");

  const [selectedModule, setSelectedModule] = useState("Tất cả Module");

  const [selectedType, setSelectedType] = useState("Tất cả loại");

  const [selectedDifficulty, setSelectedDifficulty] = useState("Tất cả mức độ");

  const [selectedTopic, setSelectedTopic] = useState("Tất cả chủ đề");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const modules = useMemo(() => {
    return [...new Set(questions.map((q) => q.module))];
  }, [questions]);

  const topics = useMemo(() => {
    return [...new Set(questions.flatMap((q) => q.chuDe))];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchKeyword =
        q.id.toLowerCase().includes(keyword.toLowerCase()) ||
        q.noiDung.toLowerCase().includes(keyword.toLowerCase());

      const matchModule =
        selectedModule === "Tất cả Module" || q.module === selectedModule;

      const matchType =
        selectedType === "Tất cả loại" || q.loaiCauHoi === selectedType;

      const matchDifficulty =
        selectedDifficulty === "Tất cả mức độ" ||
        q.mucDo === selectedDifficulty;

      const matchTopic =
        selectedTopic === "Tất cả chủ đề" || q.chuDe.includes(selectedTopic);

      return (
        matchKeyword &&
        matchModule &&
        matchType &&
        matchDifficulty &&
        matchTopic
      );
    });
  }, [
    questions,

    keyword,

    selectedModule,

    selectedType,

    selectedDifficulty,

    selectedTopic,
  ]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);

  const displayQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,

    currentPage * pageSize,
  );

  const handleSave = (question: CauHoi) => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === question.id ? question : q)));
    } else {
      setQuestions([question, ...questions]);
    }

    setEditingQuestion(undefined);
  };

  const handleEdit = (question: CauHoi) => {
    setEditingQuestion(question);

    setOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          {/* Header */}

          <SubjectHeader subject={subject} />

          {/* Statistic */}

          <StatisticCards questions={questions} />

          {/* Subject */}

          <SubjectInfo subject={subject} />

          {/* Filter */}

          <QuestionFilter
            keyword={keyword}
            setKeyword={setKeyword}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            modules={modules}
            topics={topics}
            onAddQuestion={() => {
              setEditingQuestion(undefined);

              setOpenModal(true);
            }}
          />

          {/* Question List */}

          <div className="space-y-5">
            {displayQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <h3 className="text-xl font-bold text-slate-700">
                  Không tìm thấy câu hỏi
                </h3>

                <p className="mt-2 text-slate-500">
                  Hãy thay đổi bộ lọc hoặc thêm câu hỏi mới.
                </p>
              </div>
            ) : (
              displayQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() => handleEdit(question)}
                  onDelete={() => handleDelete(question.id)}
                />
              ))
            )}
          </div>
          {/* Pagination */}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Add / Edit Question Modal */}

        <AddQuestionModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingQuestion(undefined);
          }}
          onSave={handleSave}
          modules={modules}
          editQuestion={editingQuestion}
        />
      </main>
    </>
  );
}
