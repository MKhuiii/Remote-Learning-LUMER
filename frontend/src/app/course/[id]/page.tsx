'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockCourses, Course, Lesson } from '@/data/data';
import Navbar from '@/components/Navbar';

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(undefined);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (id) {
      const foundCourse = mockCourses.find(c => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
        if (foundCourse.modules && foundCourse.modules.length > 0) {
          const firstModule = foundCourse.modules[0];
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setCurrentLesson(firstModule.lessons[0]);
          }
          setExpandedModules({ [firstModule.id]: true });
        }
      }
    }
  }, [id, router]);

  // HÀM TỰ ĐỘNG CHUYỂN BÀI / CHUYỂN MODULE KHI BẤM NÚT CHÂN TRANG
  const handleNextLesson = () => {
    if (!course || !currentLesson) return;

    let currentModuleIdx = -1;
    let currentLessonIdx = -1;

    // Tìm vị trí Module và Lesson hiện tại
    for (let i = 0; i < course.modules.length; i++) {
      const lessonIdx = course.modules[i].lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIdx !== -1) {
        currentModuleIdx = i;
        currentLessonIdx = lessonIdx;
        break;
      }
    }

    if (currentModuleIdx === -1 || currentLessonIdx === -1) return;

    const currentModule = course.modules[currentModuleIdx];

    // TRƯỜNG HỢP 1: Còn bài tiếp theo trong cùng một Module
    if (currentLessonIdx < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[currentLessonIdx + 1];
      setCurrentLesson(nextLesson);
    } 
    // TRƯỜNG HỢP 2: Đã hết bài ở Module này, tự động nhảy sang bài đầu tiên của Module kế tiếp
    else if (currentModuleIdx < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIdx + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        const nextLesson = nextModule.lessons[0];
        
        // Tự động kích hoạt mở rộng Module mới trên Sidebar
        setExpandedModules(prev => ({ ...prev, [nextModule.id]: true }));
        setCurrentLesson(nextLesson);
      }
    } 
    // TRƯỜNG HỢP 3: Đã học xong bài cuối cùng của khóa học
    else {
      alert('Chúc mừng! Bạn đã hoàn thành toàn bộ bài giảng của khóa học này! 🎉');
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xs text-gray-400 font-medium">
        Đang tải không gian học tập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900">
      {/* Thanh điều hướng */}
      <Navbar />

      {/* THANH THAO TÁC RỜI LỚP HỌC QUAY VỀ PAGEMAIN */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2 text-[11px] font-medium text-gray-400">
          <button onClick={() => router.push('/home')} className="hover:text-white transition cursor-pointer">
            Trang chủ thành viên
          </button>
          <span>/</span>
          <span className="text-gray-300 line-clamp-1">{course.title}</span>
        </div>

        <button
          type="button"
          onClick={() => router.push('/home')}
          className="bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white text-[11px] font-bold px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer focus:outline-none"
        >
          ✕ Rời khỏi lớp học
        </button>
      </div>

      {/* Giao diện học tập chia làm 2 cột */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-104px)]">
        
        {/* CỘT TRÁI: DANH SÁCH BÀI HỌC (SIDEBAR) */}
        <div className="w-80 border-r border-gray-200 bg-slate-50 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xs font-black text-gray-900 line-clamp-2 leading-tight">{course.title}</h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Tiến độ: Lớp học trực tuyến</p>
          </div>

          <div className="flex-1 divide-y divide-gray-200">
            {course.modules?.map((mod, modIdx) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div key={mod.id} className="bg-white">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 flex justify-between items-center transition"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Mô-đun {modIdx + 1}</span>
                      <span className="text-xs font-bold text-gray-700 block line-clamp-1">{mod.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="bg-white divide-y divide-gray-50">
                      {mod.lessons?.map((lesson) => {
                        const isSelected = currentLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full text-left px-5 py-3 text-xs font-medium transition flex justify-between items-center ${
                              isSelected 
                                ? 'bg-blue-50 text-[#0066FF] border-l-4 border-[#0066FF]' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <span className="line-clamp-2 pr-2">{lesson.title}</span>
                            <span className="text-[9px] text-gray-400 font-bold shrink-0">{lesson.duration || '10p'}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: KHU VỰC HIỂN THỊ VIDEO BÀI GIẢNG */}
        <div className="flex-1 p-8 overflow-y-auto bg-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider">Bài học đang diễn ra</span>
              <h1 className="text-xl font-black text-gray-900">
                {currentLesson ? currentLesson.title : 'Vui lòng chọn một bài học bên danh sách'}
              </h1>
            </div>

            {/* Trình phát Video Giả lập */}
            <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-6 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-50"></div>
              <div className="z-10 text-center space-y-3">
                <div className="w-14 h-14 bg-[#0066FF] hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-lg shadow-md cursor-pointer mx-auto transition transform hover:scale-105">
                  ▶
                </div>
                <p className="text-xs font-bold text-gray-200 tracking-wide">
                  {currentLesson ? `Đang phát: ${currentLesson.title}` : 'Video chưa sẵn sàng'}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">Hệ thống quản lý bài giảng chất lượng cao LUMER Network</p>
              </div>
            </div>
          </div>

          {/* Thanh chuyển bài điều hướng chân trang */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400">Học tập hiệu quả mỗi ngày</span>
            <button 
              type="button"
              onClick={handleNextLesson}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition shadow-xs cursor-pointer"
            >
              Chuyển đến mục tiếp theo →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}