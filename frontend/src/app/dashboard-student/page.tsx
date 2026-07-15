"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { fetchCurrentUser, fetchUserProfile, updateUserData, updateUserProfile } from "@/actions/getUser";
import { UserDataInfo, ProfileInfo } from "@/types/user";

const ROLE_TRANSLATIONS: Record<string, string> = {
  "Admin": "Quản trị viên hệ thống",
  "User": "Người dùng",
  "Tester": "Người kiểm thử",
  "Instructor": "Giảng viên",
  "Manager": "Quản lý đào tạo"
};

const DASHBOARD_MOCK_DATA = {
  statistics: [
    { title: "3", text: "Khóa học đang học" },
    { title: "5", text: "Khóa học hoàn thành" },
    { title: "2", text: "Chứng chỉ" },
    { title: "4.9", text: "Điểm trung bình" },
  ],
  learningCourses: [
    { title: "Lập trình Web với Next.js", progress: 70 },
    { title: "FastAPI Backend", progress: 35 },
    { title: "ReactJS nâng cao", progress: 55 },
  ],
  completedCourses: [
    { title: "Java Core" }, { title: "MySQL" }, { title: "HTML CSS" }, { title: "Spring Boot" },
  ],
  certificates: [
    { title: "Java Core Certificate", date: "20/05/2026" },
    { title: "ReactJS Certificate", date: "10/06/2026" },
  ],
  recentActivities: [
    "Hoàn thành bài học React Hooks", "Nhận chứng chỉ Java Core", "Hoàn thành 70% khóa Next.js",
  ]
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("learning");
  const [user, setUser] = useState<UserDataInfo | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🌟 State quản lý chế độ chỉnh sửa & dữ liệu Form chung
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    birthdate: "",
    firstname: "",
    lastname: "",
    bio: "",
    avatar_url: ""
  });

  // Hàm load lại toàn bộ thông tin mới từ Backend
  async function loadAllData() {
    try {
      setLoading(true);
      setError(null);
      const [userData, profileData] = await Promise.all([
        fetchCurrentUser(),
        fetchUserProfile()
      ]);
      setUser(userData);
      setProfile(profileData);

      // Đổ dữ liệu hiện tại vào Form
      if (userData && profileData) {
        setFormData({
          username: userData.username || "",
          birthdate: userData.birthdate || "",
          firstname: profileData.firstname || "",
          lastname: profileData.lastname || "",
          bio: profileData.bio || "",
          avatar_url: profileData.avatar_url || ""
        });
      }
    } catch (err: any) {
      console.error("Lỗi khi tải thông tin:", err);
      setError(err.message || "Đã xảy ra lỗi khi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Lắng nghe sự thay đổi của các ô nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🌟 Hàm xử lý SUBMIT form duy nhất cập nhật cả 2 API cùng lúc
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSubmitSuccess(null);

    try {
      // 1. Tách cấu trúc payload gửi đi theo đúng định dạng các lớp Backend
      const userPayload = {
        username: formData.username,
        birthdate: formData.birthdate || undefined,
      };

      const profilePayload = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      };

      // 2. Gửi song song cả 2 request PUT lên Backend
      const [userOk, profileOk] = await Promise.all([
        updateUserData(userPayload),
        updateUserProfile(profilePayload)
      ]);

      if (userOk && profileOk) {
        setSubmitSuccess("Cập nhật thông tin hồ sơ thành công!");
        setIsEditing(false); // Đóng chế độ edit
        await loadAllData(); // Refresh lại dữ liệu hiển thị mới nhất
      } else {
        setError("Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật:", err);
      setError("Đã xảy ra lỗi trong quá trình lưu dữ liệu.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const fullName = profile ? `${profile.lastname} ${profile.firstname}`.trim() : "";
  const defaultAvatar = "https://www.w3schools.com/howto/img_avatar.png";
  const userAvatar = profile?.avatar_url || defaultAvatar;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-blue-500 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <span className="bg-blue-100 text-[#0056D2] px-4 py-2 rounded-full text-sm font-medium">
            Hệ thống đào tạo trực tuyến
          </span>

          <h1 className="text-5xl font-bold text-white mt-4">LUMER</h1>
          <p className="text-lg text-white mt-3">
            Nền tảng đào tạo từ xa dành cho sinh viên và giảng viên
          </p>

          <div className="flex items-center gap-4 mt-10">
            {loading ? (
              <div className="w-16 h-16 rounded-full bg-blue-400 animate-pulse border-2 border-slate-200" />
            ) : (
              <img
                src={userAvatar}
                alt="avatar"
                className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover"
              />
            )}

            <div>
              {loading ? (
                <div className="h-8 w-48 bg-blue-400 animate-pulse rounded"></div>
              ) : error && !user ? (
                <h2 className="text-2xl font-semibold text-red-200">Không thể tải tên</h2>
              ) : (
                <h2 className="text-2xl font-semibold text-white">
                  Xin chào, {fullName || user?.username || "Thành viên"}
                </h2>
              )}
              <p className="text-white mt-1">Theo dõi tiến độ học tập của bạn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid md:grid-cols-4 gap-4">
          {DASHBOARD_MOCK_DATA.statistics.map((stat, index) => (
            <StatCard key={index} title={stat.title} text={stat.text} />
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            {["learning", "completed", "certificate", "profile"].map((tab) => {
              const tabLabels: Record<string, string> = {
                learning: "Đang học", completed: "Hoàn thành", certificate: "Chứng chỉ", profile: "Hồ sơ"
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium transition ${activeTab === tab
                    ? "border-b-2 border-[#0056D2] text-[#0056D2]"
                    : "text-slate-500 hover:text-[#0056D2]"
                    }`}
                >
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">

            {/* TAB: ĐANG HỌC */}
            {activeTab === "learning" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Khóa học đang học</h2>
                <div className="space-y-6">
                  {DASHBOARD_MOCK_DATA.learningCourses.map((course, index) => (
                    <CourseProgressCard key={index} title={course.title} progress={course.progress} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: HOÀN THÀNH */}
            {activeTab === "completed" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Khóa học hoàn thành</h2>
                <div className="space-y-4">
                  {DASHBOARD_MOCK_DATA.completedCourses.map((course, index) => (
                    <CompletedCourse key={index} title={course.title} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CHỨNG CHỈ */}
            {activeTab === "certificate" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Chứng chỉ</h2>
                <div className="space-y-4">
                  {DASHBOARD_MOCK_DATA.certificates.map((cert, index) => (
                    <CertificateCard key={index} title={cert.title} date={cert.date} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB: HỒ SƠ */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h2>
                  {!isEditing && user && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#0056D2] hover:bg-[#0046AE] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Chỉnh sửa hồ sơ
                    </button>
                  )}
                </div>

                {submitSuccess && (
                  <div className="p-4 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
                    {submitSuccess}
                  </div>
                )}

                {error && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {loading && !isEditing ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  </div>
                ) : isEditing ? (
                  /* 🌟 HIỂN THỊ FORM CHỈNH SỬA CHUNG */
                  <form onSubmit={handleFormSubmit} className="space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ</label>
                        <input
                          type="text"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nguyễn"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên</label>
                        <input
                          type="text"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleInputChange}
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Văn A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên tài khoản (Username)</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện (URL)</label>
                      <input
                        type="url"
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tiểu sử / Giới thiệu bản thân</label>
                      <textarea
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Một vài dòng viết về bản thân bạn..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2 border-t">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setIsEditing(false);
                          setError(null);
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-[#0056D2] hover:bg-[#0046AE] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                      >
                        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                ) : user ? (
                  /* HIỂN THỊ THÔNG TIN CHI TIẾT TĨNH */
                  <div className="space-y-4 text-slate-700">

                    <div className="flex items-center gap-4 border-b pb-4">
                      <strong className="text-slate-500">Ảnh đại diện:</strong>
                      <img src={userAvatar} alt="avatar mini" className="w-12 h-12 rounded-full border object-cover" />
                    </div>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Họ và tên:</strong>
                      <span className="font-semibold text-slate-900">{fullName || "Chưa cập nhật"}</span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Tên tài khoản:</strong>
                      <span>{user.username}</span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Email:</strong>
                      <span>{user.email}</span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Ngày sinh:</strong>
                      <span>{formatDate(user.birthdate)}</span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Vai trò:</strong>
                      <span className="bg-blue-50 text-[#0056D2] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {ROLE_TRANSLATIONS[user.role_name] || user.role_name}
                      </span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Trạng thái:</strong>
                      <span className="text-green-600 font-semibold text-sm">{user.display_status}</span>
                    </p>

                    <p className="flex justify-between border-b pb-2">
                      <strong className="text-slate-500">Ngày tham gia:</strong>
                      <span>{formatDate(user.created_at)}</span>
                    </p>

                    <div className="pt-2">
                      <strong className="text-slate-500 block mb-1">Tiểu sử / Giới thiệu:</strong>
                      <div className="bg-slate-50 border rounded-xl p-3 text-sm text-slate-600 italic">
                        {profile?.bio || "Chưa có thông tin giới thiệu bản thân."}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin học viên</h2>
              <div className="space-y-3 text-slate-600">
                <p>📚 Đang học: {DASHBOARD_MOCK_DATA.learningCourses.length} khóa</p>
                <p>✅ Hoàn thành: {DASHBOARD_MOCK_DATA.completedCourses.length} khóa</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hoạt động gần đây</h2>
              <ul className="space-y-3 text-slate-600 list-disc pl-4">
                {DASHBOARD_MOCK_DATA.recentActivities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Các component phụ trợ...
function StatCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-md transition">
      <h3 className="text-3xl font-bold text-[#0056D2]">{title}</h3>
      <p className="text-slate-500 mt-2">{text}</p>
    </div>
  );
}

function CourseProgressCard({ title, progress }: { title: string; progress: number }) {
  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
        <span className="font-semibold text-[#0056D2]">{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full">
        <div className="bg-[#0056D2] h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <button className="mt-4 bg-[#0056D2] hover:bg-[#0046AE] text-white px-5 py-2 rounded-md font-medium transition">
        Tiếp tục học
      </button>
    </div>
  );
}

function CompletedCourse({ title }: { title: string }) {
  return (
    <div className="flex justify-between items-center border border-slate-200 rounded-lg p-4">
      <span>{title}</span>
      <span className="text-green-600 font-semibold">✓ Hoàn thành</span>
    </div>
  );
}

function CertificateCard({ title, date }: { title: string; date: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">Ngày cấp: {date}</p>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 border border-[#0056D2] text-[#0056D2] py-2 rounded-md hover:bg-blue-50 transition">
          Xem
        </button>
        <button className="flex-1 bg-[#0056D2] text-white py-2 rounded-md hover:bg-[#0046AE] transition">
          Tải PDF
        </button>
      </div>
    </div>
  );
}