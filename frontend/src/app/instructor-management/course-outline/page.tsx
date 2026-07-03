"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// --- ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU CHUẨN ENTERPRISE ---
interface BaiHocPhan {
  id: string;
  tenPhan: string;
  loaiNoiDung: "Video bài giảng" | "Tài liệu đọc" | "Bài kiểm tra (Quiz)" | "Bài tập thực hành";
  thoiLuongPhut: number;
}

interface ChuongModule {
  id: string;
  tenModule: string;
  moTaNgan: string;
  danhSachPhan: BaiHocPhan[];
}

interface DeCuongHocPhan {
  maMonHoc: string;
  tenMonHoc: string;
  nguoiBienSoan: string;
  ngayPhanCong: string;
  trangThai: "Chưa biên soạn" | "Đang chỉnh sửa" | "Chờ phê duyệt" | "Đã xuất bản";
  chuanDauRa: string[];
  danhSachModule: ChuongModule[];
}

// --- HÀM MOCK DATA TỰ ĐỘNG GENERATE 100 MÔN HỌC KIỂM THỬ TẢI UI ---
const generate100MonHoc = (): DeCuongHocPhan[] => {
  const cacNganh = ["Frontend Developer", "Backend Architecture", "DevOps Engineer", "Data Science & AI", "UI/UX Product Design", "Mobile Flutter Apps"];
  const cacTrangThai: DeCuongHocPhan["trangThai"][] = ["Chưa biên soạn", "Đang chỉnh sửa", "Chờ phê duyệt", "Đã xuất bản"];
  
  return Array.from({ length: 100 }, (_, index) => {
    const stt = index + 1;
    const nganh = cacNganh[stt % cacNganh.length];
    const trangThai = cacTrangThai[stt % cacTrangThai.length];
    
    return {
      maMonHoc: `LMR-${nganh.split(" ").map(w => w[0]).join("").toUpperCase()}${100 + stt}`,
      tenMonHoc: `[Khóa ${stt}] Kỹ thuật phát triển và tối ưu hóa hệ thống ${nganh} cấp độ doanh nghiệp`,
      nguoiBienSoan: "Giảng viên LUMER",
      ngayPhanCong: `${String((stt % 28) + 1).padStart(2, '0')}/05/2026`,
      trangThai: trangThai,
      chuanDauRa: [
        "Làm chủ kiến thức thực chiến ứng dụng sâu tại doanh nghiệp.",
        "Hoàn thành đồ án sản phẩm đạt tiêu chuẩn kiểm định đầu ra."
      ],
      danhSachModule: trangThai === "Chưa biên soạn" ? [] : [
        {
          id: `MD-${stt}-1`,
          tenModule: "Chương 1: Khởi động dự án & Thiết lập môi trường Base",
          moTaNgan: "Kiểm tra kỹ năng nền tảng và chuẩn bị boilerplate dự án.",
          danhSachPhan: [
            { id: `P-${stt}-11`, tenPhan: "Tổng quan sơ đồ luồng dữ liệu", loaiNoiDung: "Video bài giảng", thoiLuongPhut: 15 },
            { id: `P-${stt}-12`, tenPhan: "Đọc tài liệu quy chuẩn đặt tên cấu trúc", loaiNoiDung: "Tài liệu đọc", thoiLuongPhut: 20 },
            { id: `P-${stt}-13`, tenPhan: "Bài thực hành thiết lập Git Branching chiến lược", loaiNoiDung: "Bài tập thực hành", thoiLuongPhut: 45 },
          ]
        },
        {
          id: `MD-${stt}-2`,
          tenModule: "Chương 2: Thiết kế Interface & Logic luồng nghiệp vụ chính",
          moTaNgan: "Xử lý Core Logic và kết nối State Store.",
          danhSachPhan: [
            { id: `P-${stt}-21`, tenPhan: "Xây dựng các tầng Service cô lập", loaiNoiDung: "Video bài giảng", thoiLuongPhut: 30 }
          ]
        }
      ]
    };
  });
};

