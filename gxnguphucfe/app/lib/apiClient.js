'use client';

/**
 * API client dùng chung cho toàn bộ frontend.
 *
 * TRƯỚC ĐÂY: gần như mỗi trang admin (accounts, post, clergy, ministry,
 * history, course, dang-ki, lich-le, page.jsx...) và vài lib/use*.js đều tự
 * khai báo lại y hệt:
 *   const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';
 *   async function apiFetch(path, opts) { ...parse lỗi JSON... }
 * → ~13 bản sao gần như giống hệt nhau, sửa 1 chỗ (vd. đổi cách parse lỗi)
 *   phải nhớ sửa ở toàn bộ 13 nơi.
 *
 * BÂY GIỜ: mọi nơi chỉ cần import từ đây. Xem README ở cuối file để biết
 * cách dùng cho từng tình huống (trang admin, trang public, dashboard).
 */

import { authFetch, BASE_URL } from '@/app/lib/authClient';

// Dùng lại đúng 1 nguồn duy nhất (authClient.js) thay vì đọc lại biến môi
// trường ở đây lần nữa — tránh 2 hằng số khác tên nhưng cùng giá trị.
export const API_BASE_URL = BASE_URL;

/** Parse response lỗi từ ASP.NET (ProblemDetails hoặc { message }) thành 1 chuỗi dễ hiển thị. */
async function parseErrorMessage(res) {
  const text = await res.text().catch(() => '');
  if (!text) return `HTTP ${res.status}`;
  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.title || text;
  } catch {
    return text; // không phải JSON (vd. lỗi HTML từ proxy) -> giữ nguyên text
  }
}

/**
 * Gọi API có xác thực (tự đính JWT qua authFetch). Ném lỗi khi response không ok
 * — dùng cho các thao tác chính (submit form, tải dữ liệu bắt buộc phải có).
 *
 * @param {string} path - đường dẫn đầy đủ sau API_BASE_URL, vd '/api/posts/5'
 */
export async function apiFetch(path, opts = {}) {
  const res = await authFetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = new Error(await parseErrorMessage(res));
    err.status = res.status; // cho phép nơi gọi phân biệt vd. 404 (không tìm thấy) vs lỗi khác
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Tạo 1 hàm gọi API rút gọn, gắn sẵn tiền tố cho 1 nhóm endpoint cụ thể.
 * Dùng khi 1 trang chỉ thao tác trên đúng 1 resource (đa số trang admin).
 *
 * const apiFetch = apiFor('/api/account');
 * apiFetch('/me')                          // GET  /api/account/me
 * apiFetch('/me', { method: 'PUT', ... })  // PUT  /api/account/me
 */
export function apiFor(basePath) {
  return (path = '', opts) => apiFetch(`${basePath}${path}`, opts);
}

/**
 * Giống apiFetch nhưng KHÔNG ném lỗi — trả về null nếu thất bại.
 * Dùng cho các widget "phụ" mà 1 API lỗi không nên làm sập cả trang
 * (vd. thống kê ở dashboard, các khối gợi ý ở trang chủ).
 */
export async function safeApiFetch(path, opts = {}) {
  try {
    const res = await authFetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) return null;
    if (res.status === 204) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Gọi API công khai (không đính JWT) — dùng cho các trang public (trang chủ,
 * tin tức, liên hệ...) hiển thị dữ liệu mà ai cũng xem được, không cần đăng nhập.
 */
export async function publicFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = new Error(await parseErrorMessage(res));
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Giống publicFetch nhưng không ném lỗi — trả về null nếu thất bại. */
export async function safePublicFetch(path, opts = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Tạo 1 hàm gọi API công khai rút gọn, gắn sẵn tiền tố cho 1 nhóm endpoint —
 * bản "không cần đăng nhập" của apiFor(). Dùng ở các trang public (Tin tức,
 * Đăng ký giáo lý, Lịch phụng vụ...) để tránh mỗi trang tự khai báo lại
 * `const BASE_URL = ...` + hàm apiFetch riêng.
 *
 * const apiFetch = publicFor('/api/posts');
 * apiFetch('/featured?take=3')   // GET /api/posts/featured?take=3
 */
export function publicFor(basePath) {
  return (path = '', opts) => publicFetch(`${basePath}${path}`, opts);
}
