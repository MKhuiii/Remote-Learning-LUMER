"use client";
import Navbar from "@/components/Navbar";
import { useState, useMemo, useEffect } from "react";
// ĐÃ IMPORT ĐẦY ĐỦ CÁC HÀM CẦN THIẾT TỪ SERVER ACTIONS
import {
  registerAccount,
  getrList,
  updateUserStatus,
  updateUserInfo,
  updateUserRole,
  getInforUser
} from "@/actions/getUser";
import Link from "next/link";

export interface User {
  user_id: string;
  username: string;
  email: string;
  role_id: number;
  status_id: string;
  role_name?: string;
  created_at?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  // Bộ lọc theo 3 trạng thái
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenViewModal, setIsOpenViewModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Lưu dữ liệu chi tiết trả về từ API đơn lẻ
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    role_id: 4,
    status_id: "ACTIVE",
    password: "",
  });

  const [editUserData, setEditUserData] = useState({
    username: "",
    email: "",
    role_id: 4,
    status_id: "ACTIVE",
  });

  const loadUsersFromServer = async (page: number) => {
    setLoading(true);
    const response = await getrList(page, ITEMS_PER_PAGE);

    if (response.success && response.list) {
      const formattedUsers = response.list.map((user: any) => {
        let finalRoleId = user.role_id ?? user.roleId;

        if (finalRoleId === undefined || finalRoleId === null) {
          if (user.role_name === 'Admin') finalRoleId = 1;
          else if (user.role_name === 'User') finalRoleId = 2;
          else if (user.role_name === 'Tester') finalRoleId = 3;
          else if (user.role_name === 'Instructor') finalRoleId = 4;
          else finalRoleId = 2;
        }

        return {
          ...user,
          role_id: Number(finalRoleId)
        };
      });

      setUsers(formattedUsers as User[]);
    } else {
      console.error(response.message);
      alert(response.message || "Có lỗi xảy ra khi tải dữ liệu");
      if (page > 1) setCurrentPage(prev => prev - 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsersFromServer(currentPage);
  }, [currentPage]);

  // Xử lý bộ lọc kết hợp tìm kiếm, vai trò, trạng thái
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "Tất cả" ||
        (roleFilter === "Admin" && user.role_id === 1) ||
        (roleFilter === "Giảng viên" && user.role_id === 4) ||
        (roleFilter === "Học viên" && user.role_id === 2) ||
        (roleFilter === "Tester" && user.role_id === 3);

      const matchesStatus =
        statusFilter === "Tất cả" || user.status_id === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      totalAdmin: users.filter(u => u.role_id === 1).length,
      totalGiangVien: users.filter(u => u.role_id === 4).length,
      active: users.filter(u => u.status_id === "ACTIVE").length,
      locked: users.filter(u => u.status_id === "BANNED").length,
    };
  }, [users]);

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserData({ ...newUserData, password });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSaveNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await registerAccount(newUserData);

    if (response.success) {
      alert("Đăng ký tài khoản mới thành công!");
      setIsOpenAddModal(false);
      setNewUserData({
        username: "", email: "", role_id: 4, status_id: "ACTIVE", password: ""
      });
      await loadUsersFromServer(currentPage);
    } else {
      alert("Lỗi đăng ký: " + response.message);
    }
  };

  // Hàm gọi API lấy chi tiết toàn bộ thông tin của user
  const handleOpenViewModal = async (user: User) => {
    setSelectedUser(user);
    setUserDetail(null);
    setIsOpenViewModal(true);
    setLoadingDetail(true);

    const response = await getInforUser(user.user_id);
    if (response.success && response.data) {
      setUserDetail(response.data);
    } else {
      console.error(response.message);
    }
    setLoadingDetail(false);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      status_id: user.status_id,
    });
    setIsOpenEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // 1. Cập nhật thông tin cơ bản
      const resInfo = await updateUserInfo(selectedUser.user_id, {
        username: editUserData.username
      });

      if (!resInfo.success) {
        alert(`Lỗi cập nhật tên công việc: ${resInfo.message}`);
        return;
      }

      // 2. Cập nhật Vai trò (Nếu có thay đổi)
      if (editUserData.role_id !== selectedUser.role_id) {
        const resRole = await updateUserRole(selectedUser.user_id, editUserData.role_id);
        if (!resRole.success) {
          alert(`Cập nhật tên thành công nhưng đổi Vai trò thất bại: ${resRole.message}`);
          return;
        }
      }

      // 3. Cập nhật Trạng thái tài khoản (Nếu có thay đổi)
      if (editUserData.status_id !== selectedUser.status_id) {
        const resStatus = await updateUserStatus(selectedUser.user_id, editUserData.status_id);
        if (!resStatus.success) {
          alert(`Cập nhật thông tin thành công nhưng đổi Trạng thái thất bại: ${resStatus.message}`);
          return;
        }
      }

      alert("Cập nhật thông tin tài khoản thành công!");
      setIsOpenEditModal(false);
      setSelectedUser(null);
      await loadUsersFromServer(currentPage);
    } catch (err: any) {
      alert("Lỗi hệ thống: " + err.message);
    }
  };

  const renderRoleBadge = (roleId: any) => {
    const id = Number(roleId);
    switch (id) {
      case 1: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Admin</span>;
      case 2: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Học viên</span>;
      case 3: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Kiểm thử</span>;
      case 4: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Giảng viên</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">Khác</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 relative">
          <Link
            href="/admin/"
            className="absolute top-6 right-6 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 text-xs font-bold transition-all hover:bg-white/30 no-underline text-white"
          >
            X
          </Link>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">Quản trị hệ thống</span>
          <h1 className="text-5xl font-bold mt-4">Quản lý người dùng</h1>
          <p className="text-xl mt-3 text-blue-100">Quản lý Tài khoản Admin & Giảng viên trên hệ thống LUMER</p>
        </div>
      </section>

      {/* Thống kê nhanh */}
      <section className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard title={stats.totalAdmin.toLocaleString()} text="Tổng bộ Admin" />
          <StatCard title={stats.totalGiangVien.toLocaleString()} text="Giảng viên" />
          <StatCard title={stats.active.toLocaleString()} text="Đang hoạt động" />
          <StatCard title={stats.locked.toLocaleString()} text="Bị khóa" />
        </div>
      </section>

      {/* Vùng Content chính */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#0066FF]">Danh sách tài khoản nội bộ</h2>
            <p className="text-slate-500 mt-1">Phân quyền kiểm soát, cấu hình hệ thống đào tạo</p>
          </div>
          <button
            onClick={() => setIsOpenAddModal(true)}
            className="bg-[#0066FF] text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition font-medium shadow-md shadow-blue-500/20"
          >
            + Thêm thành viên mới
          </button>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm nhanh tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition"
            />

            {/* Bộ lọc vai trò */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition cursor-pointer min-w-[180px]"
            >
              <option value="Tất cả">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Học viên">Học viên</option>
              <option value="Tester">Kiểm thử</option>
            </select>

            {/* Bộ lọc 3 Trạng thái dựa trên DB */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition cursor-pointer min-w-[180px]"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="UNACTIVE">Không hoạt động</option>
              <option value="BANNED">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Bảng danh sách tài khoản */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-700">Thành viên</th>
                <th className="p-4 font-semibold text-slate-700">Email liên hệ</th>
                <th className="p-4 font-semibold text-slate-700">Vai trò</th>
                <th className="p-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-slate-400">Đang tải danh sách tài khoản...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id || user.email} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-medium text-slate-900">{user.username}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4">{renderRoleBadge(user.role_id)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status_id === "ACTIVE" ? "bg-green-100 text-green-700 border border-green-200" :
                          user.status_id === "UNACTIVE" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                        {user.status_id === "ACTIVE" ? "Hoạt động" : user.status_id === "UNACTIVE" ? "Không hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenViewModal(user)}
                          className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-xs font-semibold transition"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="bg-amber-500 text-white px-4 py-1.5 rounded-lg hover:bg-amber-600 text-xs font-semibold transition shadow-sm"
                        >
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-10 text-slate-500">Không tìm thấy thành viên nào trùng khớp.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Phân trang */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">
              Trang hiện tại: <span className="text-[#0066FF] font-bold text-base ml-1">{currentPage}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1 || loading}
                onClick={handlePrevPage}
                className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                ← Trang trước
              </button>
              <button
                type="button"
                disabled={filteredUsers.length < ITEMS_PER_PAGE || loading}
                onClick={handleNextPage}
                className="px-5 py-2 text-sm font-semibold bg-[#0066FF] text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Trang tiếp →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: XEM CHI TIẾT TOÀN BỘ THÔNG TIN TỪ API */}
      {isOpenViewModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-7 rounded-2xl max-w-md w-full shadow-2xl relative transition-all">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-800">Thông tin chi tiết tài khoản</h3>
              <button onClick={() => setIsOpenViewModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                <span className="inline-block animate-spin mr-2">⏳</span> Đang tải toàn bộ dữ liệu từ hệ thống...
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl mb-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mã định danh (ID)</p>
                    <p className="font-mono text-xs text-slate-700 select-all truncate" title={userDetail?.user_id || selectedUser.user_id}>
                      {userDetail?.user_id || selectedUser.user_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tên vai trò (DB)</p>
                    <p className="font-semibold text-purple-700">
                      {userDetail?.role_name || selectedUser.role_name || "Chưa thiết lập"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Họ & Tên người dùng</p>
                  <p className="font-semibold text-slate-900 text-base">{userDetail?.username || selectedUser.username}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Địa chỉ Email</p>
                  <p className="font-medium text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">{userDetail?.email || selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ngày sinh (Birthdate)</p>
                    <p className="font-medium text-slate-900">
                      {userDetail?.birthdate ? new Date(userDetail.birthdate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ngày tạo tài khoản</p>
                    <p className="font-medium text-slate-600">
                      {userDetail?.created_at ? new Date(userDetail.created_at).toLocaleString("vi-VN") : (selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString("vi-VN") : "N/A")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phân quyền hiển thị</p>
                    <div>{renderRoleBadge(userDetail?.role_id || selectedUser.role_id)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trạng thái hiện tại</p>
                    <p className={`font-bold mt-0.5 ${(userDetail?.status_id || selectedUser.status_id) === "ACTIVE" ? "text-green-600" :
                        (userDetail?.status_id || selectedUser.status_id) === "UNACTIVE" ? "text-amber-500" : "text-red-500"
                      }`}>
                      {(userDetail?.status_id || selectedUser.status_id) === "ACTIVE" ? "🟢 Đang hoạt động" :
                        (userDetail?.status_id || selectedUser.status_id) === "UNACTIVE" ? "🟡 Không hoạt động" : "🔴 Đã bị khóa"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => setIsOpenViewModal(false)} className="mt-7 w-full bg-slate-100 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-200 text-slate-700 font-semibold transition">
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM THÀNH VIÊN */}
      {isOpenAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveNewUser} className="bg-white p-7 rounded-2xl max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Thêm thành viên mới</h3>
              <button type="button" onClick={() => setIsOpenAddModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên người dùng <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Nhập tên người dùng" required className="w-full border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition" value={newUserData.username} onChange={e => setNewUserData({ ...newUserData, username: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email liên hệ <span className="text-red-500">*</span></label>
              <input type="email" placeholder="Nhập email người dùng" required className="w-full border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                <input type="text" placeholder="Nhập mật khẩu" required className="flex-1 border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} />
                <button type="button" onClick={generateRandomPassword} className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 rounded-xl text-sm font-semibold transition border border-amber-200 whitespace-nowrap">
                  Tạo ngẫu nhiên
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vai trò hệ thống <span className="text-red-500">*</span></label>
              <select className="w-full border border-slate-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition cursor-pointer" value={newUserData.role_id} onChange={e => setNewUserData({ ...newUserData, role_id: Number(e.target.value) })}>
                <option value={4}>Giảng viên</option>
                <option value={1}>Admin</option>
                <option value={2}>Học viên</option>
                <option value={3}>Kiểm thử</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpenAddModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition">Hủy bỏ</button>
              <button type="submit" className="flex-1 bg-[#0066FF] text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/30 transition">Lưu thành viên</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: SỬA THÔNG TIN */}
      {isOpenEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdateUser} className="bg-white p-7 rounded-2xl max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-3">
              <h3 className="text-2xl font-bold text-slate-800">Chỉnh sửa tài khoản</h3>
              <button type="button" onClick={() => setIsOpenEditModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên người dùng <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full border border-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition" value={editUserData.username} onChange={e => setEditUserData({ ...editUserData, username: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ Email</label>
              <input type="email" disabled className="w-full border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" value={editUserData.email} />
              <p className="text-xs text-slate-400 mt-1.5">* Email đăng nhập không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái tài khoản <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-slate-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition cursor-pointer font-medium"
                value={editUserData.status_id}
                onChange={e => setEditUserData({ ...editUserData, status_id: e.target.value })}
              >
                <option value="ACTIVE" className="text-green-600 font-medium">Hoạt động (ACTIVE)</option>
                <option value="UNACTIVE" className="text-amber-600 font-medium">Không hoạt động (UNACTIVE)</option>
                <option value="BANNED" className="text-red-600 font-medium">Bị khóa (BANNED)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vai trò hệ thống <span className="text-red-500">*</span></label>
              <select className="w-full border border-slate-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition cursor-pointer" value={editUserData.role_id} onChange={e => setEditUserData({ ...editUserData, role_id: Number(e.target.value) })}>
                <option value={4}>Giảng viên</option>
                <option value={1}>Admin</option>
                <option value={2}>Học viên</option>
                <option value={3}>Kiểm thử</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpenEditModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition">Hủy bỏ</button>
              <button type="submit" className="flex-1 bg-[#0066FF] text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/30 transition">Lưu cập nhật</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-slate-200 hover:shadow-md transition">
      <h3 className="text-4xl font-bold text-[#0066FF]">{title}</h3>
      <p className="text-slate-500 mt-2 font-medium text-sm">{text}</p>
    </div>
  );
}