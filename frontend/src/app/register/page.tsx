'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...');
    router.push('/login');
  };


  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-t-4 border-t-[#0066FF]">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900">Họ và tên</label>
            <input 
              required 
              type="text" 
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CCFF] focus:border-transparent" 
              placeholder="Nguyen Van A" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900">Email</label>
            <input 
              required 
              type="email" 
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CCFF] focus:border-transparent" 
              placeholder="name@example.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900">Mật khẩu</label>
            <input 
              required 
              type="password" 
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CCFF] focus:border-transparent" 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-sm">
            Đăng ký
          </button>
        </form>
        
        <p className="mt-4 text-sm text-center text-gray-700">
          Đã có tài khoản? <Link href="/login" className="text-[#0066FF] hover:underline font-bold">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}