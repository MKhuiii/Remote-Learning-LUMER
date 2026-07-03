"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface DapAnTracNghiem {
  id: string; 
  noiDung: string;
}

interface CauHoi {
  id: string;
  noiDung: string;
  loaiCauHoi: "Trắc nghiệm" | "Tự luận";
  mucDo: "Dễ" | "Trung bình" | "Khó";
  chuDe: string[]; 
  cacDapAn?: DapAnTracNghiem[];
  dapAnDungId?: string; 
  huongDanTuLuan?: string;
  ngayTao: string;
}

export default function NganHangCauHoi() {
  const router = useRouter();

  // Dữ liệu mẫu khởi tạo (Fake nhiều câu chút để test phân trang)
  const [danhSachCauHoi, setDanhSachCauHoi] = useState<CauHoi[]>([
    {
      id: "CH-001",
      noiDung: "React Component Lifecycle gồm những giai đoạn chính nào?",
      loaiCauHoi: "Trắc nghiệm",
      mucDo: "Trung bình",
      chuDe: ["Component", "Lifecycle", "React Core"],
      cacDapAn: [
        { id: "A", noiDung: "Mounting, Updating, Unmounting" },
        { id: "B", noiDung: "Render, Fetching, State" },
        { id: "C", noiDung: "Props, Context, Redux" }
      ],
      dapAnDungId: "A",
      ngayTao: "12/05/2026",
    },
    {
      id: "CH-002",
      noiDung: "Phân biệt sự khác nhau giữa getServerSideProps và getStaticProps trong Next.js.",
      loaiCauHoi: "Tự luận",
      mucDo: "Khó",
      chuDe: ["Next.js", "SSR", "SSG", "Performance"],
      huongDanTuLuan: "Yêu cầu nêu rõ: getServerSideProps chạy mỗi khi có request (SSR), còn getStaticProps chạy lúc build time (SSG).",
      ngayTao: "18/05/2026",
    },
    // Fake thêm data câu hỏi cho đủ trên 10 câu để test tính năng phân trang
    ...Array.from({ length: 12 }).map((_, i) => ({
      id: `CH-00${i + 3}`,
      noiDung: `Câu hỏi mẫu tự động số ${i + i + 3} về kiến thức nâng cao Frontend Dev?`,
      loaiCauHoi: (i % 2 === 0 ? "Trắc nghiệm" : "Tự luận") as "Trắc nghiệm" | "Tự luận",
      mucDo: (i % 3 === 0 ? "Dễ" : i % 3 === 1 ? "Trung bình" : "Khó") as "Dễ" | "Trung bình" | "Khó",
      chuDe: ["React Core", "Hooks"],
      ngayTao: "20/05/2026",
      cacDapAn: [
        { id: "A", noiDung: "Đáp án đúng giả định" },
        { id: "B", noiDung: "Đáp án sai phương án nhiễu" }
      ],
      dapAnDungId: "A"
    }))
  ]);

  // Bộ lọc ngoài danh sách
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [loaiDaChon, setLoaiDaChon] = useState("Tất cả loại");
  const [mucDoDaChon, setMucDoDaChon] = useState("Tất cả mức độ");
  const [chuDeDaChon, setChuDeDaChon] = useState("Tất cả chủ đề");

  // --- STATE QUẢN LÝ PHÂN TRANG (PAGINATION) ---
  const [trangHienTai, setTrangHienTai] = useState(1);
  const soCauTrenTrang = 10;

  // States quản lý Form Modal
  const [moModal, setMoModal] = useState(false);
  const [formNoiDung, setFormNoiDung] = useState("");
  const [formLoai, setFormLoai] = useState<"Trắc nghiệm" | "Tự luận">("Trắc nghiệm");
  const [formMucDo, setFormMucDo] = useState<"Dễ" | "Trung bình" | "Khó">("Dễ");
  
  // State quản lý mảng chủ đề dạng Tag trong form
  const [formMangChuDe, setFormMangChuDe] = useState<string[]>([]);
  const [oNhapChuDeTam, setONhapChuDeTam] = useState("");
  
  // State đáp án trắc nghiệm
  const [formDapAnList, setFormDapAnList] = useState<DapAnTracNghiem[]>([
    { id: "A", noiDung: "" }, { id: "B", noiDung: "" }, { id: "C", noiDung: "" }, { id: "D", noiDung: "" },
  ]);
  const [formDapAnDungId, setFormDapAnDungId] = useState("A");
  const [formHuongDanTuLuan, setFormHuongDanTuLuan] = useState("");

  // --- LOGIC TÍNH TOÁN THỐNG KÊ BIẾN ĐỘNG ---
  const tongSoCau = danhSachCauHoi.length;
  const soCauTracNghiem = danhSachCauHoi.filter(c => c.loaiCauHoi === "Trắc nghiệm").length;
  const soCauTuLuan = danhSachCauHoi.filter(c => c.loaiCauHoi === "Tự luận").length;
  
  const danhSachTatCaChuDe = danhSachCauHoi.reduce<string[]>((acc, curr) => {
    curr.chuDe.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, []);
  const tongSoChuDe = danhSachTatCaChuDe.length;

  // Reset về trang 1 khi người dùng đổi bộ lọc
  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoaTimKiem, loaiDaChon, mucDoDaChon, chuDeDaChon]);

  // --- XỬ LÝ LỌC DỮ LIỆU ---
  const ketQuaLoc = danhSachCauHoi.filter((ch) => {
    const tuKhoa = tuKhoaTimKiem.toLowerCase();
    const timTrongNoiDung = ch.noiDung.toLowerCase().includes(tuKhoa) || ch.id.toLowerCase().includes(tuKhoa);
    const timTrongChuDe = ch.chuDe.some(tag => tag.toLowerCase().includes(tuKhoa));
    const locLoai = loaiDaChon === "Tất cả loại" || ch.loaiCauHoi === loaiDaChon;
    const locMucDo = mucDoDaChon === "Tất cả mức độ" || ch.mucDo === mucDoDaChon;
    const locChuDe = chuDeDaChon === "Tất cả chủ đề" || ch.chuDe.includes(chuDeDaChon);
    
    return (timTrongNoiDung || timTrongChuDe) && locLoai && locMucDo && locChuDe;
  });

  // --- TÍNH TOÁN DỮ LIỆU CHIA TRANG ---
  const tongSoTrang = Math.ceil(ketQuaLoc.length / soCauTrenTrang) || 1;
  const viTriDau = (trangHienTai - 1) * soCauTrenTrang;
  const viTriCuoi = viTriDau + soCauTrenTrang;
  const duLieuTrangHienTai = ketQuaLoc.slice(viTriDau, viTriCuoi);

  // Xử lý tạo Tag
  const handleKeyDownChuDe = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tagClean = oNhapChuDeTam.replace(/,/g, "").trim();
      if (tagClean && !formMangChuDe.includes(tagClean)) {
        setFormMangChuDe([...formMangChuDe, tagClean]);
      }
      setONhapChuDeTam("");
    }
  };

  const handleThayDoiNoiDungDapAn = (id: string, value: string) => {
    setFormDapAnList(formDapAnList.map(item => item.id === id ? { ...item, noiDung: value } : item));
  };

  const handleThemOODapAn = () => {
    const kyTuTiepTheo = String.fromCharCode(65 + formDapAnList.length);
    setFormDapAnList([...formDapAnList, { id: kyTuTiepTheo, noiDung: "" }]);
  };

  const handleXoaODapAn = (id: string) => {
    if (formDapAnList.length <= 2) return alert("Câu hỏi trắc nghiệm cần tối thiểu 2 đáp án lựa chọn!");
    const listMoi = formDapAnList.filter(item => item.id !== id).map((item, index) => ({
      id: String.fromCharCode(65 + index),
      noiDung: item.noiDung
    }));
    setFormDapAnList(listMoi);
    if (formDapAnDungId === id) setFormDapAnDungId("A");
  };

  const handleLuuCauHoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNoiDung.trim()) return alert("Vui lòng nhập nội dung câu hỏi!");

    const cauHoiMoi: CauHoi = {
      id: `CH-00${danhSachCauHoi.length + 1}`,
      noiDung: formNoiDung,
      loaiCauHoi: formLoai,
      mucDo: formMucDo,
      chuDe: formMangChuDe.length > 0 ? formMangChuDe : ["Chung"],
      ngayTao: new Date().toLocaleDateString("vi-VN"),
      ...(formLoai === "Trắc nghiệm" ? {
        cacDapAn: formDapAnList.filter(d => d.noiDung.trim() !== ""),
        dapAnDungId: formDapAnDungId
      } : {
        huongDanTuLuan: formHuongDanTuLuan
      })
    };

    setDanhSachCauHoi([cauHoiMoi, ...danhSachCauHoi]);
    
    setFormNoiDung("");
    setFormMangChuDe([]);
    setONhapChuDeTam("");
    setFormDapAnList([{ id: "A", noiDung: "" }, { id: "B", noiDung: "" }, { id: "C", noiDung: "" }, { id: "D", noiDung: "" }]);
    setFormDapAnDungId("A");
    setFormHuongDanTuLuan("");
    setMoModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Header Banner Xanh Dương */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          
          {/* Nút thoát về trang Quản lý Giảng viên */}
          <button 
            onClick={() => router.push('/instructor-management')}
            className="mb-6 flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl transition duration-200 backdrop-blur-sm w-fit"
          >
            <span>&larr;</span> Quay lại Quản lý Giảng viên
          </button>

          <div>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Ngân hàng câu hỏi</span>
            <h1 className="text-4xl font-extrabold mt-2">Ngân hàng câu hỏi dùng chung</h1>
            <p className="text-blue-100 text-sm mt-1.5 opacity-90">Môn học: Lập trình ReactJS & Next.js</p>
          </div>
        </div>
      </section>

      {/* Khối Thống kê đè ranh giới đúng UI LUMER */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white py-6 px-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-[#0066FF]">{tongSoCau}</span>
            <span className="text-xs font-medium text-slate-500 mt-1.5">Tổng bộ câu hỏi</span>
          </div>
          <div className="bg-white py-6 px-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-blue-500">{soCauTracNghiem}</span>
            <span className="text-xs font-medium text-slate-500 mt-1.5">Câu trắc nghiệm</span>
          </div>
          <div className="bg-white py-6 px-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-amber-500">{soCauTuLuan}</span>
            <span className="text-xs font-medium text-slate-500 mt-1.5">Câu tự luận</span>
          </div>
          <div className="bg-white py-6 px-4 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-emerald-500">{tongSoChuDe}</span>
            <span className="text-xs font-medium text-slate-500 mt-1.5">Chủ đề (Tags)</span>
          </div>
        </div>
      </section>

      {/* Tiêu đề điều khiển */}
      <section className="max-w-7xl mx-auto px-6 mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh sách câu hỏi nội bộ</h2>
          <p className="text-xs text-slate-500 mt-0.5">Hiển thị tối đa 10 câu hỏi trên mỗi trang quản lý</p>
        </div>
        
        <button onClick={() => setMoModal(true)} className="bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition duration-150 whitespace-nowrap">
          + Thêm câu hỏi mới
        </button>
      </section>

      {/* Bảng Danh sách & Bộ lọc dữ liệu */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Thanh lọc tìm kiếm */}
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <input
              type="text"
              value={tuKhoaTimKiem}
              onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              placeholder="Tìm kiếm nhanh theo nội dung hoặc hashtag..."
              className="w-full lg:w-80 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#0066FF]"
            />
            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
              <select value={chuDeDaChon} onChange={(e) => setChuDeDaChon(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 font-medium focus:outline-none">
                <option value="Tất cả chủ đề">Tất cả chủ đề</option>
                {danhSachTatCaChuDe.map((tag) => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>

              <select value={loaiDaChon} onChange={(e) => setLoaiDaChon(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 font-medium focus:outline-none">
                <option value="Tất cả loại">Tất cả loại hình</option>
                <option value="Trắc nghiệm">Trắc nghiệm</option>
                <option value="Tự luận">Tự luận</option>
              </select>

              <select value={mucDoDaChon} onChange={(e) => setMucDoDaChon(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 font-medium focus:outline-none">
                <option value="Tất cả mức độ">Tất cả mức độ</option>
                <option value="Dễ">Dễ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khó">Khó</option>
              </select>
            </div>
          </div>

          {/* Vùng hiển thị kết quả (Chỉ render duLieuTrangHienTai) */}
          <div className="divide-y divide-slate-100">
            {duLieuTrangHienTai.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc đã chọn.
              </div>
            ) : (
              duLieuTrangHienTai.map((ch, index) => (
                <div key={ch.id} className="p-6 hover:bg-slate-50/40 transition space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{ch.id}</span>
                    <span className="text-xs font-bold bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded">{ch.loaiCauHoi}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${ch.mucDo === "Dễ" ? "bg-emerald-50 text-emerald-700" : ch.mucDo === "Trung bình" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>Mức độ: {ch.mucDo}</span>
                    
                    <div className="flex flex-wrap gap-1 items-center ml-2">
                      {ch.chuDe.map((tag, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs text-slate-400 font-medium ml-auto">Ngày tạo: {ch.ngayTao}</span>
                  </div>
                  
                  {/* Số thứ tự tính tiến theo trang: viTriDau + index + 1 */}
                  <p className="text-base font-bold text-slate-900">Câu {viTriDau + index + 1}: {ch.noiDung}</p>
                  
                  {ch.loaiCauHoi === "Trắc nghiệm" && ch.cacDapAn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 text-sm text-slate-800 max-w-4xl">
                      {ch.cacDapAn.map(d => (
                        <p key={d.id} className={ch.dapAnDungId === d.id ? "text-emerald-600 font-bold bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100" : "font-medium py-1 px-2"}>
                          {d.id}. {d.noiDung} {ch.dapAnDungId === d.id && "✓"}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {ch.loaiCauHoi === "Tự luận" && ch.huongDanTuLuan && (
                    <div className="pl-4 text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border-l-4 border-slate-400 max-w-4xl">
                      <span className="font-bold text-slate-900">Hướng dẫn chấm:</span> {ch.huongDanTuLuan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ================= KHỐI PHÂN TRANG (PAGINATION) TIẾNG VIỆT ================= */}
          {ketQuaLoc.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between flex-col sm:flex-row gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Hiển thị từ <span className="text-slate-900">{viTriDau + 1}</span> đến <span className="text-slate-900">{Math.min(viTriCuoi, ketQuaLoc.length)}</span> trong tổng số <span className="text-[#0066FF]">{ketQuaLoc.length}</span> câu hỏi
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={trangHienTai === 1}
                  onClick={() => setTrangHienTai(prev => prev - 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  ◀ Trang trước
                </button>

                <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800">
                  <span>Trang</span>
                  <span className="text-[#0066FF] font-extrabold">{trangHienTai}</span>
                  <span>/</span>
                  <span>{tongSoTrang}</span>
                </div>

                <button
                  type="button"
                  disabled={trangHienTai === tongSoTrang}
                  onClick={() => setTrangHienTai(prev => prev + 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  Trang sau ▶
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* FORM MODAL THÊM CÂU HỎI MỚI */}
      {moModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto pt-6 pb-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 mx-4 max-h-[95vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-slate-900">📝 Thêm câu hỏi mới</h2>
              <button onClick={() => setMoModal(false)} className="text-slate-400 text-2xl hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleLuuCauHoi} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Nội dung câu hỏi *</label>
                <textarea rows={3} value={formNoiDung} onChange={(e) => setFormNoiDung(e.target.value)} placeholder="Nhập câu hỏi tại đây..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-blue-500" required />
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hình thức thi</label>
                    <select value={formLoai} onChange={(e) => setFormLoai(e.target.value as any)} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold focus:outline-none">
                      <option value="Trắc nghiệm">Trắc nghiệm</option>
                      <option value="Tự luận">Tự luận</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ khó</label>
                    <select value={formMucDo} onChange={(e) => setFormMucDo(e.target.value as any)} className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-bold focus:outline-none">
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Khó">Khó</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề câu hỏi (Nhấn Enter hoặc gõ dấu phẩy để tạo Tag)</label>
                  <div className="min-h-[42px] p-1.5 border border-slate-300 bg-white rounded-lg flex flex-wrap gap-1.5 items-center focus-within:border-[#0066FF] focus-within:ring-1 focus-within:ring-blue-500 transition">
                    {formMangChuDe.map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-blue-50 text-[#0066FF] text-xs font-semibold pl-2 pr-1.5 py-0.5 rounded-md border border-blue-100">
                        {tag}
                        <button type="button" onClick={() => setFormMangChuDe(formMangChuDe.filter(t => t !== tag))} className="hover:bg-blue-200/60 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">&times;</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={oNhapChuDeTam}
                      onChange={(e) => setONhapChuDeTam(e.target.value)}
                      onKeyDown={handleKeyDownChuDe}
                      placeholder={formMangChuDe.length === 0 ? "Gõ chủ đề rồi ấn Enter..." : ""} 
                      className="flex-1 min-w-[120px] text-xs text-slate-900 font-medium bg-transparent outline-none border-none py-0.5 px-1"
                    />
                  </div>
                </div>
              </div>

              {formLoai === "Trắc nghiệm" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-[#0066FF]">Thiết lập đáp án & chọn câu đúng:</p>
                    <button type="button" onClick={handleThemOODapAn} className="text-xs font-bold text-[#0066FF] hover:underline">
                      + Thêm phương án lựa chọn
                    </button>
                  </div>
                  
                  <div className="space-y-2.5">
                    {formDapAnList.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl hover:border-slate-300 transition">
                        <input 
                          type="radio" 
                          name="dapAnDungGroup" 
                          checked={formDapAnDungId === item.id} 
                          onChange={() => setFormDapAnDungId(item.id)} 
                          className="w-4 h-4 text-[#0066FF] cursor-pointer"
                        />
                        <span className="font-bold text-slate-900 text-sm">{item.id}.</span>
                        <input 
                          type="text" 
                          value={item.noiDung} 
                          onChange={(e) => handleThayDoiNoiDungDapAn(item.id, e.target.value)} 
                          placeholder={`Nhập nội dung lựa chọn ${item.id}`} 
                          className="flex-1 px-3 py-1 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-[#0066FF]" 
                          required={formLoai === "Trắc nghiệm"} 
                        />
                        <button type="button" onClick={() => handleXoaODapAn(item.id)} className="text-slate-400 hover:text-rose-600 font-bold px-1 text-sm">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formLoai === "Tự luận" && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                  <label className="block text-sm font-bold text-amber-900 mb-1">Hướng dẫn chấm bài (Đáp án mở)</label>
                  <textarea rows={3} value={formHuongDanTuLuan} onChange={(e) => setFormHuongDanTuLuan(e.target.value)} placeholder="Nhập các ý chính cần có trong câu trả lời để làm căn cứ chấm điểm..." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 font-medium focus:outline-none focus:border-amber-600" required={formLoai === "Tự luận"} />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setMoModal(false)} className="px-4 py-2 text-sm text-slate-700 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition">Hủy</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-[#0066FF] rounded-xl hover:bg-blue-700 shadow-md transition">Lưu vào kho chung</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}