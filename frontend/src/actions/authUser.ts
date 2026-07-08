'use server'

import { cookies } from 'next/headers'

const userBackendUrl = process.env.NEXT_PUBLIC_USER_BACKEND_URL;

export interface ActionResponse {
  success: boolean
  message: string
  user?: {
    username: string
    email: string
    role: string
  }
}
interface GoogleAuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    username: string;
    email: string;
    role: string;
    profile: {
      firstname: string | null;
      lastname: string | null;
      avatar_url: string | null;
    };
  };
}

// ------------------ Action Đăng Ký ----------------------
export async function registerAccount(name: string, email: string, password: string): Promise<ActionResponse> {
  try {
    const res = await fetch(`${userBackendUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name,
        email: email,
        password: password,
        role_id: 2,
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return { success: false, message: data.detail || 'Đăng ký thất bại' }
    }
    return { success: true, message: data.message || 'Đăng ký tài khoản thành công' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Không thể kết nối đến Server Backend!' }
  }
}

async function setAuthCookies(data: any) {
  const cookieStore = await cookies()
  if (data.access_token) {
    cookieStore.set('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }
  if (data.user) {
    cookieStore.set('user_info', JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  }
}

// ------------------ Action Đăng Nhập ----------------------
export async function loginUserAction(email: string, password: string): Promise<ActionResponse> {
  try {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const res = await fetch(`${userBackendUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, message: data.detail || 'Mật khẩu sai hoặc tài khoản không tồn tại' }
    }

    // --- TIẾN HÀNH GHI COOKIE TỪ SERVER ---
    await setAuthCookies(data);

    return {
      success: true,
      message: data.message || 'Đăng nhập thành công',
      user: data.user
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Không thể kết nối đến Server Backend!' }
  }
}
export async function loginGoogleUserAction(googleAccessToken: string): Promise<ActionResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_USER_BACKEND_URL;
    const res = await fetch(`${baseUrl}/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleAccessToken })
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, message: data.detail || 'Đăng nhập Google thất bại' }
    }
    await setAuthCookies(data);
    return { success: true, message: data.message, user: data.user }
  } catch (error) {
    return { success: false, message: 'Không thể kết nối đến hệ thống!' }
  }
}

export async function registerGoogleUserAction(googleAccessToken: string): Promise<ActionResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_USER_BACKEND_URL;
    const res = await fetch(`${baseUrl}/auth/google/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleAccessToken })
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, message: data.detail || 'Đăng ký Google thất bại' }
    }
    return { success: true, message: data.message, user: data.user }
  } catch (error) {
    return { success: false, message: 'Không thể kết nối đến hệ thống!' }
  }
}

