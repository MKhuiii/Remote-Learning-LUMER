'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') || 'login';

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setIsLoginMode(mode === 'login');
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginMode && !name)) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (isLoginMode) {
      // Logic Đăng nhập giả lập
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      alert('Đăng nhập thành công!');
      router.push('/home');
    } else {
      // Logic Đăng ký giả lập
      localStorage.setItem('registeredUser', JSON.stringify({ name, email }));
      alert('Đăng ký tài khoản thành công! Hãy tiến hành đăng nhập.');
      router.push('/login?mode=login');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-16 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
      <h2 className="text-xl font-black text-gray-900 mb-6 text-center">
        {isLoginMode ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-blue-500"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase">Email của bạn</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@lumer.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition mt-2 cursor-pointer"
        >
          {isLoginMode ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push(isLoginMode ? '/login?mode=register' : '/login?mode=login')}
          className="text-xs text-[#0066FF] font-bold hover:underline"
        >
          {isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Quay lại đăng nhập'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="text-center p-10 text-xs text-gray-400">Đang tải biểu mẫu...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}