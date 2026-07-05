import { authFetch } from '@/app/lib/authClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

/**
 * Upload 1 file ảnh từ máy người dùng lên server.
 * @param {File} file - File ảnh chọn từ input type="file"
 * @param {string} folder - Thư mục phân loại lưu trên server, ví dụ "clergy", "posts"
 * @returns {Promise<string>} Đường dẫn tương đối (ví dụ "/uploads/clergy/abc123.jpg")
 */
export async function uploadImage(file, folder = 'general') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`${BASE_URL}/api/uploads?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {
      // ignore parse error, use default message
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Ghép đường dẫn ảnh (tương đối hoặc tuyệt đối) thành URL đầy đủ để hiển thị <img>.
 * - Ảnh mới upload trả về đường dẫn tương đối bắt đầu bằng "/" -> nối với BASE_URL của API.
 * - Ảnh cũ (dữ liệu có sẵn) là link tuyệt đối (http/https) -> giữ nguyên.
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return url;
}
