'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockCourses, Course } from '@/data/data';
import Navbar from '@/components/Navbar';

function CoursePreviewContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (id) {
      const found = mockCourses.find(c => c.id === id);
      if (found) setCourse(found);
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
  
  // Đã đổi sang /home chuẩn xác
  router.replace('/home'); 
};

  if (!course) return <div className="p-10 text-center text-xs text-gray-400">Đang tìm dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="bg-[#0b1b35] text-white py-12 px-8">
        <div className="max-w-5xl mx-auto space-y-2">
          <span className="text-[10px] text-[#66CCFF] font-bold uppercase">{course.category}</span>
          <h1 className="text-2xl font-black">{course.title}</h1>
          <p className="text-xs text-gray-400">Cung cấp bởi đối tác học thuật: {course.instructor}</p>
        </div>
      </div>

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

        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3 text-center">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase">Học trực tuyến</h4>
            <h3 className="text-sm font-black text-gray-900">Bắt đầu học ngay hôm nay</h3>
            <button onClick={handleRegister} className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
              Đăng ký tham gia
            </button>
          </div>
        </div>
      </div>
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