export default function QuanLyDeCuongLumer() {
  const router = useRouter();

  // Kho dữ liệu tổng 100 học phần của Giảng viên
  const [danhSachDeCuong, setDanhSachDeCuong] = useState<DeCuongHocPhan[]>(generate100MonHoc());
  
  // State điều hướng View: null = Giao diện tổng danh sách Card; "MÃ_MÔN" = Vào giao diện biên soạn chi tiết
  const [dangChonMaMon, setDangChonMaMon] = useState<string | null>(null);

  // --- CONTROL STATE (TÌM KIẾM, BỘ LỌC, PHÂN TRANG) ---
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [tabTrangThai, setTabTrangThai] = useState<string>("Tất cả");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const soMonTrenMoiTrang = 6; // Giới hạn số lượng Card chống lag và tràn UI

  // --- CHỨC NĂNG LỌC DỮ LIỆU ĐỘNG (DÙNG USEMEMO TỐI ƯU TỐC ĐỘ SÀNG LỌC) ---
  const danhSachDaLoc = useMemo(() => {
    return danhSachDeCuong.filter((mon) => {
      const matchTimKiem = mon.tenMonHoc.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) || 
                           mon.maMonHoc.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
      const matchTab = tabTrangThai === "Tất cả" || mon.trangThai === tabTrangThai;
      return matchTimKiem && matchTab;
    });
  }, [danhSachDeCuong, tuKhoaTimKiem, tabTrangThai]);

  // Cắt mảng dữ liệu phục vụ phân trang số
  const tongSoTrang = Math.ceil(danhSachDaLoc.length / soMonTrenMoiTrang) || 1;
  const danhSachHienThiPhanTrang = useMemo(() => {
    const viTriBatDau = (trangHienTai - 1) * soMonTrenMoiTrang;
    return danhSachDaLoc.slice(viTriBatDau, viTriBatDau + soMonTrenMoiTrang);
  }, [danhSachDaLoc, trangHienTai]);

  // Reset trang về đầu khi thay đổi từ khóa hoặc đổi tab trạng thái
  const handleThayDoiTab = (tab: string) => {
    setTabTrangThai(tab);
    setTrangHienTai(1);
  };

  const handleThayDoiTimKiem = (val: string) => {
    setTuKhoaTimKiem(val);
    setTrangHienTai(1);
  };

  // Đối tượng môn học đang active được chọn để xem/soạn đề cương
  const deCuongHienTai = danhSachDeCuong.find(item => item.maMonHoc === dangChonMaMon);

  // --- CÁC HÀM XỬ LÝ SỬA ĐỀ CƯƠNG CHI TIẾT ---
  const [moModalModule, setMoModalModule] = useState(false);
  const [formTenModule, setFormTenModule] = useState("");
  const [formMoTaModule, setFormMoTaModule] = useState("");

  const [moModalPhan, setMoModalPhan] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState("");
  const [formTenPhan, setFormTenPhan] = useState("");
  const [formLoaiNoiDung, setFormLoaiNoiDung] = useState<BaiHocPhan["loaiNoiDung"]>("Video bài giảng");
  const [formThoiLuong, setFormThoiLuong] = useState(15);

  const handleThemModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTenModule.trim() || !dangChonMaMon) return;

    const moduleMoi: ChuongModule = {
      id: `MD-${Date.now()}`,
      tenModule: formTenModule,
      moTaNgan: formMoTaModule,
      danhSachPhan: []
    };

    setDanhSachDeCuong(danhSachDeCuong.map(dc => 
      dc.maMonHoc === dangChonMaMon 
        ? { ...dc, trangThai: "Đang chỉnh sửa", danhSachModule: [...dc.danhSachModule, moduleMoi] } 
        : dc
    ));
    setFormTenModule(""); setFormMoTaModule(""); setMoModalModule(false);
  };

  const handleThemPhanHoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTenPhan.trim() || !dangChonMaMon) return;

    setDanhSachDeCuong(danhSachDeCuong.map(dc => {
      if (dc.maMonHoc === dangChonMaMon) {
        const modulesCapNhat = dc.danhSachModule.map(m => {
          if (m.id === targetModuleId) {
            const phanMoi: BaiHocPhan = {
              id: `P-${Date.now()}`,
              tenPhan: formTenPhan,
              loaiNoiDung: formLoaiNoiDung,
              thoiLuongPhut: Number(formThoiLuong)
            };
            return { ...m, danhSachPhan: [...m.danhSachPhan, phanMoi] };
          }
          return m;
        });
        return { ...dc, danhSachModule: modulesCapNhat };
      }
      return dc;
    }));

    setFormTenPhan(""); setMoModalPhan(false);
  };

  const handleXoaPhanHoc = (moduleId: string, phanId: string) => {
    setDanhSachDeCuong(danhSachDeCuong.map(dc => {
      if (dc.maMonHoc === dangChonMaMon) {
        return {
          ...dc,
          danhSachModule: dc.danhSachModule.map(m => 
            m.id === moduleId ? { ...m, danhSachPhan: m.danhSachPhan.filter(p => p.id !== phanId) } : m
          )
        };
      }
      return dc;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 antialiased font-sans">
      
      {/* ================= HEADER BANNER CHUẨN ĐỒNG BỘ UI LUMER ================= */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white pb-24">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          
          <button 
            onClick={() => dangChonMaMon ? setDangChonMaMon(null) : router.push('/instructor-profile')}
            className="mb-6 flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl transition duration-200 backdrop-blur-sm"
          >
            &larr; {dangChonMaMon ? "Trở lại Danh sách Đề cương" : "Về Tường Nhà Giảng Viên LUMER"}
          </button>

          {!deCuongHienTai ? (
            <div>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">LUMER Syllabus Dashboard</span>
              <h1 className="text-4xl font-black mt-2 tracking-tight">Hệ Thống Biên Soạn Đề Cương</h1>
              <p className="text-blue-50 text-sm mt-1 opacity-90">Nơi quản lý phân rã cấu trúc bài giảng, phân phối tài liệu và kiểm soát chuẩn đầu ra.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Không gian làm việc riêng</span>
                <h1 className="text-3xl font-black mt-1.5 tracking-tight">{deCuongHienTai.tenMonHoc}</h1>
                <p className="text-blue-100 text-xs mt-1.5 font-medium">
                  Mã học phần: <span className="font-mono bg-black/20 px-2 py-0.5 rounded font-bold">{deCuongHienTai.maMonHoc}</span> 
                  {" "}| Phân công: {deCuongHienTai.ngayPhanCong}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-blue-100 opacity-80 uppercase tracking-wider font-bold">Trạng thái</p>
                  <p className="text-sm font-black text-white">{deCuongHienTai.trangThai}</p>
                </div>
                <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= VIEW CHẾ ĐỘ 1: KHO DANH SÁCH 100+ MÔN HỌC (CÓ TÌM KIẾM & PHÂN TRÀNG) ================= */}
      {!deCuongHienTai ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* TOOLBAR TÌM KIẾM & PHÂN TÁP PHÒNG CHỐNG NGẬP DỮ LIỆU */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
              <input 
                type="text"
                value={tuKhoaTimKiem}
                onChange={(e) => handleThayDoiTimKiem(e.target.value)}
                placeholder="Tìm kiếm nhanh theo tên hoặc mã môn học của bạn..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
              {["Tất cả", "Chưa biên soạn", "Đang chỉnh sửa", "Chờ phê duyệt", "Đã xuất bản"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleThayDoiTab(tab)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    tabTrangThai === tab ? "bg-white text-[#0066FF] shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Đếm số lượng kết quả tìm thấy */}
          <div className="mb-4 text-xs font-bold text-slate-500 flex justify-between items-center bg-slate-200/50 p-2.5 rounded-xl border">
            <span>📊 Kết quả lọc hệ thống: <strong className="text-slate-800">{danhSachDaLoc.length}</strong> học phần phù hợp.</span>
            <span>Hiển thị trang {trangHienTai} / {tongSoTrang}</span>
          </div>

          {/* Render Card Grid */}
          {danhSachHienThiPhanTrang.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 font-medium shadow-inner">
              Không tìm thấy học phần nào khớp với điều kiện lọc hiện tại của giảng viên.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {danhSachHienThiPhanTrang.map((mon) => {
                const sModule = mon.danhSachModule.length;
                const sBaiHoc = mon.danhSachModule.reduce((a, c) => a + c.danhSachPhan.length, 0);
                
                return (
                  <div key={mon.maMonHoc} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-mono font-bold uppercase">{mon.maMonHoc}</span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          mon.trangThai === "Đã xuất bản" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          mon.trangThai === "Chờ phê duyệt" ? "bg-purple-50 text-purple-600 border-purple-200" :
                          mon.trangThai === "Chưa biên soạn" ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}>{mon.trangThai}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066FF] transition line-clamp-2 min-h-[40px] leading-snug">{mon.tenMonHoc}</h3>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">Giao biên soạn: {mon.ngayPhanCong}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Khung chương</p>
                          <p className="text-xs font-black text-slate-700">{sModule} Modules</p>
                        </div>
                        <div className="border-l">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Số bài học</p>
                          <p className="text-xs font-black text-slate-700">{sBaiHoc} Tiết học</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                      <button
                        onClick={() => setDangChonMaMon(mon.maMonHoc)}
                        className="w-full bg-white hover:bg-[#0066FF] hover:text-white text-slate-700 font-black text-xs py-2.5 rounded-xl border shadow-sm transition flex items-center justify-center gap-1"
                      >
                        {mon.trangThai === "Chưa biên soạn" ? "Khởi tạo đề cương" : "Vào chỉnh sửa chi tiết"} &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* THANH ĐIỀU HƯỚNG PHÂN TRANG RÚT GỌN (PAGINATION) */}
          {tongSoTrang > 1 && (
            <div className="mt-8 flex justify-center items-center gap-1.5">
              <button 
                onClick={() => setTrangHienTai(p => Math.max(p - 1, 1))} 
                disabled={trangHienTai === 1}
                className="px-3 py-2 border rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                &larr; Trước
              </button>
              {Array.from({ length: tongSoTrang }, (_, i) => {
                const soP = i + 1;
                if (soP === 1 || soP === tongSoTrang || Math.abs(soP - trangHienTai) <= 1) {
                  return (
                    <button
                      key={soP}
                      onClick={() => setTrangHienTai(soP)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        trangHienTai === soP ? "bg-[#0066FF] text-white shadow-md" : "bg-white border text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {soP}
                    </button>
                  );
                } else if (soP === 2 || soP === tongSoTrang - 1) {
                  return <span key={soP} className="text-slate-400 text-xs px-0.5">...</span>;
                }
                return null;
              })}
              <button 
                onClick={() => setTrangHienTai(p => Math.min(p + 1, tongSoTrang))} 
                disabled={trangHienTai === tongSoTrang}
                className="px-3 py-2 border rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Sau &rarr;
              </button>
            </div>
          )}

        </div>
      ) : (
        
        // ================= VIEW CHẾ ĐỘ 2: TRÌNH BIÊN SOẠN BÀI GIẢNG PHÂN CẤP SÂU (TIMELINE LEARNING PATHSTYLE) =================
        <>
          {/* Dashboard Thanh Công Cụ trên Tiêu Đề */}
          <section className="max-w-7xl mx-auto px-6 -mt-16 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-lg font-black text-slate-800">Cấu trúc Lộ trình học thuật</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tổng thời lượng phân bổ môn học: 
                  <span className="text-[#0066FF] font-black ml-1">
                    {deCuongHienTai.danhSachModule.reduce((a,m)=> a + m.danhSachPhan.reduce((s,p)=> s + p.thoiLuongPhut, 0),0)} phút
                  </span>
                </p>
              </div>
              <div className="flex gap-2.5 w-full md:w-auto">
                <button 
                  onClick={() => setMoModalModule(true)} 
                  className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                >
                  📂 Đóng gói Module mới
                </button>
                <button 
                  onClick={() => { alert(`Đã nộp duyệt đề cương môn [${deCuongHienTai.maMonHoc}] thành công!`); setDangChonMaMon(null); }} 
                  className="flex-1 md:flex-none bg-gradient-to-r from-[#0066FF] to-blue-700 hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
                >
                  🚀 Gửi Phê Duyệt Đề Cương
                </button>
              </div>
            </div>
          </section>

          {/* Vùng Render Cấu Trúc Cây Cột Trái / Cột Phải */}
          <section className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Sidebar: Chuẩn đầu ra */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-2">🎯 Khung chuẩn đầu ra</h4>
                <ul className="space-y-3">
                  {deCuongHienTai.chuanDauRa.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                      <span className="text-blue-500 font-bold mt-0.5">✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vùng Cấu trúc chính */}
              <div className="lg:col-span-3 space-y-5">
                {deCuongHienTai.danhSachModule.length === 0 ? (
                  <div className="bg-white rounded-2xl py-20 border-2 border-dashed text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">📭</span>
                    <p className="text-sm font-bold text-slate-700">Chưa có bài giảng</p>
                    <button onClick={() => setMoModalModule(true)} className="mt-1 bg-[#0066FF] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">Tạo Module Đầu Tiên</button>
                  </div>
                ) : (
                  deCuongHienTai.danhSachModule.map((module, mIdx) => (
                    <div key={module.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                      
                      {/* Header Module */}
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 text-[#0066FF] font-mono font-black text-xs w-9 h-9 rounded-xl border border-blue-100 flex items-center justify-center shrink-0">
                            M{mIdx + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{module.tenModule}</h3>
                            <p className="text-[11px] text-slate-400 font-medium italic">{module.moTaNgan || "Chưa cập nhật mô tả tóm tắt nội dung học phần."}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setTargetModuleId(module.id); setMoModalPhan(true); }}
                          className="bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF] hover:text-white font-black text-[11px] px-3 py-1.5 rounded-xl transition"
                        >
                          + Thêm Tiết Học
                        </button>
                      </div>

                      {/* Danh sách bài học con lồng Timeline Trực Quan */}
                      <div className="p-4 bg-white relative">
                        {module.danhSachPhan.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6 font-medium">Chương này chưa có nội dung bài học cụ thể.</p>
                        ) : (
                          <div className="space-y-3 relative">
                            {/* Đường trục dọc giả lập Timeline */}
                            <div className="absolute top-4 bottom-4 left-[21px] w-[2px] bg-slate-100 hidden sm:block"></div>

                            {module.danhSachPhan.map((phan, pIdx) => {
                              const isVideo = phan.loaiNoiDung === "Video bài giảng";
                              const isReading = phan.loaiNoiDung === "Tài liệu đọc";
                              const isQuiz = phan.loaiNoiDung === "Bài kiểm tra (Quiz)";

                              return (
                                <div key={phan.id} className="relative flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 rounded-xl shadow-sm transition group">
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-slate-300 font-mono text-sm tracking-tighter cursor-grab opacity-0 group-hover:opacity-100 transition hidden sm:inline">⋮⋮</span>
                                    <span className="w-5 h-5 bg-slate-100 text-slate-500 text-[10px] font-mono font-bold rounded-full flex items-center justify-center z-10 shrink-0">{pIdx + 1}</span>
                                    
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border shrink-0 ${
                                      isVideo ? "bg-rose-50 text-rose-600 border-rose-100" :
                                      isReading ? "bg-amber-50 text-amber-600 border-amber-100" :
                                      isQuiz ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                    }`}>
                                      {isVideo ? "📺" : isReading ? "📖" : isQuiz ? "🧠" : "💻"}
                                    </span>

                                    <div>
                                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{phan.tenPhan}</p>
                                      <span className="inline-block text-[9px] font-black text-slate-400 uppercase tracking-wider">{phan.loaiNoiDung}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border">⏱️ {phan.thoiLuongPhut} phút</span>
                                    <button 
                                      type="button" 
                                      onClick={() => handleXoaPhanHoc(module.id, phan.id)}
                                      className="text-slate-300 hover:text-rose-600 font-black text-base px-1 transition"
                                      title="Xóa tiết học"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ================= THÀNH PHẦN MODAL DIALOG POPUPS ================= */}
      {/* 1. Modal Thêm Module */}
      {moModalModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-base font-black text-slate-900 border-b pb-3 mb-4">📂 Khởi Tạo Module Học Phần Mới</h2>
            <form onSubmit={handleThemModule} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tên Chương/Module *</label>
                <input type="text" value={formTenModule} onChange={(e) => setFormTenModule(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-slate-900 font-medium focus:outline-none" placeholder="Ví dụ: Chương 3: Quản lý Luồng Dữ Liệu Chuyên Sâu" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Mô tả ngắn</label>
                <textarea rows={2} value={formMoTaModule} onChange={(e) => setFormMoTaModule(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-slate-900 font-medium focus:outline-none" placeholder="Mục tiêu kiến thức cốt lõi..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setMoModalModule(false)} className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-500 rounded-xl">Đóng</button>
                <button type="submit" className="px-3 py-2 text-xs font-bold bg-[#0066FF] text-white rounded-xl">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Thêm Bài Học */}
      {moModalPhan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-base font-black text-slate-900 border-b pb-3 mb-4">📝 Cấu Hình Tiết Học Chi Tiết</h2>
            <form onSubmit={handleThemPhanHoc} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tiêu đề bài học/phần *</label>
                <input type="text" value={formTenPhan} onChange={(e) => setFormTenPhan(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-slate-900 font-medium focus:outline-none" placeholder="Ví dụ: Triển khai cấu trúc thư mục chuẩn dự án" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Hình thức định dạng</label>
                  <select value={formLoaiNoiDung} onChange={(e) => setFormLoaiNoiDung(e.target.value as any)} className="w-full p-2 border rounded-xl text-xs bg-white text-slate-900 font-bold focus:outline-none">
                    <option value="Video bài giảng">📺 Video bài giảng</option>
                    <option value="Tài liệu đọc">📖 Tài liệu đọc</option>
                    <option value="Bài kiểm tra (Quiz)">🧠 Bài kiểm tra (Quiz)</option>
                    <option value="Bài tập thực hành">💻 Bài tập thực hành</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Thời lượng (Phút)</label>
                  <input type="number" value={formThoiLuong} onChange={(e) => setFormThoiLuong(Number(e.target.value))} className="w-full p-2 border rounded-xl text-xs text-slate-900 font-medium focus:outline-none" min={1} required />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setMoModalPhan(false)} className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-500 rounded-xl">Hủy</button>
                <button type="submit" className="px-3 py-2 text-xs font-bold bg-[#0066FF] text-white rounded-xl">Lưu bài học</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}