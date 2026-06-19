'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockCourses, Course } from '@/data/data';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Đọc từ khóa danh mục từ menu Khám phá
  const categoryQuery = searchParams?.get('category') || 'Tất cả';

  // State quản lý Tab chính ("my-learning" hoặc "all-courses")
  const [activeTab, setActiveTab] = useState<'my-learning' | 'all-courses'>('my-learning');

  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Khoa học Máy tính', 'An ninh mạng', 'Phát triển Web', 'Khoa học Dữ liệu & AI', 'Thiết kế Đồ họa'];

  // Nếu người dùng chọn danh mục từ menu Khám phá, tự động chuyển sang Tab "Tất cả khóa học" để hiển thị kết quả lọc
  useEffect(() => {
    if (categoryQuery && categoryQuery !== 'Tất cả') {
      setSelectedCategory(categoryQuery);
      setActiveTab('all-courses');
    } else {
      setSelectedCategory('Tất cả');
    }
  }, [categoryQuery]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const savedList = localStorage.getItem('registeredCourses');
    setRegisteredIds(savedList ? JSON.parse(savedList) : ['computer-architecture']);
    setCompletedIds(JSON.parse(localStorage.getItem('completedCourses') || '[]'));
  }, [router]);

  // Lọc danh sách: Khóa học ĐÃ THAM GIA của user
  const myCourses = mockCourses.filter(c => registeredIds.includes(c.id));

  // Lọc danh sách: TẤT CẢ KHÓA HỌC kết hợp từ khóa Khám phá
  const allDisplayedCourses = selectedCategory === 'Tất cả'
    ? mockCourses
    : mockCourses.filter(c => c.category === selectedCategory || c.instructor === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <Navbar />
      
      <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-6 flex-1">
        
        {/* HỆ THỐNG THANH CHUYỂN TAB LỚN ĐẦU TRANG */}
        <div className="flex border-b border-gray-200 bg-white px-6 pt-4 rounded-t-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('my-learning')}
            className={`pb-3 text-xs font-black mr-8 border-b-2 transition select-none cursor-pointer ${
              activeTab === 'my-learning' 
                ? 'border-[#0066FF] text-[#0066FF]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📚 Việc học của tôi ({myCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all-courses')}
            className={`pb-3 text-xs font-black border-b-2 transition select-none cursor-pointer ${
              activeTab === 'all-courses' 
                ? 'border-[#0066FF] text-[#0066FF]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            🌐 Tất cả khóa học ({mockCourses.length})
          </button>
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: KHÓA HỌC CỦA TÔI (Đã tham gia - Phân tách biệt lập để quản lý) */}
        {/* ===================================================================== */}
        {activeTab === 'my-learning' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">Lộ trình học tập cá nhân</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Danh sách các bài học bạn đã đăng ký tham gia trên hệ thống LUMER.</p>
            </div>

            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map(course => {
                  const isCompleted = completedIds.includes(course.id);
                  const currentProgress = course.id === 'computer-architecture' ? 4 : 0;

                  return (
                    <div key={course.id} className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-2xs transition ${isCompleted ? 'border-emerald-200 bg-emerald-50/5' : 'border-gray-200'}`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0066FF]'}`}>
                            {course.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{course.instructor}</span>
                        </div>
                        
                        <h3 className="text-xs font-black text-gray-900 line-clamp-2 min-h-[32px] leading-tight">{course.title}</h3>
                        
                        {/* Hiển thị thanh tiến độ biệt lập rõ ràng */}
                        <div className="pt-2 border-t border-gray-50 space-y-1.5">
                          {isCompleted ? (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                              <span>✓ Hoàn thành 100% & Đã cấp chứng chỉ</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                <span>Tiến độ học</span>
                                <span>{currentProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-[#0066FF] h-1.5 rounded-full transition-all duration-300" style={{ width: `${currentProgress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold">{course.modules.length} Mô-đun</span>
                        {isCompleted ? (
                          <button onClick={() => alert(`Tải chứng chỉ PDF: ${course.title}`)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">
                            Tải chứng chỉ
                          </button>
                        ) : (
                          <Link href={`/course/${course.id}`} className="bg-[#0066FF] text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                            Vào học tiếp →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl space-y-3">
                <p className="text-xs text-gray-400 italic">Bạn chưa đăng ký tham gia khóa học nào.</p>
                <button onClick={() => setActiveTab('all-courses')} className="text-xs bg-blue-50 text-[#0066FF] font-bold px-4 py-2 rounded-xl hover:bg-blue-100 transition">
                  Khám phá kho khóa học ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: TẤT CẢ KHÓA HỌC (Tích hợp bộ lọc từ khóa Khám phá nâng cao) */}
        {/* ===================================================================== */}
        {activeTab === 'all-courses' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Thanh chọn nhanh bộ lọc theo dạng nút bấm (Chip select) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Bộ lọc từ khóa khám phá</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Đang lọc hiển thị nhóm: <span className="text-[#0066FF] font-bold">{selectedCategory}</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      router.push(`/home?category=${encodeURIComponent(cat)}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-[#0066FF] text-white shadow-xs' 
                        : 'bg-slate-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {allDisplayedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDisplayedCourses.map(course => {
                  const isEnrolled = registeredIds.includes(course.id);
                  return (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-blue-200 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="bg-blue-50 text-[#0066FF] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">{course.category}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{course.instructor}</span>
                        </div>
                        <h3 className="text-xs font-black text-gray-900 line-clamp-2 min-h-[32px] leading-tight">{course.title}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                        
                        {/* Tag đánh dấu trạng thái nhỏ gọn bên dưới để phân biệt nhanh */}
                        {isEnrolled && (
                          <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                            ✓ Đã đăng ký học
                          </span>
                        )}
                      </div>

                      <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold">{course.modules.length} Mô-đun</span>
                        <Link href={isEnrolled ? `/course/${course.id}` : `/course-preview/${course.id}`} className={`font-bold text-xs px-3 py-1.5 rounded-lg transition ${isEnrolled ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#0066FF] text-white hover:bg-blue-700'}`}>
                          {isEnrolled ? 'Vào học ngay' : 'Xem chi tiết'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-400 italic">Không tìm thấy khóa học nào phù hợp.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-gray-400">Đang khởi tạo không gian học tập...</div>}>
      <HomeContent />
    </Suspense>
  );
}