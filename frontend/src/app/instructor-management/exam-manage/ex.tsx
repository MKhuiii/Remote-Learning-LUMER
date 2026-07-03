"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Exam {
  id: string;
  title: string;
  course: string;
  duration: string; 
  questionsCount: number;
  status: string;
  createdAt: string;
}

// Cập nhật định nghĩa: Thêm trường 'type' để phân biệt Tự luận và Trắc nghiệm
interface Question {
  id: string;
  content: string;
  type: "trac_nghiem" | "tu_luan";
  options?: string[]; // Trắc nghiệm mới cần field này
  correctAnswer?: string; // Trắc nghiệm mới cần field này
  level: "Dễ" | "Trung bình" | "Khó";
}

export default function ExamManagement() {
  const router = useRouter();
  
  // Khởi tạo State Danh sách Bài thi ban đầu
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "EX-001",
      title: "Kiểm tra Giữa kỳ - Lập trình Web nâng cao",
      course: "Lập trình ReactJS & Next.js",
      duration: "60 phút",
      questionsCount: 4, 
      status: "Đang mở",
      createdAt: "15/06/2026",
    },
    {
      id: "EX-002",
      title: "Thi cuối kỳ - Thiết kế giao diện UI/UX",
      course: "Thiết kế UI/UX Chuyên nghiệp",
      duration: "90 phút",
      questionsCount: 0,
      status: "Bản nháp",
      createdAt: "28/06/2026",
    },
    {
      id: "EX-003",
      title: "Trắc nghiệm chương 1 & 2 - Cơ sở dữ liệu",
      course: "Cơ sở dữ liệu SQL Server",
      duration: "15 phút",
      questionsCount: 0,
      status: "Đang đóng",
      createdAt: "10/05/2026",
    },
  ]);

  // State lưu trữ các câu hỏi thật của từng bài thi kèm theo loại hình thức câu hỏi
  const [examQuestions, setExamQuestions] = useState<Record<string, Question[]>>({
    "EX-001": [
      { id: "Q-1", type: "trac_nghiem", content: "ReactJS là gì?", options: ["Một thư viện JavaScript", "Một Framework của PHP", "Một hệ quản trị CSDL", "Một hệ điều hành"], correctAnswer: "A", level: "Dễ" },
      { id: "Q-2", type: "trac_nghiem", content: "Hook 'useState' dùng để làm gì?", options: ["Gọi API", "Quản lý trạng thái (state) trong component", "Định tuyến trang", "Tối ưu hiệu năng"], correctAnswer: "B", level: "Trung bình" },
      { id: "Q-3", type: "trac_nghiem", content: "Trong Next.js App Router, folder nào đại diện cho một Route?", options: ["Folder nằm trong thư mục 'app'", "Folder nằm trong thư mục 'public'", "Folder 'components'", "Folder 'styles'"], correctAnswer: "A", level: "Dễ" },
      { id: "Q-4", type: "tu_luan", content: "Phân biệt sự khác nhau cốt lõi giữa Server Component và Client Component trong Next.js App Router. Cho ví dụ thực tế khi nào nên áp dụng mỗi loại?", level: "Khó" }
    ]
  });

  // States dành cho Tìm kiếm & Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("Tất cả môn học");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");

  // --- STATE QUẢN LÝ MODAL TẠO BÀI THI MỚI ---
  const [moModalTaoMoi, setMoModalTaoMoi] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createCourse, setCreateCourse] = useState("Lập trình ReactJS & Next.js");
  const [createDuration, setCreateDuration] = useState("60");
  const [createStatus, setCreateStatus] = useState("Bản nháp");

  // --- STATE QUẢN LÝ MODAL THIẾT LẬP ĐỀ ---
  const [moModalThietLap, setMoModalThietLap] = useState(false);
  const [baiThiDangChon, setBaiThiDangChon] = useState<Exam | null>(null);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [soCauDe, setSoCauDe] = useState(10);
  const [soCauTrungBinh, setSoCauTrungBinh] = useState(10);
  const [soCauKho, setSoCauKho] = useState(5);
  const [tronCauHoi, setTronCauHoi] = useState(true);
  const [tronDapAn, setTronDapAn] = useState(true);

  // --- STATE QUẢN LÝ MODAL XEM/THÊM CÂU HỎI CHI TIẾT ---
  const [moModalCauHoi, setMoModalCauHoi] = useState(false);
  const [baiThiDangXemCauHoi, setBaiThiDangXemCauHoi] = useState<Exam | null>(null);
  
  // State Form nhập câu hỏi mới
  const [newQuestionType, setNewQuestionType] = useState<"trac_nghiem" | "tu_luan">("trac_nghiem");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [newOptA, setNewOptA] = useState("");
  const [newOptB, setNewOptB] = useState("");
  const [newOptC, setNewOptC] = useState("");
  const [newOptD, setNewOptD] = useState("");
  const [newCorrect, setNewCorrect] = useState("A");
  const [newLevel, setNewLevel] = useState<"Dễ" | "Trung bình" | "Khó">("Dễ");

  // --- LOGIC XỬ LÝ: TẠO BÀI THI MỚI ---
  const handleSaveCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return alert("Vui lòng điền tên bài thi!");

    const newId = `EX-00${exams.length + 1}`;
    const newExam: Exam = {
      id: newId,
      title: createTitle,
      course: createCourse,
      duration: `${createDuration} phút`,
      questionsCount: 0,
      status: createStatus,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    setExams([newExam, ...exams]);
    setExamQuestions({ ...examQuestions, [newId]: [] });
    
    setCreateTitle("");
    setCreateCourse("Lập trình ReactJS & Next.js");
    setCreateDuration("60");
    setCreateStatus("Bản nháp");
    setMoModalTaoMoi(false);
  };

  // --- LOGIC XỬ LÝ: NẠP VÀ LƯU THIẾT LẬP ĐỀ ---
  const handleOpenThietLap = (exam: Exam) => {
    setBaiThiDangChon(exam);
    setEditTitle(exam.title);
    setEditDuration(exam.duration.replace(" phút", ""));
    setEditCourse(exam.course);
    setEditStatus(exam.status);
    
    setSoCauDe(Math.floor(exam.questionsCount * 0.4));
    setSoCauTrungBinh(Math.floor(exam.questionsCount * 0.4));
    setSoCauKho(exam.questionsCount - Math.floor(exam.questionsCount * 0.4) * 2);
    setMoModalThietLap(true);
  };

  const handleSaveThietLap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baiThiDangChon) return;

    const tongSoCauMoi = Number(soCauDe) + Number(soCauTrungBinh) + Number(soCauKho);

    setExams(exams.map((exam) => {
      if (exam.id === baiThiDangChon.id) {
        return {
          ...exam,
          title: editTitle,
          course: editCourse,
          duration: `${editDuration} phút`,
          status: editStatus,
          questionsCount: tongSoCauMoi
        };
      }
      return exam;
    }));

    setMoModalThietLap(false);
  };

  // --- LOGIC XỬ LÝ: THÊM & XÓA CÂU HỎI ĐỀ THI ---
  const handleOpenQuanLyCauHoi = (exam: Exam) => {
    setBaiThiDangXemCauHoi(exam);
    setMoModalCauHoi(true);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baiThiDangXemCauHoi) return;
    if (!newQuestionContent.trim()) return alert("Vui lòng nhập nội dung câu hỏi!");

    // Nếu chọn hình thức trắc nghiệm, bắt buộc nhập ít nhất phương án A và B
    if (newQuestionType === "trac_nghiem" && (!newOptA.trim() || !newOptB.trim())) {
      return alert("Đối với câu hỏi trắc nghiệm, vui lòng điền ít nhất 2 đáp án A và B!");
    }

    const currentQuestions = examQuestions[baiThiDangXemCauHoi.id] || [];
    
    const newQ: Question = {
      id: `Q-${Date.now()}`,
      type: newQuestionType,
      content: newQuestionContent,
      level: newLevel,
      ...(newQuestionType === "trac_nghiem" && {
        options: [newOptA, newOptB, newOptC || "N/A", newOptD || "N/A"],
        correctAnswer: newCorrect,
      })
    };

    const updatedQuestions = [...currentQuestions, newQ];

    setExamQuestions({
      ...examQuestions,
      [baiThiDangXemCauHoi.id]: updatedQuestions
    });

    setExams(exams.map(e => e.id === baiThiDangXemCauHoi.id ? { ...e, questionsCount: updatedQuestions.length } : e));

    // Reset form nhập liệu
    setNewQuestionContent("");
    setNewOptA(""); setNewOptB(""); setNewOptC(""); setNewOptD("");
    setNewCorrect("A"); setNewLevel("Dễ");
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!baiThiDangXemCauHoi) return;
    const currentQuestions = examQuestions[baiThiDangXemCauHoi.id] || [];
    const updatedQuestions = currentQuestions.filter(q => q.id !== qId);

    setExamQuestions({
      ...examQuestions,
      [baiThiDangXemCauHoi.id]: updatedQuestions
    });

    setExams(exams.map(e => e.id === baiThiDangXemCauHoi.id ? { ...e, questionsCount: updatedQuestions.length } : e));
  };

  const handleDeleteExam = (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài thi: "${title}" không?`)) {
      setExams(exams.filter((exam) => exam.id !== id));
      const copy = { ...examQuestions };
      delete copy[id];
      setExamQuestions(copy);
    }
  };

  const toggleStatus = (id: string) => {
    setExams(
      exams.map((exam) => {
        if (exam.id === id) {
          const statusOrder = ["Bản nháp", "Đang mở", "Đang đóng"];
          const nextIndex = (statusOrder.indexOf(exam.status) + 1) % statusOrder.length;
          return { ...exam, status: statusOrder[nextIndex] };
        }
        return exam;
      })
    );
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exam.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "Tất cả môn học" || exam.course === selectedCourse;
    const matchesStatus = selectedStatus === "Tất cả trạng thái" || exam.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-linear-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm font-medium text-blue-100 flex items-center gap-2 mb-2">
              <span className="cursor-pointer hover:underline" onClick={() => router.push("/teacher/dashboard")}>Dashboard</span>
              <span>/</span>
              <span>Ngân hàng đề & Khảo thí</span>
              <span>/</span>
              <span className="text-white font-semibold">Quản lý bài thi</span>
            </div>
            <h1 className="text-3xl font-bold">Quản lý bài thi</h1>
            <p className="text-blue-100 text-sm mt-1">
              Tạo đề thi, thiết lập thời gian và bốc câu hỏi từ ngân hàng đề dùng chung hoặc thêm thủ công.
            </p>
          </div>

          <button 
            onClick={() => setMoModalTaoMoi(true)}
            className="bg-white text-[#0066FF] hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow transition duration-200 flex items-center gap-2"
          >
            <span>➕</span> Tạo bài thi mới
          </button>
        </div>
      </section>

      {/* Thống kê đếm số lượng */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#0066FF] rounded-lg text-2xl">📝</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tổng số bài thi</p>
              <p className="text-2xl font-bold text-slate-800">{exams.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg text-2xl">🟢</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Đang mở nhận bài</p>
              <p className="text-2xl font-bold text-slate-800">
                {exams.filter(e => e.status === "Đang mở").length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-lg text-2xl">🗂️</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Kho câu hỏi liên kết</p>
              <p className="text-xl font-bold text-slate-800">Quản lý trực tiếp / Tự động</p>
            </div>
          </div>
        </div>
      </section>

      {/* Khu vực danh sách & Bộ lọc */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Thanh Bộ lọc */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên hoặc mã bài thi..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0066FF] text-slate-900 bg-white"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none text-slate-600"
              >
                <option value="Tất cả môn học">Tất cả môn học</option>
                <option value="Lập trình ReactJS & Next.js">Lập trình ReactJS & Next.js</option>
                <option value="Thiết kế UI/UX Chuyên nghiệp">Thiết kế UI/UX Chuyên nghiệp</option>
                <option value="Cơ sở dữ liệu SQL Server">Cơ sở dữ liệu SQL Server</option>
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none text-slate-600"
              >
                <option value="Tất cả trạng thái">Tất cả trạng thái</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Đang đóng">Đang đóng</option>
                <option value="Bản nháp">Bản nháp</option>
              </select>
            </div>
          </div>

          {/* Table kết quả */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Mã số / Tên bài thi</th>
                  <th className="px-6 py-4">Thuộc Môn học</th>
                  <th className="px-6 py-4">Thời lượng</th>
                  <th className="px-6 py-4 text-center">Số câu hỏi hiện tại</th>
                  <th className="px-6 py-4">Trạng thái (Click đổi)</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{exam.title}</p>
                        <span className="text-xs text-slate-400 font-mono">{exam.id} • Tạo ngày: {exam.createdAt}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{exam.course}</td>
                      <td className="px-6 py-4">{exam.duration}</td>
                      <td className="px-6 py-4 text-center font-semibold text-blue-600 bg-blue-50/40">{exam.questionsCount} câu</td>
                      <td className="px-6 py-4">
                        <span 
                          onClick={() => toggleStatus(exam.id)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition active:scale-95
                            ${exam.status === "Đang mở" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                            ${exam.status === "Đang đóng" ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : ""}
                            ${exam.status === "Bản nháp" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : ""}
                          `}
                          title="Click để đổi nhanh trạng thái"
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenQuanLyCauHoi(exam)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition text-xs font-bold border border-emerald-200"
                          >
                            👁️ Câu hỏi
                          </button>
                          <button 
                            onClick={() => handleOpenThietLap(exam)}
                            className="p-1.5 hover:bg-blue-50 text-[#0066FF] rounded-md transition text-xs font-bold border border-blue-200"
                          >
                            ⚙️ Thiết lập đề
                          </button>
                          <button 
                            onClick={() => handleDeleteExam(exam.id, exam.title)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Không tìm thấy bài thi nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer đếm số */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <p>Hiển thị {filteredExams.length} trên tổng số {exams.length} bài thi</p>
            <div className="flex gap-1">
              <button className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50" disabled>Trước</button>
              <button className="px-3 py-1.5 rounded bg-[#0066FF] text-white font-medium">1</button>
              <button className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50" disabled>Sau</button>
            </div>
          </div>
        </div>
      </section>


      {/* ================= MODAL QUẢN LÝ VÀ THÊM CÂU HỎI TRỰC TIẾP (Đã bổ sung cấu trúc Tự luận) ================= */}
      {moModalCauHoi && baiThiDangXemCauHoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 max-h-[92vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Header Modal */}
            <div className="col-span-12 flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📝 Nội dung chi tiết câu hỏi trong đề</h2>
                <p className="text-xs text-slate-500 mt-0.5">Bài thi: <span className="font-bold text-blue-600">{baiThiDangXemCauHoi.title}</span></p>
              </div>
              <button onClick={() => setMoModalCauHoi(false)} className="text-slate-400 text-3xl hover:text-slate-600">&times;</button>
            </div>

            {/* Bên trái: Form thêm câu hỏi mới trực tiếp vào đề */}
            <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">➕ Thêm câu hỏi mới</h3>
              <form onSubmit={handleAddQuestion} className="space-y-3">
                
                {/* Lựa chọn hình thức câu hỏi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hình thức câu hỏi</label>
                  <select 
                    value={newQuestionType} 
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="trac_nghiem">Trắc nghiệm khách quan</option>
                    <option value="tu_luan">Tự luận viết bài</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nội dung câu hỏi *</label>
                  <textarea value={newQuestionContent} onChange={(e) => setNewQuestionContent(e.target.value)} placeholder={newQuestionType === "trac_nghiem" ? "Nhập câu hỏi trắc nghiệm..." : "Nhập đề bài hoặc yêu cầu câu hỏi tự luận..."} rows={3} className="w-full px-3 py-2 border rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500 text-slate-900 bg-white border-slate-200" required />
                </div>

                {/* Ẩn/Hiện phần điền đáp án tùy thuộc vào Hình thức Câu hỏi */}
                {newQuestionType === "trac_nghiem" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Đáp án A *</label>
                        <input type="text" value={newOptA} onChange={(e) => setNewOptA(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Đáp án B *</label>
                        <input type="text" value={newOptB} onChange={(e) => setNewOptB(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Đáp án C</label>
                        <input type="text" value={newOptC} onChange={(e) => setNewOptC(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Đáp án D</label>
                        <input type="text" value={newOptD} onChange={(e) => setNewOptD(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white" />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Đáp án đúng</label>
                      <select value={newCorrect} onChange={(e) => setNewCorrect(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white font-bold focus:outline-none">
                        <option value="A">Đáp án A</option>
                        <option value="B">Đáp án B</option>
                        <option value="C">Đáp án C</option>
                        <option value="D">Đáp án D</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mức độ nhận thức</label>
                  <select value={newLevel} onChange={(e) => setNewLevel(e.target.value as any)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white focus:outline-none">
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>

                <button type="submit" className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow transition">
                  Nạp câu hỏi vào đề
                </button>
              </form>
            </div>

            {/* Bên phải: Danh sách câu hỏi hiện có trong bài thi này */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                📋 Các câu hỏi đang có ({examQuestions[baiThiDangXemCauHoi.id]?.length || 0})
              </h3>

              <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                {(!examQuestions[baiThiDangXemCauHoi.id] || examQuestions[baiThiDangXemCauHoi.id].length === 0) ? (
                  <p className="text-center text-xs text-slate-400 py-12">Đề thi này chưa có câu hỏi nào. Hãy điền bảng bên trái để nạp câu hỏi!</p>
                ) : (
                  examQuestions[baiThiDangXemCauHoi.id].map((q, index) => (
                    <div key={q.id} className="p-3 bg-white border border-slate-200 rounded-xl relative hover:border-blue-300 transition shadow-sm">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">Câu {index + 1}:</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${q.type === "trac_nghiem" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                            {q.type === "trac_nghiem" ? "Trắc nghiệm" : "Tự luận"}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.level === "Dễ" ? "bg-emerald-50 text-emerald-700" : q.level === "Khó" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{q.level}</span>
                      </div>
                      
                      <p className="text-xs text-slate-800 mb-2 font-medium bg-slate-50/50 p-2 rounded border border-dashed border-slate-100">{q.content}</p>

                      {/* Hiển thị danh sách đáp án nếu là câu hỏi trắc nghiệm */}
                      {q.type === "trac_nghiem" && q.options && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 font-medium pl-2 mb-4">
                          <p className={q.correctAnswer === "A" ? "text-emerald-600 font-bold" : ""}>A. {q.options[0]}</p>
                          <p className={q.correctAnswer === "B" ? "text-emerald-600 font-bold" : ""}>B. {q.options[1]}</p>
                          <p className={q.correctAnswer === "C" ? "text-emerald-600 font-bold" : ""}>C. {q.options[2]}</p>
                          <p className={q.correctAnswer === "D" ? "text-emerald-600 font-bold" : ""}>D. {q.options[3]}</p>
                        </div>
                      )}

                      {/* Khung giả lập vùng làm bài nếu là tự luận */}
                      {q.type === "tu_luan" && (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded border border-slate-100 mb-4">
                          * Học sinh làm bài trực tiếp vào trình soạn thảo văn bản hệ thống...
                        </div>
                      )}

                      <button onClick={() => handleDeleteQuestion(q.id)} className="absolute bottom-2 right-2 text-slate-400 hover:text-rose-600 text-xs flex items-center gap-0.5" title="Xóa câu hỏi">
                        🗑️ <span className="hover:underline text-[10px]">Xóa</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      
{/* ================= MODAL 1: FORM TẠO BÀI THI MỚI ================= */}
      {moModalTaoMoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-[#0066FF] text-2xl font-normal">➕</span> Tạo bài thi mới
              </h2>
              <button onClick={() => setMoModalTaoMoi(false)} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">&times;</button>
            </div>

            <form onSubmit={handleSaveCreateExam} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Tên bài thi *</label>
                <input 
                  type="text" 
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra định kỳ Chương 1..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
                  required 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Thuộc môn học / Học phần</label>
                <select 
                  value={createCourse}
                  onChange={(e) => setCreateCourse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
                >
                  <option value="Lập trình ReactJS & Next.js">Lập trình ReactJS & Next.js</option>
                  <option value="Thiết kế UI/UX Chuyên nghiệp">Thiết kế UI/UX Chuyên nghiệp</option>
                  <option value="Cơ sở dữ liệu SQL Server">Cơ sở dữ liệu SQL Server</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Thời lượng (Phút) *</label>
                  <input 
                    type="number" 
                    value={createDuration}
                    onChange={(e) => setCreateDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Trạng thái khởi tạo</label>
                  <select 
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all"
                  >
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đang mở">Đang mở luôn</option>
                    <option value="Đang đóng">Đang đóng</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMoModalTaoMoi(false)} className="px-6 py-2.5 text-sm text-slate-700 font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#0066FF] rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Tạo bài thi</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= MODAL 2: FORM THIẾT LẬP ĐỀ THI ================= */}
      {moModalThietLap && baiThiDangChon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-400 text-2xl font-normal">⚙️</span> Thiết lập cấu hình đề thi
                </h2>
                <p className="text-[13px] text-slate-500 mt-1">Mã cấu hình: <span className="font-mono font-bold text-slate-700">{baiThiDangChon.id}</span></p>
              </div>
              <button onClick={() => setMoModalThietLap(false)} className="text-slate-400 text-2xl hover:text-slate-600 transition-colors">&times;</button>
            </div>

            <form onSubmit={handleSaveThietLap} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Tên tiêu đề bài thi *</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Thời gian làm bài (Phút) *</label>
                  <input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all" min="1" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Trạng thái phát hành</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all">
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đang mở">Đang mở (Cho sinh viên thi)</option>
                    <option value="Đang đóng">Đang đóng (Khóa đề)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Thuộc học phần / Môn học</label>
                  <select value={editCourse} onChange={(e) => setEditCourse(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-900 text-sm font-medium rounded-lg focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all">
                    <option value="Lập trình ReactJS & Next.js">Lập trình ReactJS & Next.js</option>
                    <option value="Thiết kế UI/UX Chuyên nghiệp">Thiết kế UI/UX Chuyên nghiệp</option>
                    <option value="Cơ sở dữ liệu SQL Server">Cơ sở dữ liệu SQL Server</option>
                  </select>
                </div>
              </div>

              {/* Ma trận bốc câu hỏi */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    📊 Ma trận bốc câu hỏi tự động
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">Hệ thống bốc ngẫu nhiên từ Ngân hàng câu hỏi theo tỷ lệ khó dễ.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Mức DỄ</label>
                    <input type="number" value={soCauDe} onChange={(e) => setSoCauDe(Math.max(0, parseInt(e.target.value) || 0))} className="w-full px-4 py-2 border border-slate-200 bg-white text-slate-900 font-bold text-center rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all" min="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">TRUNG BÌNH</label>
                    <input type="number" value={soCauTrungBinh} onChange={(e) => setSoCauTrungBinh(Math.max(0, parseInt(e.target.value) || 0))} className="w-full px-4 py-2 border border-slate-200 bg-white text-slate-900 font-bold text-center rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all" min="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">Mức KHÓ</label>
                    <input type="number" value={soCauKho} onChange={(e) => setSoCauKho(Math.max(0, parseInt(e.target.value) || 0))} className="w-full px-4 py-2 border border-slate-200 bg-white text-slate-900 font-bold text-center rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all" min="0" />
                  </div>
                </div>
                <div className="bg-blue-50 text-[#0066FF] px-4 py-3 rounded-lg text-[13px] font-bold flex justify-between items-center mt-2">
                  <span>Tổng số lượng câu hỏi của đề:</span>
                  <span className="text-sm bg-white border border-blue-200 px-3 py-1 rounded-md shadow-sm">
                    {Number(soCauDe) + Number(soCauTrungBinh) + Number(soCauKho)} câu hỏi
                  </span>
                </div>
              </div>

              {/* Tùy chọn đảo đề */}
              <div className="flex flex-col sm:flex-row gap-6 px-1 py-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={tronCauHoi} onChange={(e) => setTronCauHoi(e.target.checked)} className="w-4 h-4 rounded text-[#0066FF] border-slate-300 focus:ring-[#0066FF]" />
                  <span className="text-[13px] font-bold text-slate-700">Tự động xáo trộn thứ tự câu hỏi</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={tronDapAn} onChange={(e) => setTronDapAn(e.target.checked)} className="w-4 h-4 rounded text-[#0066FF] border-slate-300 focus:ring-[#0066FF]" />
                  <span className="text-[13px] font-bold text-slate-700">Tự động xáo trộn đáp án</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMoModalThietLap(false)} className="px-6 py-2.5 text-sm text-slate-700 font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#0066FF] rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Cập nhật đề thi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}