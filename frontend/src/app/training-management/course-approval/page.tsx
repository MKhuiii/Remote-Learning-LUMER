'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function CourseApprovalDashboardWithTesting() {
    // 1. Danh sách nhân sự học thử hệ thống (Bổ sung tiến độ và đánh giá của họ)
    const availableTesters = [
        { id: "T01", name: "Nguyễn Thúy Hằng", role: "QA Kiểm định Chất lượng", progress: 100, isConfirmed: true, feedback: "Video rõ nét, hệ thống lab Module 6 chạy mượt mà." },
        { id: "T02", name: "Trần Minh Hoàng", role: "Học viên xuất sắc K21", progress: 100, isConfirmed: true, feedback: "Nội dung nâng cao rất hay, bài tập Server Actions có tính thực tế cao." },
        { id: "T03", name: "Lê Văn Nam", role: "Chuyên gia Đánh giá Trải nghiệm", progress: 45, isConfirmed: false, feedback: "Đang học đến Module 3, giao diện trực quan." },
        { id: "T04", name: "Phạm Thị Ngọc", role: "Trợ giảng chuyên môn", progress: 0, isConfirmed: false, feedback: "Chưa bắt đầu học." }
    ];

    // 2. Danh sách các khóa học trực tuyến đang chờ kiểm duyệt
    const [pendingCourses, setPendingCourses] = useState([
        {
            id: "COURSE-NEXTJS-2026",
            name: "Khóa học Lập trình Next.js Toàn Diện & Triển khai Hệ thống",
            lecturerName: "TS. Nguyễn Văn A",
            submittedDate: "18/06/2026",
            duration: "12 tuần",
            totalModules: 6,
            courseMaterialUrl: "#",
            lecturerNote: "Tôi đã bổ sung thêm 3 bài lab thực hành thực tế về Server Actions và cấu hình CI/CD trên AWS ở Module 6.",
            modules: [
                { title: "Module 1: Next.js Core Concepts & App Router Architecture", lessons: "8 bài giảng" },
                { title: "Module 2: Data Fetching, Caching, and Server Actions", lessons: "6 bài giảng" },
                { title: "Module 3: Advanced Authentication & Authorization", lessons: "5 bài giảng" },
                { title: "Module 4: Database Integration (Prisma, PostgreSQL)", lessons: "7 bài giảng" },
                { title: "Module 5: State Management & Performance Optimization", lessons: "6 bài giảng" },
                { title: "Module 6: DevOps Pipeline: Dockerizing & AWS Deployment", lessons: "4 bài giảng" },
            ],
            assignedTesterIds: ["T01", "T02"] // Khóa này được gán 2 người đã học xong 100%
        },
        {
            id: "COURSE-PYTHON-2026",
            name: "Khóa học Kỹ nghệ Dữ liệu & Ứng dụng Trí tuệ Nhân tạo",
            lecturerName: "Chuyên gia Lê Hoàng C",
            submittedDate: "19/06/2026",
            duration: "16 tuần",
            totalModules: 5,
            courseMaterialUrl: "#",
            lecturerNote: "Giáo án chuẩn hóa theo khung Python AI mới nhất. Đã tích hợp API của OpenAI.",
            modules: [
                { title: "Module 1: Python Advanced & Data Structures", lessons: "10 bài giảng" },
                { title: "Module 2: Data Analysis with Pandas & NumPy", lessons: "8 bài giảng" },
                { title: "Module 3: Mathematics for Machine Learning", lessons: "12 bài giảng" },
                { title: "Module 4: Supervised & Unsupervised Learning", lessons: "9 bài giảng" },
                { title: "Module 5: Introduction to Deep Learning with PyTorch", lessons: "7 bài giảng" }
            ],
            assignedTesterIds: ["T03", "T04"] // Khóa này gán 2 người chưa học xong
        }
    ]);

    // Khóa học đang chọn
    const [selectedCourseId, setSelectedCourseId] = useState("COURSE-NEXTJS-2026");
    const activeCourse = pendingCourses.find(c => c.id === selectedCourseId) || pendingCourses[0];

    // Lấy danh sách thông tin Tester cụ thể của khóa học đang chọn
    const activeTesters = availableTesters.filter(t => activeCourse.assignedTesterIds.includes(t.id));

    // Kiểm tra xem khóa học đã ĐỦ ĐIỀU KIỆN phát hành chưa (Có tester, tất cả tester đạt 100% và đã xác nhận)
    const isEligibleToPublish = activeTesters.length > 0 && activeTesters.every(t => t.progress === 100 && t.isConfirmed);

    // Xử lý bật/tắt gán tester
    const handleToggleTester = (testerId) => {
        setPendingCourses(prev => prev.map(course => {
            if (course.id !== activeCourse.id) return course;
            const exists = course.assignedTesterIds.includes(testerId);
            return {
                ...course,
                assignedTesterIds: exists ? course.assignedTesterIds.filter(id => id !== testerId) : [...course.assignedTesterIds, testerId]
            };
        }));
    };

    return (
        <>
            <Navbar></Navbar>
            <div className="min-h-screen bg-[#e6f2ff] text-gray-800 antialiased p-4 sm:p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header quản trị */}
                    <div className="bg-white p-5 rounded-xl border border-[#d1e2f3] shadow-sm">
                        <h1 className="text-xl font-bold text-[#0066cc]">Phê Duyệt Khóa Học</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* CỘT TRÁI: DANH SÁCH YÊU CẦU CHỜ DUYỆT */}
                        <div className="lg:col-span-1 space-y-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block px-1">Danh sách khóa học chờ duyệt ({pendingCourses.length})</span>
                            {pendingCourses.map((course) => {
                                const isSelected = course.id === selectedCourseId;
                                const courseTesters = availableTesters.filter(t => course.assignedTesterIds.includes(t.id));
                                const isReady = courseTesters.length > 0 && courseTesters.every(t => t.progress === 100 && t.isConfirmed);

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${isSelected ? 'bg-white border-2 border-[#0066cc] ring-2 ring-blue-100' : 'bg-white border-[#d1e2f3] hover:bg-white/80'
                                            }`}
                                    >
                                        <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{course.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1">Giảng viên: {course.lecturerName}</p>

                                        <div className="mt-3 pt-2.5 border-t border-gray-150 flex items-center justify-between text-xs">
                                            <span className="text-gray-500">👥 {course.assignedTesterIds.length} Người học thử</span>
                                            {isReady ? (
                                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                                    ✓ Đủ ĐK Duyệt
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                                    ⏳ Đang thử nghiệm
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CỘT PHẢI: CHI TIẾT THẨM ĐỊNH & THEO DÕI HỌC THỬ */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* 1. Tổng quan nội dung khóa học */}
                            <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm space-y-4">
                                <div className="border-b border-[#e6f2ff] pb-3">
                                    <h2 className="text-base font-bold text-gray-950">{activeCourse.name}</h2>
                                    <p className="text-xs text-gray-400 mt-1">Giảng viên phụ trách: <span className="text-gray-700 font-medium">{activeCourse.lecturerName}</span></p>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-150"><span className="font-bold text-gray-500">Ghi chú từ GV:</span> "{activeCourse.lecturerNote}"</p>
                            </div>

                            {/* 2. KHU VỰC THỊ THỰC TIẾN ĐỘ VÀ PHẢN HỒI CỦA NGƯỜI HỌC THỬ */}
                            <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-[#e6f2ff] pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-[#0066cc]">Kết Quả Học Thử Nghiệm (Beta Testing)</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Hiển thị tiến độ hoàn thành bài học và xác nhận đánh giá chất lượng từ các tài khoản học thử.</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                        Tỷ lệ đạt chuẩn: {activeTesters.filter(t => t.isConfirmed).length}/{activeTesters.length}
                                    </span>
                                </div>

                                {activeTesters.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeTesters.map((tester) => (
                                            <div key={tester.id} className="p-4 rounded-xl border border-gray-150 bg-white space-y-3 shadow-inner">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-950">{tester.name}</h4>
                                                        <p className="text-xs text-gray-400">{tester.role}</p>
                                                    </div>

                                                    {/* Trạng thái xác nhận */}
                                                    <div>
                                                        {tester.isConfirmed ? (
                                                            <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full border border-emerald-200">
                                                                ✓ Đã xác nhận khóa học đạt chuẩn
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] px-2.5 py-0.5 bg-amber-100 text-amber-800 font-medium rounded-full border border-amber-200">
                                                                ⏳ Đang học & Đánh giá
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Thanh Progress bar tiến độ học của tester */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                                        <span>Tiến độ học tập:</span>
                                                        <span className={tester.progress === 100 ? "text-emerald-600 font-bold" : "text-gray-700"}>{tester.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${tester.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${tester.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Phản hồi từ tester nếu có */}
                                                {tester.feedback && (
                                                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                                        " {tester.feedback} "
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                                        Chưa gán tài khoản nào học thử nghiệm. Vui lòng cấu hình phân công ở danh sách bên dưới.
                                    </div>
                                )}
                            </div>

                            {/* 3. Phân công / Thay đổi nhân sự học thử (Cấu hình thêm/bớt) */}
                            <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Phân công Tester</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availableTesters.map((tester) => {
                                        const isAssigned = activeCourse.assignedTesterIds.includes(tester.id);
                                        return (
                                            <div
                                                key={tester.id}
                                                onClick={() => handleToggleTester(tester.id)}
                                                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${isAssigned ? 'border-blue-400 bg-[#e6f2ff]/40' : 'border-gray-200 hover:border-blue-200 bg-white'
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-900">{tester.name}</p>
                                                    <p className="text-gray-400 text-[11px]">{tester.role}</p>
                                                </div>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[10px] ${isAssigned ? 'bg-[#0066cc] border-[#0066cc] text-white' : 'border-gray-300'}`}>
                                                    {isAssigned && "✓"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* BẢNG ĐIỀU KHIỂN DUYỆT KHÓA HỌC BIÊN PHÒNG ĐÀO TẠO */}
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#d1e2f3] shadow-sm">
                                <div className="text-xs text-gray-500">
                                    {!isEligibleToPublish && (
                                        <p className="text-amber-700 font-medium">⚠️ Cần tất cả Tester hoàn thành 100% & xác nhận mới có thể duyệt phát hành.</p>
                                    )}
                                    {isEligibleToPublish && (
                                        <p className="text-emerald-700 font-bold">✅ Đủ điều kiện: Khóa học đã được toàn bộ học viên mẫu xác nhận đạt chuẩn chất lượng.</p>
                                    )}
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => alert("Đã từ chối và trả yêu cầu chỉnh sửa nội dung về hòm thư của Giảng viên.")}
                                        className="px-4 py-2 bg-white text-red-600 border border-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Từ chối duyệt
                                    </button>
                                    <button
                                        disabled={!isEligibleToPublish}
                                        onClick={() => alert(`🎉 Khóa học '${activeCourse.name}' đã chính thức được duyệt thành công và hiển thị trên trang chủ bán khóa học!`)}
                                        className="px-5 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Duyệt & Phát hành Chính thức
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}