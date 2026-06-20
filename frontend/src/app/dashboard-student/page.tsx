"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("learning");

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
            <img
              src="https://i.pravatar.cc/150"
              alt="avatar"
              className="w-16 h-16 rounded-full border-2 border-slate-200"
            />

            <div>
              <h2 className="text-2xl font-semibold text-white">
                Xin chào, Nguyen Van A
              </h2>

              <p className="text-white">Theo dõi tiến độ học tập của bạn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="3" text="Khóa học đang học" />
          <StatCard title="5" text="Khóa học hoàn thành" />
          <StatCard title="2" text="Chứng chỉ" />
          <StatCard title="4.9" text="Điểm trung bình" />
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("learning")}
              className={`pb-3 font-medium transition ${activeTab === "learning"
                  ? "border-b-2 border-[#0056D2] text-[#0056D2]"
                  : "text-slate-500 hover:text-[#0056D2]"
                }`}
            >
              Đang học
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-3 font-medium transition ${activeTab === "completed"
                  ? "border-b-2 border-[#0056D2] text-[#0056D2]"
                  : "text-slate-500 hover:text-[#0056D2]"
                }`}
            >
              Hoàn thành
            </button>

            <button
              onClick={() => setActiveTab("certificate")}
              className={`pb-3 font-medium transition ${activeTab === "certificate"
                  ? "border-b-2 border-[#0056D2] text-[#0056D2]"
                  : "text-slate-500 hover:text-[#0056D2]"
                }`}
            >
              Chứng chỉ
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-3 font-medium transition ${activeTab === "profile"
                  ? "border-b-2 border-[#0056D2] text-[#0056D2]"
                  : "text-slate-500 hover:text-[#0056D2]"
                }`}
            >
              Hồ sơ
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === "learning" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Khóa học đang học
                </h2>

                <div className="space-y-6">
                  <CourseProgressCard
                    title="Lập trình Web với Next.js"
                    progress={70}
                  />

                  <CourseProgressCard title="FastAPI Backend" progress={35} />

                  <CourseProgressCard title="ReactJS nâng cao" progress={55} />
                </div>
              </div>
            )}

            {activeTab === "completed" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Khóa học hoàn thành
                </h2>

                <div className="space-y-4">
                  <CompletedCourse title="Java Core" />
                  <CompletedCourse title="MySQL" />
                  <CompletedCourse title="HTML CSS" />
                  <CompletedCourse title="Spring Boot" />
                </div>
              </div>
            )}

            {activeTab === "certificate" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Chứng chỉ
                </h2>

                <div className="space-y-4">
                  <CertificateCard
                    title="Java Core Certificate"
                    date="20/05/2026"
                  />

                  <CertificateCard
                    title="ReactJS Certificate"
                    date="10/06/2026"
                  />
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Hồ sơ cá nhân
                </h2>

                <div className="space-y-3 text-slate-700">
                  <p>
                    <strong>Họ tên:</strong> Trần Minh Tú
                  </p>

                  <p>
                    <strong>Email:</strong> example@gmail.com
                  </p>

                  <p>
                    <strong>Vai trò:</strong> Học viên
                  </p>

                  <p>
                    <strong>Ngày tham gia:</strong> 01/01/2026
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Thông tin học viên
              </h2>

              <div className="space-y-3 text-slate-600">
                <p>📚 Đang học: 3 khóa</p>
                <p>✅ Hoàn thành: 5 khóa</p>
                <p>🏆 Chứng chỉ: 2</p>
                <p>⭐ Điểm TB: 4.9</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Hoạt động gần đây
              </h2>

              <ul className="space-y-3 text-slate-600">
                <li>Hoàn thành bài học React Hooks</li>
                <li>Nhận chứng chỉ Java Core</li>
                <li>Hoàn thành 70% khóa Next.js</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-md transition">
      <h3 className="text-3xl font-bold text-[#0056D2]">{title}</h3>

      <p className="text-slate-500 mt-2">{text}</p>
    </div>
  );
}

function CourseProgressCard({
  title,
  progress,
}: {
  title: string;
  progress: number;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-lg text-slate-900">{title}</h3>

        <span className="font-semibold text-[#0056D2]">{progress}%</span>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full">
        <div
          className="bg-[#0056D2] h-2 rounded-full"
          style={{
            width: `${progress}%`,
          }}
        />
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
