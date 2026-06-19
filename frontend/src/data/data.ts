export interface Lesson {
  id: string;
  title: string;
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string; // Dùng để làm bộ lọc ở mục Khám phá
  instructor: string;
  progress?: number;
  modules: Module[];
}

export const mockCourses: Course[] = [
  {
    id: 'computer-architecture',
    title: 'Computer Architecture (Kiến trúc Máy tính)',
    description: 'Học về ELE 475 / COS 475 Introduction and Instruction Set Architectures tại Princeton University.',
    category: 'Khoa học Máy tính',
    instructor: 'Princeton University',
    progress: 4,
    modules: [
      {
        id: 'arch-m1',
        title: 'Mô-đun 1: Introduction and Instruction Set Architecture',
        lessons: [
          { id: 'arch-l1', title: 'Course Introduction', duration: '9 phút' },
          { id: 'arch-l2', title: 'Instruction Set Principles', duration: '12 phút' }
        ]
      }
    ]
  },
  {
    id: 'cissp-security',
    title: 'Tên miền CISSP 2: Bảo mật tài sản số',
    description: 'Khóa học chuyên sâu về bảo mật thông tin, phân loại và quản lý tài sản số, kiểm soát rủi ro dữ liệu theo chuẩn CISSP quốc tế.',
    category: 'An ninh mạng',
    instructor: 'Infosec',
    progress: 0,
    modules: [
      {
        id: 'cissp-m1',
        title: 'Mô-đun 1: Định nghĩa và Phân loại tài sản thông tin',
        lessons: [
          { id: 'cissp-l1', title: 'Giới thiệu về Quản lý tài sản số', duration: '12 phút' }
        ]
      }
    ]
  },
  {
    id: 'digital-security',
    title: 'An toàn và bảo mật kỹ thuật số cá nhân',
    description: 'Nền tảng bảo mật thông tin cá nhân và doanh nghiệp, cách phòng ngừa và ứng phó các cuộc tấn công mạng thông dụng.',
    category: 'An ninh mạng',
    instructor: 'Arizona State University',
    progress: 0,
    modules: [
      {
        id: 'dig-m1',
        title: 'Mô-đun 1: Các mối đe dọa an ninh mạng phổ biến',
        lessons: [
          { id: 'dig-l1', title: 'Phòng chống Malware và Phishing', duration: '20 phút' }
        ]
      }
    ]
  },
  {
    id: 'nextjs-mastery',
    title: 'Lập trình Fullstack với Next.js và Tailwind CSS',
    description: 'Xây dựng ứng dụng web hiệu năng cao, tối ưu SEO, kiến trúc App Router và kết nối cơ sở dữ liệu thực tế.',
    category: 'Phát triển Web',
    instructor: 'LUMER Academy',
    progress: 0,
    modules: [
      {
        id: 'next-m1',
        title: 'Mô-đun 1: Cấu trúc App Router và Routing cơ bản',
        lessons: [
          { id: 'next-l1', title: 'Khởi tạo dự án Next.js 14/15', duration: '15 phút' }
        ]
      }
    ]
  },
  {
    id: 'python-ai',
    title: 'Nhập môn Trí tuệ Nhân tạo & Học máy với Python',
    description: 'Học cách sử dụng thư viện NumPy, Pandas, Scikit-Learn để phân tích dữ liệu và huấn luyện các mô hình AI cơ bản.',
    category: 'Khoa học Dữ liệu & AI',
    instructor: 'Stanford Online',
    progress: 0,
    modules: [
      {
        id: 'py-m1',
        title: 'Mô-đun 1: Phân tích dữ liệu với bộ thư viện cơ bản',
        lessons: [
          { id: 'py-l1', title: 'Xử lý ma trận bằng NumPy', duration: '18 phút' }
        ]
      }
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'Thiết kế giao diện người dùng (UI/UX) bằng Figma',
    description: 'Làm chủ tư duy thiết kế, xây dựng Wireframe, Prototype và tạo dựng hệ thống Design System chuyên nghiệp.',
    category: 'Thiết kế Đồ họa',
    instructor: 'Google Career Certificates',
    progress: 0,
    modules: [
      {
        id: 'ui-m1',
        title: 'Mô-đun 1: Tư duy thiết kế lấy người dùng làm trung tâm',
        lessons: [
          { id: 'ui-l1', title: 'Phân biệt UI và UX trong dự án công nghệ', duration: '10 phút' }
        ]
      }
    ]
  }
];