'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function CourseAssignment() {
    // 1. Danh sách giảng viên hệ thống để Phòng đào tạo lựa chọn gán cho khóa học
    const lecturers = [
        { id: "GV01", name: "TS. Nguyễn Văn A", expertise: "Fullstack Development & Cloud", degree: "Tiến sĩ KHMT" },
        { id: "GV02", name: "ThS. Trần Thị B", expertise: "Frontend Architecture & UI/UX", degree: "Thạc sĩ CNPM" },
        { id: "GV03", name: "Chuyên gia Lê Hoàng C", expertise: "DevOps & Cloud Infrastructure", degree: "Solutions Architect" },
        { id: "GV04", name: "Anh Phạm Minh D", expertise: "Enterprise Applications", degree: "Kỹ sư phần mềm Senior" }
    ];

    // 2. Danh sách dữ liệu tĩnh của các khóa học hiện có sinh ra từ CTDT mẫu
    const [courses, setCourses] = useState([
        {
            id: "COURSE-NEXTJS-2026",
            name: "Khóa học Lập trình Next.js Toàn Diện & Triển khai Hệ thống",
            templateName: "CTDT mẫu: Chuyên viên Phát triển Web Cao cấp",
            duration: "12 tuần",
            level: "Nâng cao (Advanced)",
            targetAudience: "Sinh viên năm cuối ngành CNTT, Lập trình viên Front-end muốn nâng cấp lên Fullstack.",
            description: "Tập trung vào kiến trúc App Router, tối ưu hóa hiệu năng Rendering (SSR, SSG, ISR), bảo mật hệ thống và đóng gói Docker.",
            assignedLecturerId: "GV01",
            modules: [
                { title: "Module 1: Next.js Core Concepts & App Router Architecture", duration: "2 tuần" },
                { title: "Module 2: Data Fetching, Caching, and Server Actions", duration: "2 tuần" },
                { title: "Module 3: Advanced Authentication & Authorization (Auth.js)", duration: "2 tuần" },
                { title: "Module 4: Database Integration (Prisma, PostgreSQL) & API Routes", duration: "2 tuần" },
                { title: "Module 5: State Management & Performance Optimization", duration: "2 tuần" },
                { title: "Module 6: DevOps Pipeline: Dockerizing & AWS Deployment", duration: "2 tuần" },
            ]
        },
        {
            id: "COURSE-PYTHON-2026",
            name: "Khóa học Kỹ nghệ Dữ liệu & Ứng dụng Trí tuệ Nhân tạo",
            templateName: "CTDT mẫu: Kỹ sư Khoa học Dữ liệu (Data Science)",
            duration: "16 tuần",
            level: "Trung cấp - Nâng cao",
            targetAudience: "Lập trình viên muốn chuyển dịch sang mảng AI/Data, chuyên viên phân tích nghiệp vụ (BA).",
            description: "Thành thạo khai phá dữ liệu lớn với Python, xây dựng mô hình Machine Learning, Deep Learning và tích hợp các mô hình LLM vào ứng dụng.",
            assignedLecturerId: "",
            modules: [
                { title: "Module 1: Python Advanced & Data Structures for Data Science", duration: "3 tuần" },
                { title: "Module 2: Data Analysis with Pandas, NumPy & Visualization", duration: "3 tuần" },
                { title: "Module 3: Mathematics for Machine Learning & Statistical Models", duration: "3 tuần" },
                { title: "Module 4: Supervised & Unsupervised Machine Learning Algorithms", duration: "3 tuần" },
                { title: "Module 5: Introduction to Deep Learning with PyTorch", duration: "4 tuần" }
            ]
        },
        {
            id: "COURSE-UXUI-2026",
            name: "Khóa học Thiết kế Trải nghiệm Người dùng & Giao diện Chuyên nghiệp",
            templateName: "CTDT mẫu: Chuyên viên Thiết kế Sản phẩm Số (Product Design)",
            duration: "8 tuần",
            level: "Cơ bản đến Trung cấp",
            targetAudience: "Người mới bắt đầu học thiết kế, Graphic Designer muốn chuyển hướng sang UI/UX.",
            description: "Nghiên cứu hành vi người dùng, vẽ wireframe, xây dựng Design System và tạo prototype tương tác cao cấp trên Figma.",
            assignedLecturerId: "GV02",
            modules: [
                { title: "Module 1: User Research Methods & Persona Creation", duration: "2 tuần" },
                { title: "Module 2: Information Architecture & Wireframing Flows", duration: "2 tuần" },
                { title: "Module 3: Visual Design Principles & Building Figma Design System", duration: "2 tuần" },
                { title: "Module 4: High-Fidelity Prototyping & Usability Testing", duration: "2 tuần" }
            ]
        }
    ]);

    // ID khóa học đang được chọn để hiển thị chi tiết (Mặc định chọn khóa đầu tiên)
    const [selectedCourseId, setSelectedCourseId] = useState("COURSE-NEXTJS-2026");

    // Lấy ra thông tin chi tiết của khóa học đang chọn
    const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
    // Lấy ra giảng viên đang phụ trách khóa học hiện tại
    const activeLecturer = lecturers.find(l => l.id === activeCourse.assignedLecturerId);

    // Hàm thay đổi giảng viên cho khóa học đang chọn
    const handleAssignLecturer = (lecturerId) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === activeCourse.id ? { ...course, assignedLecturerId: lecturerId } : course
            )
        );
    };

    return (
        <>
            <Navbar></Navbar>
            <div className="min-h-screen bg-[#e6f2ff] text-gray-800 antialiased p-4 sm:p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Tiêu đề bảng điều khiển */}
                    <div className="bg-white p-5 rounded-xl border border-[#d1e2f3] shadow-sm">
                        <h1 className="text-xl font-bold text-[#0066cc]">Quản Lý Phân Công Chương Trình Đào Tạo</h1>
                    </div>

                    {/* Bố cục chia đôi: Bên trái chọn khóa học, Bên phải hiển thị thông tin chi tiết */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* CỘT DANH SÁCH CÁC CTDT HIỆN CÓ (CHIẾM 1 PHẦN) */}
                        <div className="lg:col-span-1 space-y-3">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                                Danh sách khóa học hiện có ({courses.length})
                            </div>

                            {courses.map((course) => {
                                const assignedTeacher = lecturers.find(l => l.id === course.assignedLecturerId);
                                const isSelected = course.id === selectedCourseId;

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 shadow-sm ${isSelected
                                            ? 'bg-white border-2 border-[#0066cc] ring-2 ring-blue-100'
                                            : 'bg-white border-[#d1e2f3] hover:border-blue-300 hover:bg-white/80'
                                            }`}
                                    >
                                        <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">{course.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{course.templateName}</p>

                                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <span className="text-gray-500 font-medium">📦 {course.modules.length} Module</span>

                                            {assignedTeacher ? (
                                                <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                    👨‍🏫 {assignedTeacher.name}
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                    ⚠️ Chưa phân công
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CỘT CHI TIẾT VÀ PHÂN CÔNG (CHIẾM 2 PHẦN) */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeCourse ? (
                                <>
                                    {/* 1. Chi tiết học liệu & Mô tả của CTDT đang được chọn */}
                                    <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm space-y-4">
                                        <div className="border-b border-[#e6f2ff] pb-3">
                                            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#e6f2ff] text-[#0066cc] px-2.5 py-1 rounded-md">
                                                Mã lớp học: {activeCourse.id}
                                            </span>
                                            <h2 className="text-lg font-bold text-gray-950 mt-2.5">{activeCourse.name}</h2>
                                            <p className="text-xs text-gray-400 mt-1">Nguồn gốc: {activeCourse.templateName}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
                                            <p><span className="text-gray-400 font-medium">Thời lượng:</span> <strong className="text-gray-800 font-medium block mt-0.5">{activeCourse.duration}</strong></p>
                                            <p><span className="text-gray-400 font-medium">Trình độ khóa học:</span> <strong className="text-gray-800 font-medium block mt-0.5">{activeCourse.level}</strong></p>
                                        </div>

                                        <div className="text-xs sm:text-sm pt-2">
                                            <span className="text-gray-400 font-medium block mb-1">Đối tượng hướng tới:</span>
                                            <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">{activeCourse.targetAudience}</p>
                                        </div>

                                        <div className="text-xs sm:text-sm">
                                            <span className="text-gray-400 font-medium block mb-1">Tóm tắt nội dung:</span>
                                            <p className="text-gray-600 leading-relaxed">{activeCourse.description}</p>
                                        </div>
                                    </div>

                                    {/* 2. Cấu trúc danh sách các Module chi tiết */}
                                    <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            Khung chương trình chi tiết ({activeCourse.modules.length} Module nội dung)
                                        </h3>
                                        <div className="divide-y divide-[#e6f2ff] max-h-60 overflow-y-auto pr-1">
                                            {activeCourse.modules.map((mod, idx) => (
                                                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs sm:text-sm gap-4">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-[#0066cc] font-bold text-xs bg-[#e6f2ff] px-1.5 py-0.5 rounded shrink-0">M{idx + 1}</span>
                                                        <span className="text-gray-700 font-medium">{mod.title}</span>
                                                    </div>
                                                    <span className="text-gray-400 text-xs shrink-0 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{mod.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Phân công / Thay đổi Giảng viên trực tiếp cho khóa đang xem */}
                                    <div className="bg-white p-6 rounded-xl border border-[#d1e2f3] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-base font-bold text-[#0066cc]">Phân công Nhân sự</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Chỉ định duy nhất một giảng viên phụ trách xây dựng học liệu và kiểm duyệt.</p>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold text-gray-500">Chọn giảng viên đảm nhận:</label>
                                                <select
                                                    value={activeCourse.assignedLecturerId}
                                                    onChange={(e) => handleAssignLecturer(e.target.value)}
                                                    className="w-full text-xs bg-white border border-[#d1e2f3] rounded-lg p-2.5 focus:outline-none focus:border-[#0066cc] text-gray-700 cursor-pointer shadow-inner"
                                                >
                                                    <option value="">-- Chưa chỉ định giảng viên --</option>
                                                    {lecturers.map(lecturer => (
                                                        <option key={lecturer.id} value={lecturer.id}>
                                                            {lecturer.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Chi tiết thông tin giảng viên đang chọn phụ trách */}
                                        <div className="flex flex-col justify-center">
                                            {activeLecturer ? (
                                                <div className="bg-[#e6f2ff]/40 p-4 rounded-lg border border-[#d1e2f3] text-xs space-y-1">
                                                    <p className="text-[#0066cc] font-bold text-sm">Hồ sơ giảng viên phụ trách:</p>
                                                    <p><span className="text-gray-400 font-medium">Họ tên:</span> <span className="text-gray-800 font-semibold">{activeLecturer.name}</span></p>
                                                    <p><span className="text-gray-400 font-medium">Học vị:</span> <span className="text-gray-800">{activeLecturer.degree}</span></p>
                                                    <p><span className="text-gray-400 font-medium">Lĩnh vực:</span> <span className="text-gray-800">{activeLecturer.expertise}</span></p>
                                                    <div className="pt-2 mt-1 border-t border-dashed border-[#d1e2f3] text-amber-700 font-medium flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                                        Hệ thống: Khóa học ở trạng thái chờ giảng viên duyệt bài giảng.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg text-xs leading-relaxed flex items-start gap-2">
                                                    <span>⚠️</span>
                                                    <span><strong>Cảnh báo:</strong> Khóa học này hiện chưa được giao cho nhân sự nào quản lý. Vui lòng chọn một giảng viên để tiếp quản công việc biên soạn học liệu.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Các nút xử lý dữ liệu cuối trang */}
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            disabled={!activeCourse.assignedLecturerId}
                                            onClick={() => alert(`Lưu thành công cấu hình nhân sự cho khóa học: ${activeCourse.name}`)}
                                            className="px-6 py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-bold rounded-lg shadow-sm transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            Xác nhận & Lưu thay đổi
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white p-12 text-center rounded-xl border border-[#d1e2f3] text-gray-400 text-sm">
                                    Vui lòng chọn một chương trình đào tạo từ danh sách bên trái.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}