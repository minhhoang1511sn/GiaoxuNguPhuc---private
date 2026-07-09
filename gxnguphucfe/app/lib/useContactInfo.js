'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, apiFor } from '@/app/lib/apiClient';

export const EMPTY_CONTACT_INFO = {
  id: 0,
  parishName: '',
  address: '',
  phone: '',
  emergencyPhone: '',
  email: '',
  facebook: '',
  youtube: '',
  zalo: '',
  mapEmbedUrl: '',
  mapUrl: '',
  officeHours: '',
  massSchedule: '',
};

// Cache đơn giản trong bộ nhớ phiên làm việc, giống cách làm của useEnumOptions:
// thông tin liên hệ hiếm khi đổi trong lúc app đang chạy, nên chỉ cần gọi API 1 lần
// rồi dùng lại cho mọi trang (Header/Footer/Contact/Library...).
let cachedPromise = null;

function fetchContactInfo() {
  if (!cachedPromise) {
    cachedPromise = fetch(`${API_BASE_URL}/api/contact-info`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tải được thông tin liên hệ từ server');
        return res.json();
      })
      .catch((err) => {
        cachedPromise = null; // cho phép thử lại lần sau nếu lỗi
        throw err;
      });
  }
  return cachedPromise;
}

/** Gọi lại khi admin vừa cập nhật, để các trang khác lấy dữ liệu mới ở lần fetch kế tiếp */
export function invalidateContactInfoCache() {
  cachedPromise = null;
}

/**
 * Hook lấy thông tin liên hệ giáo xứ (địa chỉ, điện thoại, email, mạng xã hội,
 * giờ lễ, giờ văn phòng...) từ backend thay vì viết cứng ở frontend.
 */
export function useContactInfo() {
  const [contact, setContact] = useState(EMPTY_CONTACT_INFO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchContactInfo()
      .then((data) => {
        if (alive) setContact(data);
      })
      .catch((err) => {
        if (alive) setError(err.message ?? 'Lỗi tải thông tin liên hệ');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { contact, loading, error };
}

/* ── API cho trang admin ── */

const apiFetch = apiFor('/api/contact-info');

export const apiGetContactInfoAdmin = () => apiFetch('/admin');

export const apiUpdateContactInfo = (data) =>
  apiFetch('/admin', { method: 'PUT', body: JSON.stringify(data) }).then((result) => {
    invalidateContactInfoCache();
    return result;
  });
