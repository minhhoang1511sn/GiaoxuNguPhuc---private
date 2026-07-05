'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getStoredUser,
  getAccessToken,
  login as apiLogin,
  logout as apiLogout,
  authFetch,
  BASE_URL,
} from '@/app/lib/authClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xác thực lại phiên đăng nhập với server (không chỉ tin vào localStorage),
  // để phát hiện các trường hợp tài khoản vừa bị khoá / đổi vai trò / token
  // đã hết hạn ở phía server.
  const bootstrap = useCallback(async () => {
    const cached = getStoredUser();
    const token = getAccessToken();

    if (!cached || !token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Hiển thị tạm thông tin đã lưu trong lúc chờ xác thực lại với server,
    // để tránh nhấp nháy giao diện.
    setUser(cached);

    try {
      const res = await authFetch(`${BASE_URL}/api/account/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const fresh = await res.json();
        setUser(fresh);
      } else {
        setUser(null);
      }
    } catch {
      // Mất mạng: giữ tạm thông tin cũ thay vì đăng xuất oan.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();

    // Đồng bộ khi authClient tự xoá phiên (refresh token hết hạn) hoặc khi
    // đăng nhập/đăng xuất ở tab khác.
    const onAuthChange = (e) => setUser(e.detail?.user ?? null);
    window.addEventListener('gxnp-auth-change', onAuthChange);
    return () => window.removeEventListener('gxnp-auth-change', onAuthChange);
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    login,
    logout,
    refreshMe: bootstrap,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}
