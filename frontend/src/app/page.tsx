'use client';
import { mockCourses } from '@/data/data';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      {/* HERO BANNER BLOCK */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-6">
        <div className="bg-[#3b9eff] text-white rounded-3xl p-10 space-y-6 shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight">LUMER E-Learning Platform</h1>
            <p className="text-sm font-medium text-blue-50/90 leading-relaxed">
              Hệ thống quản lý và cung cấp bài giảng công nghệ chất lượng cao, giúp bạn làm chủ tri thức mọi lúc mọi nơi.
            </p>
          </div>
          <Link
            href="/login?mode=register"
            className="inline-block bg-white text-[#0066FF] font-bold text-xs px-6 py-3 rounded-xl shadow-xs hover:bg-slate-50 transition"
          >
            Bắt đầu học ngay
          </Link>
        </div>
      </div>

      {/* LISTING COURSES */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 space-y-6">
        <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Tất cả khóa học hiện có</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockCourses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
              <div className="space-y-3">
                <span className="bg-blue-50 text-[#0066FF] text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide inline-block">
                  {course.category}
                </span>
                <h3 className="text-sm font-black text-gray-900 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 font-semibold">GV: {course.instructor}</span>
                <Link href={`/course-preview/${course.id}`} className="text-[#0066FF] font-bold hover:underline">
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}