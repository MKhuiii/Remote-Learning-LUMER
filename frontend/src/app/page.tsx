'use client';
import { mockCourses } from '@/data/data';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  // Lấy tối đa 5 khóa học
  const topCourses = mockCourses.slice(0, 5);
  const featuredCourse = topCourses[0];
  const remainingCourses = topCourses.slice(1, 5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="border-b border-slate-200/80 bg-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Nền tảng đào tạo công nghệ LUMER
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            Hệ thống quản lý & học tập từ xa hiệu quả
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Cung cấp chương trình đào tạo chuẩn hóa, giúp bạn chủ động thời gian, nâng cao kỹ năng chuyên môn và làm chủ tri thức mọi lúc, mọi nơi.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-sm transition"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="/home"
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-lg transition"
            >
              Xem danh sách khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (Tối giản hoàn toàn) */}
      <section className="border-b border-slate-200 bg-slate-100/50 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-slate-900">10.000+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Học viên tham gia</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">98%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Tỷ lệ hài lòng</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">24/7</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Hỗ trợ giảng viên</p>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Lộ trình thực chiến</p>
          </div>
        </div>
      </section>

      {/* 3. COURSES SECTION (Tối đa 5 khóa) */}
      <section id="courses" className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 gap-2">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Khóa học đề xuất</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">5 Khóa học nổi bật</h2>
          </div>
          <p className="text-xs text-slate-500">Chương trình đào tạo được cập nhật mới nhất</p>
        </div>

        <div className="space-y-6">
          {/* Khóa 1: Featured Card (Nổi bật nhất) */}
          {featuredCourse && (
            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Nổi bật
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {featuredCourse.category}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{featuredCourse.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{featuredCourse.description}</p>
                <p className="text-xs font-medium text-slate-500">Giảng viên: <span className="text-slate-800 font-semibold">{featuredCourse.instructor}</span></p>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <Link
                  href={`/course-preview/${featuredCourse.id}`}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-lg transition"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          )}

          {/* 4 Khóa học còn lại (Grid 2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="space-y-3">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block">
                    {course.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{course.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">GV: {course.instructor}</span>
                  <Link
                    href={`/course-preview/${course.id}`}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    Xem khóa học →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER CALL TO ACTION */}
      <section className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Bắt đầu hành trình học tập tại LUMER</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Tạo tài khoản ngay hôm nay để truy cập vào kho bài giảng và tài nguyên miễn phí.</p>
          <div className="pt-2">
            <Link
              href="/login?mode=register"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg transition"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}