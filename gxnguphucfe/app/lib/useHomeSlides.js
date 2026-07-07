'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/app/lib/authClient';
import { resolveImageUrl } from '@/app/lib/uploadImage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

// Cache đơn giản trong bộ nhớ phiên làm việc, giống cách làm của usePageBanner:
// danh sách ảnh slideshow hiếm khi đổi trong lúc app đang chạy nên chỉ cần gọi
// API 1 lần rồi dùng lại.
let cachedPromise = null;

function fetchHomeSlides() {
  if (!cachedPromise) {
    cachedPromise = fetch(`${BASE_URL}/api/home-slides`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tải được ảnh slideshow trang chủ');
        return res.json();
      })
      .catch((err) => {
        cachedPromise = null; // cho phép thử lại lần sau nếu lỗi
        throw err;
      });
  }
  return cachedPromise;
}

/** Gọi lại khi admin vừa thêm/xoá/sắp xếp lại ảnh slideshow, để trang chủ lấy dữ liệu mới ở lần fetch kế tiếp */
export function invalidateHomeSlidesCache() {
  cachedPromise = null;
}

/**
 * Hook lấy danh sách ảnh slideshow trang chủ (đã sắp theo thứ tự hiển thị) từ
 * backend. Trả về mảng rỗng nếu chưa cấu hình hoặc lỗi tải — phía component tự
 * quyết định ảnh mặc định để dùng khi đó.
 */
export function useHomeSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchHomeSlides()
      .then((data) => {
        if (alive) {
          setSlides(Array.isArray(data) ? data.map((s) => ({ ...s, imageUrl: resolveImageUrl(s.imageUrl) })) : []);
        }
      })
      .catch(() => {
        if (alive) setSlides([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { slides, loading };
}

/* ── API cho trang admin ── */

async function apiFetch(path, opts = {}) {
  const res = await authFetch(`${BASE_URL}/api/home-slides${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed?.message || parsed?.title || text;
    } catch {
      // không phải JSON, giữ nguyên text
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Lấy toàn bộ ảnh slideshow trang chủ — dùng cho trang quản trị */
export const apiGetHomeSlides = () => apiFetch('');

/** Admin thêm mới một ảnh vào slideshow trang chủ */
export const apiAddHomeSlide = (imageUrl) =>
  apiFetch('', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, displayOrder: 0 }),
  }).then((result) => {
    invalidateHomeSlidesCache();
    return result;
  });

/** Admin xoá một ảnh khỏi slideshow trang chủ */
export const apiDeleteHomeSlide = (id) =>
  apiFetch(`/${id}`, { method: 'DELETE' }).then((result) => {
    invalidateHomeSlidesCache();
    return result;
  });

/** Admin sắp xếp lại thứ tự hiển thị các ảnh slideshow trang chủ */
export const apiReorderHomeSlides = (orderedIds) =>
  apiFetch('/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  }).then((result) => {
    invalidateHomeSlidesCache();
    return result;
  });
