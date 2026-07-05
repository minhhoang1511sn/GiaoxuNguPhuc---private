'use client';

import { useState, useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

const EMPTY = {
  classTypes: [],
  postCategories: [],
  postStatuses: [],
  ministryCategories: [],
  clergyTypes: [],
  registrationStatuses: [],
};

// Cache đơn giản trong bộ nhớ phiên làm việc: danh sách enum gần như không đổi
// trong lúc app đang chạy, nên chỉ cần gọi API 1 lần rồi dùng lại cho mọi trang.
let cachedPromise = null;

function fetchEnums() {
  if (!cachedPromise) {
    cachedPromise = fetch(`${BASE_URL}/api/meta/enums`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tải được danh sách enum từ server');
        return res.json();
      })
      .catch((err) => {
        cachedPromise = null; // cho phép thử lại lần sau nếu lỗi
        throw err;
      });
  }
  return cachedPromise;
}

/**
 * Hook lấy toàn bộ danh sách enum (loại lớp giáo lý, chuyên mục bài viết,
 * trạng thái bài viết, loại đoàn thể, chức vụ giáo sĩ, trạng thái đăng ký)
 * từ backend thay vì viết cứng ở frontend.
 *
 * Mỗi danh sách trả về dạng: [{ key: 'KhaiTam', value: 0, label: 'Khai Tâm' }, ...]
 */
export function useEnumOptions() {
  const [enums, setEnums] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEnums()
      .then((data) => {
        if (alive) setEnums(data);
      })
      .catch((err) => {
        if (alive) setError(err.message ?? 'Lỗi tải danh sách enum');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { enums, loading, error };
}

/** Tiện ích: map [{key,value,label}] -> { key: label } */
export function toLabelMapByKey(list) {
  return Object.fromEntries(list.map((o) => [o.key, o.label]));
}

/** Tiện ích: map [{key,value,label}] -> { key: value } */
export function toValueMapByKey(list) {
  return Object.fromEntries(list.map((o) => [o.key, o.value]));
}

/** Tiện ích: map [{key,value,label}] -> { value: label } (value dạng number) */
export function toLabelMapByValue(list) {
  return Object.fromEntries(list.map((o) => [o.value, o.label]));
}
