"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function TeacherDashboard() {
    const router = useRouter();

    const features = [

        {
            title: "Đề cương môn học",
            desc: "Biên soạn mục tiêu, nội dung chi tiết và chuẩn đầu ra cho từng môn.",
            route: "/instructor-management/course-outline",
            icon: "📘",
        },
        {
            title: "Quản lý môn học",
            desc: "Tạo môn học, thiết lập các module (chương) và bài học chi tiết.",
            route: "/instructor-management/course-content",
            icon: "📁",
        },
        {
            title: "Ngân hàng câu hỏi",
            desc: "Kho lưu trữ câu hỏi dùng chung cho toàn bộ môn học để tạo đề thi.",
            route: "/instructor-management/questions-bank",
            icon: "🗂️",
        },
        {
            title: "Quản lý bài thi",
            desc: "Tạo và cấu hình các bài kiểm tra, bài thi cuối kỳ cho học viên.",
            route: "/instructor-management/exam-manage",
            icon: "📝",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />

            {/* Header */}
            <section className="bg-gradient-to-r from-[#66CCFF] to-[#0066FF] text-white">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-bold">Trang Giảng Viên LUMER</h1>

                    <p className="text-xl mt-4 text-blue-100">
                        Hệ thống quản lý bài giảng, đề cương và ngân hàng đề thi
                    </p>

                    <div className="flex items-center gap-4 mt-10">
                        <img
                            src="https://i.pravatar.cc/150?img=68"
                            alt="avatar"
                            className="w-16 h-16 rounded-full border-4 border-white"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">Xin chào, Giảng viên</h2>
                            <p className="text-sm text-blue-200 mt-1">Học viện Công nghệ LUMER</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Grid */}
            <section className="max-w-7xl mx-auto px-6 py-10">
                <h3 className="text-xl font-bold text-slate-700 mb-6">Chức năng quản lý</h3>

                {/* Đổi từ grid-cols-3 sang responsive grid linh hoạt hơn */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((item) => (
                        <div
                            key={item.title}
                            onClick={() => router.push(item.route)}
                            className="bg-white rounded-2xl p-8 shadow hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="text-5xl mb-4">{item.icon}</div>

                                <h2 className="text-2xl font-bold text-[#0066FF]">
                                    {item.title}
                                </h2>

                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Thêm một mũi tên nhỏ góc dưới để tăng trải nghiệm bấm (UX) */}
                            <div className="mt-6 text-right">
                                <span className="text-[#0066FF] font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                                    Truy cập →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}