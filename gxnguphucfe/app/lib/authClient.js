'use client';

// ─────────────────────────────────────────────────────────────────────────
// Quản lý AccessToken / RefreshToken ở phía frontend.
//
// - AccessToken (JWT, hạn ngắn ~15 phút): gửi kèm mọi request cần xác thực
//   qua header Authorization: Bearer <token>.
// - RefreshToken (chuỗi ngẫu nhiên, hạn dài ~7 ngày): dùng để xin cặp
//   token mới khi AccessToken hết hạn, KHÔNG cần đăng nhập lại.
//
// Lưu trong localStorage để phiên đăng nhập còn giữ sau khi tải lại trang.
// ─────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

const ACCESS_TOKEN_KEY = 'gxnp_access_token';
const REFRESH_TOKEN_KEY = 'gxnp_refresh_token';
const USER_KEY = 'gxnp_user';

const isBrowser = () => typeof window !== 'undefined';

/* ════════════════════════════════
   Đọc / ghi localStorage
════════════════════════════════ */

export function getAccessToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession({ accessToken, refreshToken, user }) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('gxnp-auth-change', { detail: { user } }));
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent('gxnp-auth-change', { detail: { user: null } }));
}

/* ════════════════════════════════
   Đọc lỗi trả về từ backend (ApiError { message })
════════════════════════════════ */
async function readErrorMessage(res, fallback) {
  try {
    const data = await res.clone().json();
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title; // lỗi validate mặc định của ASP.NET
  } catch {
    // không phải JSON, bỏ qua
  }
  return fallback || `HTTP ${res.status}`;
}

/* ════════════════════════════════
   Đăng nhập / Đăng ký / Đăng xuất / Refresh
════════════════════════════════ */

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Đăng nhập thất bại'));
  }

  const data = await res.json();
  setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  return data.user;
}

export async function register(fullName, email, password, confirmPassword) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, confirmPassword }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Đăng ký thất bại'));
  }

  // Tài khoản mới đăng ký phải chờ Admin duyệt — backend KHÔNG trả về
  // accessToken/refreshToken nữa, nên không tự đăng nhập ở đây.
  return res.json(); // { message, user }
}

export async function logout() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();

  if (refreshToken && accessToken) {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Server có lỗi hay mất mạng cũng không sao — vẫn xoá phiên ở FE.
    }
  }

  clearSession();
}

// Gộp các lệnh gọi refresh đồng thời lại thành 1, tránh trường hợp nhiều
// request 401 cùng lúc đều tự đi refresh và làm RefreshToken bị xoay vòng
// (revoke) nhiều lần liên tiếp.
let refreshPromise = null;

async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Không có refresh token');

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readErrorMessage(res, 'Phiên đăng nhập đã hết hạn'));
        }
        const data = await res.json();
        setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/* ════════════════════════════════
   authFetch — wrapper thay cho fetch() thông thường:
   - Tự gắn header Authorization: Bearer <AccessToken>
   - Nếu server trả 401 (AccessToken hết hạn) -> tự động refresh 1 lần rồi
     gọi lại request; nếu refresh cũng thất bại -> xoá phiên & báo cho
     AuthContext biết để chuyển hướng về trang đăng nhập.
════════════════════════════════ */
export async function authFetch(url, options = {}) {
  const buildHeaders = (token) => ({
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const accessToken = getAccessToken();
  let res = await fetch(url, { ...options, headers: buildHeaders(accessToken) });

  if (res.status === 401 && getRefreshToken()) {
    try {
      const session = await refreshSession();
      res = await fetch(url, { ...options, headers: buildHeaders(session.accessToken) });
    } catch {
      clearSession();
    }
  }

  return res;
}

export { BASE_URL };
