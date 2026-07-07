'use client';

import { authFetch } from '@/app/lib/authClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

async function apiFetch(path, opts = {}) {
  const res = await authFetch(`${BASE_URL}/api/account${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.title || message;
    } catch {
      // không phải JSON, bỏ qua
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** GET /api/account/me - Thông tin tài khoản đang đăng nhập */
export const apiGetMyProfile = () => apiFetch('/me');

/** PUT /api/account/me - Cập nhật họ tên / ảnh đại diện của chính mình */
export const apiUpdateMyProfile = ({ fullName, avatarUrl }) =>
  apiFetch('/me', {
    method: 'PUT',
    body: JSON.stringify({ fullName, avatarUrl: avatarUrl || null }),
  });

/** PUT /api/account/change-password - Tự đổi mật khẩu (thu hồi các phiên đăng nhập khác) */
export const apiChangeMyPassword = ({ currentPassword, newPassword, confirmNewPassword }) =>
  apiFetch('/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });
