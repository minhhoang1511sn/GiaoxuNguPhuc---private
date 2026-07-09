'use client';

import { apiFor } from '@/app/lib/apiClient';

const apiFetch = apiFor('/api/account');

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
