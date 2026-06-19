"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Định nghĩa cấu trúc Lộ trình học tập chuẩn hệ thống LUMER (Đã bỏ instructor)
interface Program {
  id: string;
  code: string;
  title: string;
  description: string;
  modulesCount: number;
  duration: string; 
  certificateName: string; 
  status: "Đang mở" | "Bản nháp" | "Đóng";
  modulesList: string[]; 
}

export default function LumerCurriculumManagement() {
  // Dữ liệu giả lập ban đầu (Đã gỡ bỏ thông tin Giảng viên phụ trách)
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "program-1",
      code: "LMR-DATA-2026",
      title: "Chương trình chuyên sâu Phân tích Dữ liệu (Data Analytics)",
      description: "Lộ trình từ cơ bản đến nâng cao về SQL, Python, Excel và trực quan hóa dữ liệu với PowerBI.",
      modulesCount: 5,
      duration: "4 tháng (8 giờ/tuần)",
      certificateName: "LUMER Certified Data Analyst Professional",
      status: "Đang mở",
      modulesList: [
        "Module 1: Nhập môn Khoa học dữ liệu & Tư duy phân tích",
        "Module 2: Phân tích dữ liệu chuyên sâu với Microsoft Excel",
        "Module 3: Truy vấn cấu trúc dữ liệu với SQL",
        "Module 4: Trực quan hóa dữ liệu trên Dashboard với Power BI",
        "Module 5: Dự án thực tế tốt nghiệp (Capstone Project)"
      ]
    },
    {
      id: "program-2",
      code: "LMR-FRONT-2026",
      title: "Chương trình đào tạo Kỹ sư Front-End Next.js chuyên sâu",
      description: "Lộ trình làm chủ giao diện web hiện đại, tối ưu SEO với React, Next.js và Tailwind CSS.",
      modulesCount: 4,
      duration: "3 tháng (10 giờ/tuần)",
      certificateName: "LUMER Advanced Next.js Developer Certificate",
      status: "Đang mở",
      modulesList: [
        "Module 1: Bản chất Javascript nâng cao & Thao tác DOM",
        "Module 2: Xây dựng UI Component-Driven với React.js",
        "Module 3: Kiến trúc App Router & Server Component trong Next.js",
        "Module 4: Tích hợp API bảo mật và Triển khai ứng dụng (Deploy)"
      ]
    },
    {
      id: "program-3",
      code: "LMR-UXUI-2026",
      title: "Khung đào tạo Chuyên gia Thiết kế Trải nghiệm Người dùng (UI/UX)",
      description: "Học tư duy thiết kế Product chuyên nghiệp, nghiên cứu hành vi người dùng và Prototype chuyên sâu trên Figma.",
      modulesCount: 3,
      duration: "2 tháng",
      certificateName: "LUMER UI/UX Professional Design Certification",
      status: "Bản nháp",
      modulesList: [
        "Module 1: Nghiên cứu người dùng & Xây dựng Persona",
        "Module 2: Thiết kế Wireframe & Hệ thống Grid/Layout",
        "Module 3: Thiết kế UI độ phân giải cao & Làm hiệu ứng ứng dụng trên Figma"
      ]
    }
  ]);

  // States quản lý tương tác
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(programs[0]); 
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State điền thông tin (Đã loại bỏ thuộc tính instructor)
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    modulesCount: 3,
    duration: "",
    certificateName: "",
    status: "Bản nháp" as Program["status"],
    modulesListText: "" 
  });

  // Tìm kiếm lọc dữ liệu (Đã bỏ lọc theo instructor)
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [programs, searchTerm]);

  // Mở modal Thêm mới
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      code: "", title: "", description: "", modulesCount: 3, duration: "", certificateName: "", status: "Bản nháp", modulesListText: ""
    });
    setIsOpenModal(true);
  };

  // Mở modal Chỉnh sửa
  const openEditModal = (p: Program, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingId(p.id);
    setFormData({
      code: p.code,
      title: p.title,
      description: p.description,
      modulesCount: p.modulesCount,
      duration: p.duration,
      certificateName: p.certificateName,
      status: p.status,
      modulesListText: p.modulesList.join("\n")
    });
    setIsOpenModal(true);
  };

  // Xóa lộ trình
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa chương trình đào tạo này không?")) {
      const updated = programs.filter(p => p.id !== id);
      setPrograms(updated);
      if (selectedProgram?.id === id) {
        setSelectedProgram(updated[0] || null);
      }
    }
  };

  // Submit Form dữ liệu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      alert("Vui lòng điền đầy đủ Mã và Tên chương trình đào tạo!");
      return;
    }

    const standardModulesList = formData.modulesListText
      .split("\n")
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const finalData: Omit<Program, "id"> = {
      code: formData.code,
      title: formData.title,
      description: formData.description,
      modulesCount: standardModulesList.length || formData.modulesCount,
      duration: formData.duration || "Tự chọn thời gian",
      certificateName: formData.certificateName || "Chứng nhận hoàn thành LUMER",
      status: formData.status,
      modulesList: standardModulesList.length ? standardModulesList : ["Chưa phân tách module con"]
    };

    if (editingId) {
      const updated = programs.map(p => p.id === editingId ? { ...p, ...finalData } : p);
      setPrograms(updated);
      setSelectedProgram(updated.find(p => p.id === editingId) || null);
    } else {
      const newProg: Program = { id: `program-${Date.now()}`, ...finalData };
      setPrograms([newProg, ...programs]);
      setSelectedProgram(newProg);
    }

    setIsOpenModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Header Điều Hướng */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-8 pb-2">
        <Link 
          href="/faculty"
          className="text-xs text-[#0066FF] font-bold hover:underline mb-3 inline-flex items-center gap-1 no-underline"
        >
          ⬅ Quay về Dashboard Phòng Đào Tạo
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-1">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              🎓 Quản lý Chương trình đào tạo
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Thiết kế cấu trúc lộ trình học và phân tách các mô-đun bài học hệ thống.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-xs"
          >
            ➕ Tạo chương trình đào tạo mới
          </button>
        </div>

        {/* Thanh Tìm Kiếm */}
        <div className="mt-5 max-w-sm">
          <input
            type="text"
            placeholder="Tìm theo tên chương trình hoặc mã danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-blue-500 shadow-3xs"
          />
        </div>
      </div>

      {/* Thân trang: Chia hai khu vực */}
      <div className="max-w-7xl w-full mx-auto px-6 pb-12 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BÊN TRÁI: DANH SÁCH CÁC THẺ LỘ TRÌNH */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Danh sách chương trình khung ({filteredPrograms.length})</div>
          
          {filteredPrograms.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProgram(p)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between bg-white ${
                selectedProgram?.id === p.id 
                  ? "border-[#0066FF] ring-2 ring-blue-500/10 shadow-sm" 
                  : "border-gray-100 hover:border-gray-300 shadow-3xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 text-gray-600 rounded">
                    {p.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    p.status === "Đang mở" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  {p.title}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Chân Thẻ */}
              <div className="border-t border-gray-50 pt-3 mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <span>📚 <b>{p.modulesCount}</b> mô-đun thành phần</span>
                  <span>⏱ {p.duration}</span>
                </div>
                <div className="space-x-3 text-xs font-bold">
                  <button onClick={(e) => openEditModal(p, e)} className="text-[#0066FF] hover:underline cursor-pointer bg-transparent border-none p-0">Thiết lập</button>
                  <button onClick={(e) => handleDelete(p.id, e)} className="text-red-500 hover:underline cursor-pointer bg-transparent border-none p-0">Xóa</button>
                </div>
              </div>
            </div>
          ))}

          {filteredPrograms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">Không tìm thấy chương trình đào tạo nào.</div>
          )}
        </div>

        {/* BÊN PHẢI: CHI TIẾT SƠ ĐỒ PHÂN RÃ HỌC PHẦN */}
        <div className="lg:col-span-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sơ đồ phân rã học phần</div>
          
          {selectedProgram ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs sticky top-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đang xem cấu trúc:</h4>
              <h2 className="text-sm font-black text-gray-900 mb-4 leading-snug">{selectedProgram.title}</h2>

              {/* Timeline Modules */}
              <div className="space-y-3.5 relative border-l-2 border-slate-100 ml-2 pl-4">
                {selectedProgram.modulesList.map((mod, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-[#0066FF] border-2 border-white shadow-xs"></div>
                    <div className="text-xs font-semibold text-gray-700 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      {mod}
                    </div>
                  </div>
                ))}
              </div>

              {/* Khối chứng chỉ */}
              <div className="mt-6 pt-4 border-t border-gray-100 bg-blue-50/30 p-3.5 rounded-xl border border-blue-100/30">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">🏅 Chứng nhận cấp phát điện tử</div>
                <div className="text-xs font-bold text-gray-800 leading-tight">
                  {selectedProgram.certificateName}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-xs text-gray-400">Vui lòng chọn một chương trình đào tạo ở danh sách kế bên để xem phân rã.</div>
          )}
        </div>
      </div>

      {/* MODAL POPUP CẤU HÌNH: THÊM / SỬA (Đã xóa bỏ hoàn toàn trường chọn Giảng viên) */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-gray-900 mb-4">
              {editingId ? "Cập nhật cấu trúc chương trình" : "Thiết kế chương trình đào tạo mới"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Mã định danh</label>
                  <input type="text" placeholder="LMR-CNTT" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500 font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Tên chương trình đào tạo</label>
                  <input type="text" placeholder="Ví dụ: Lập trình di động chuyên sâu" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Mô tả tóm tắt lộ trình học</label>
                <textarea rows={2} placeholder="Tóm lược mục tiêu đầu ra của người học..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Thời lượng hoàn thành</label>
                  <input type="text" placeholder="Ví dụ: 3 tháng (6h/tuần)" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500" />
                </div>
                <div>
                  <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Trạng thái phát hành</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as Program["status"]})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500 bg-white">
                    <option value="Đang mở">Đang mở (Public)</option>
                    <option value="Bản nháp">Bản nháp (Internal)</option>
                    <option value="Đóng">Tạm đóng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Tên chứng chỉ cấp phát khi học xong</label>
                <input type="text" placeholder="Ví dụ: LUMER Certified Mobile Developer" value={formData.certificateName} onChange={(e) => setFormData({...formData, certificateName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-gray-500 uppercase text-[9px]">Danh sách cấu trúc mô-đun bài học</label>
                  <span className="text-[10px] text-gray-400 italic">Mỗi mô-đun nhập 1 dòng riêng</span>
                </div>
                <textarea
                  rows={4}
                  placeholder={"Mô-đun 1: Thiết kế giao diện cơ bản\nMô-đun 2: Làm việc với API kết nối hệ thống\nMô-đun 3: Đồ án thực tập thực tế"}
                  value={formData.modulesListText}
                  onChange={(e) => setFormData({...formData, modulesListText: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-blue-500 font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsOpenModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer border-none">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#0066FF] hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer border-none">
                  {editingId ? "Cập nhật dữ liệu" : "Xác nhận tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}