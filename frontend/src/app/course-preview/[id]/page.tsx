'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockCourses, Course } from '@/data/data';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

function CoursePreviewContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);

  // Danh sách lưu trữ toàn bộ khóa học gợi ý tương tự
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (id) {
      const found = mockCourses.find(c => c.id === id);
      if (found) {
        setCourse(found);
        
        // Tìm và hiển thị toàn bộ các khóa cùng chuyên mục (loại trừ chính nó)
        // Hệ thống sẽ render toàn bộ danh sách (>10 khóa nếu file data của bạn có đủ)
        const filtered = mockCourses.filter(
          c => c.category === found.category && c.id !== found.id
        );
        setSimilarCourses(filtered);
      }
    }
  }, [id]);

  const handleRegister = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đăng ký khóa học!');
      router.push('/login?mode=login');
      return;
    }

    const savedList = localStorage.getItem('registeredCourses');
    let registeredIds = savedList ? JSON.parse(savedList) : ['computer-architecture'];

    if (course && !registeredIds.includes(course.id)) {
      registeredIds.push(course.id);
      localStorage.setItem('registeredCourses', JSON.stringify(registeredIds));
    }

    alert(`Đăng ký thành công khóa học: ${course?.title}`);
    router.replace('/home'); 
  };

  if (!course) return <div className="p-10 text-center text-xs text-gray-400">Đang tìm dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Banner chính của Khóa học */}
      <div className="bg-[#0b1b35] text-white py-12 px-8">
        <div className="max-w-5xl mx-auto space-y-2">
          <span className="text-[10px] text-[#66CCFF] font-bold uppercase">{course.category}</span>
          <h1 className="text-2xl font-black">{course.title}</h1>
          <p className="text-xs text-gray-400">Cung cấp bởi đối tác học thuật: {course.instructor}</p>
        </div>
      </div>

      {/* Thông tin Chi tiết Khóa học */}
      <div className="max-w-5xl w-full mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-gray-400">Về khóa học này</h3>
            <p className="text-xs text-gray-600 bg-slate-50 p-4 rounded-xl leading-relaxed font-medium border border-gray-100">{course.description}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-400">Chương trình học chi tiết</h3>
            {course.modules.map((mod, idx) => (
              <div key={mod.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Mô-đun {idx + 1}: {mod.title}</span>
                <div className="divide-y divide-gray-50">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="py-2 flex justify-between items-center text-xs text-gray-600 font-medium">
                      <span>{lIdx + 1}. {lesson.title}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột Widget Mua/Đăng ký bên phải */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3 text-center sticky top-6">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase">Học trực tuyến</h4>
            <h3 className="text-sm font-black text-gray-900">Bắt đầu học ngay hôm nay</h3>
            <button onClick={handleRegister} className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
              Đăng ký tham gia
            </button>
          </div>
        </div>
      </div>

      {/* ==================== PHẦN LƯỚI KHÓA HỌC TƯƠNG TỰ (HIỂN THỊ NHIỀU KHÓA) ==================== */}
      {similarCourses.length > 0 && (
        <div className="bg-slate-50 border-t border-gray-100 mt-12 py-12 px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-gray-900 tracking-tight">💡 Khóa học đề xuất cho bạn</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Dựa trên tiến trình xem chương trình {course.category} của bạn</p>
              </div>
              <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg font-bold uppercase font-mono shadow-3xs self-start sm:self-auto">
                Tìm thấy: {similarCourses.length} khóa tương tự
              </span>
            </div>

            {/* Lưới Grid hiển thị không giới hạn - tự động chia 3 cột ở màn hình PC, xuống dòng cực đẹp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {similarCourses.map((simCourse) => (
                <Link 
                  key={simCourse.id} 
                  href={`/course-preview/${simCourse.id}`}
                  className="bg-white border border-gray-200 p-4 rounded-2xl shadow-3xs hover:shadow-xs hover:border-gray-300 transition-all duration-200 flex flex-col justify-between no-underline group text-gray-900"
                >
                  <div className="space-y-2.5">
                    <span className="text-[9px] bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded-md font-bold uppercase inline-block">
                      {simCourse.category}
                    </span>
                    <h4 className="text-xs font-black leading-snug group-hover:text-[#0066FF] transition line-clamp-2">
                      {simCourse.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
                      {simCourse.description}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                    <span className="truncate max-w-[65%]">👨‍🏫 {simCourse.instructor}</span>
                    <span className="text-[#0066FF] font-bold group-hover:translate-x-0.5 transition-transform shrink-0">Khám phá →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursePreviewPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-10 text-center text-xs text-gray-400">Đang tải cấu trúc dữ liệu...</div>}>
        <CoursePreviewContent />
      </Suspense>
    </div>
  );
}