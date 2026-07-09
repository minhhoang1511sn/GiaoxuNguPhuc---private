'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, apiFor } from '@/app/lib/apiClient';
import { resolveImageUrl } from '@/app/lib/uploadImage';


// Danh sách các trang được phép cấu hình ảnh bìa — phải khớp với
// AllowedPageKeys ở BE (PageSettingService) và PAGES ở trang quản trị
// (app/admin/banners/page.jsx).
export const BANNER_PAGE_KEYS = ['about', 'ministries', 'contact', 'news', 'register', 'calendar'];

// Cache đơn giản trong bộ nhớ phiên làm việc theo pageKey, giống cách làm của
// useContactInfo: ảnh bìa hiếm khi đổi trong lúc app đang chạy nên chỉ cần
// gọi API 1 lần cho mỗi trang rồi dùng lại.
const cachedPromises = new Map();

function fetchPageSetting(pageKey) {
  if (!cachedPromises.has(pageKey)) {
    const promise = fetch(`${API_BASE_URL}/api/page-settings/${encodeURIComponent(pageKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tải được ảnh bìa của trang');
        return res.json();
      })
      .catch((err) => {
        cachedPromises.delete(pageKey); // cho phép thử lại lần sau nếu lỗi
        throw err;
      });
    cachedPromises.set(pageKey, promise);
  }
  return cachedPromises.get(pageKey);
}

/** Gọi lại khi admin vừa cập nhật ảnh bìa, để trang công khai lấy dữ liệu mới ở lần fetch kế tiếp */
export function invalidatePageBannerCache(pageKey) {
  if (pageKey) {
    cachedPromises.delete(pageKey);
  } else {
    cachedPromises.clear();
  }
}

/**
 * Hook lấy ảnh bìa (banner) hiện tại của một trang công khai (about, ministries,
 * contact...) từ backend. Trả về null nếu trang chưa được admin cấu hình ảnh —
 * phía component tự quyết định ảnh mặc định để dùng khi đó.
 */
export function usePageBanner(pageKey) {
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPageSetting(pageKey)
      .then((data) => {
        if (alive) setBannerUrl(data?.bannerImageUrl ? resolveImageUrl(data.bannerImageUrl) : null);
      })
      .catch(() => {
        if (alive) setBannerUrl(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pageKey]);

  return { bannerUrl, loading };
}

/* ── API cho trang admin ── */

const apiFetch = apiFor('/api/page-settings');

/** Lấy ảnh bìa của tất cả các trang đã cấu hình — dùng cho trang quản trị */
export const apiGetAllPageSettings = () => apiFetch('');

/** Lấy ảnh bìa hiện tại của một trang — dùng để nạp lại preview trong trang quản trị */
export const apiGetPageSetting = (pageKey) => apiFetch(`/${encodeURIComponent(pageKey)}`);

/**
 * Admin cập nhật ảnh bìa của một trang. Truyền bannerImageUrl = null để gỡ ảnh
 * bìa, quay về ảnh mặc định phía FE.
 */
export const apiUpdatePageBanner = (pageKey, bannerImageUrl) =>
  apiFetch(`/${encodeURIComponent(pageKey)}`, {
    method: 'PUT',
    body: JSON.stringify({ bannerImageUrl }),
  }).then((result) => {
    invalidatePageBannerCache(pageKey);
    return result;
  });
