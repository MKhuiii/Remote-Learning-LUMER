import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path === '/unauthorized' || path.startsWith('/login')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const userRole = request.cookies.get('user_role')?.value

  console.log(`\n============== MIDDLEWARE CHECK ==============`);
  console.log(`👉 Đang vào Path: ${path}`);
  console.log(`👉 Token lấy được: ${token ? "ĐÃ CÓ TOKEN (OK)" : "TRỐNG (NULL)"}`);
  console.log(`👉 Role lấy được từ Cookie: "${userRole}"`);

  const isProtectedPath = [
    '/admin',
    '/training-management',
    '/dashboard-student',
    '/instructor-management'
  ].some(p => path.startsWith(p))

  if (isProtectedPath && !token) {
    console.log(`❌ Bị chặn vì: Vào trang bảo mật nhưng CHƯA ĐĂNG NHẬP (Không có Token)`);
    return NextResponse.redirect(new URL('/login?mode=login', request.url))
  }

  if (token) {
    const roleClean = userRole?.toLowerCase().trim()

    if (!roleClean) {
      console.log(`❌ Bị chặn vì: Có Token nhưng không tìm thấy Cookie "user_role"`);
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    if (path.startsWith('/admin') && roleClean !== 'admin') {
      console.log(`❌ Bị chặn vì: Vào khu vực Admin nhưng Role là "${roleClean}"`);
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/instructor-management')) {
      if (roleClean !== 'manager' && roleClean !== 'instructor') {
        console.log(`❌ Bị chặn vì: Vào khu vực Giảng viên nhưng Role thực tế là "${roleClean}"`);
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // 2. Kiểm tra khu vực Quản lý đào tạo
    if (path.startsWith('/training-management')) {
      if (roleClean !== 'faculty' && roleClean !== 'instructor' && roleClean !== 'manager') {
        console.log(`❌ Bị chặn vì: Vào khu vực Đào tạo nhưng Role thực tế là "${roleClean}"`);
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    if (path.startsWith('/dashboard-student') && roleClean !== 'user' && roleClean !== 'student') {
      console.log(`❌ Bị chặn vì: Vào khu vực Sinh viên nhưng Role thực tế là "${roleClean}"`);
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log(`✅ HỢP LỆ! Cho phép truy cập vào: ${path}`);
  }

  console.log(`==============================================\n`);

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  return response
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/training-management',
    '/training-management/:path*',
    '/dashboard-student',
    '/dashboard-student/:path*',
    '/instructor-management',
    '/instructor-management/:path*',
  ],
}