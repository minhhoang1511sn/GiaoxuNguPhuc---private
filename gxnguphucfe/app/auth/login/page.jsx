'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './Login.css';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  // 👉 đảm bảo chỉ render ở client (fix hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5109/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data || "Đăng nhập thất bại");
        return;
      }

      router.push('/admin');
    } catch (err) {
      console.error("Không kết nối được API:", err);
      alert("Không kết nối được server");
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="login-card shadow-lg">
        {/* HEADER */}
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">Đăng nhập</h2>
          <p className="text-muted">
            Chào mừng bạn đến với Giáo Xứ Ngũ Phúc
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control email-input"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control password-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* OPTIONS */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Link href="#" className="text-decoration-none small">
              Quên mật khẩu?
            </Link>
          </div>

          {/* BUTTON */}
          <button type="submit" className="btn btn-primary w-100 py-2">
            Đăng nhập
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-4">
          <span className="text-muted">Chưa có tài khoản?</span>{' '}
          <Link
            href="/auth/register"
            className="fw-semibold text-decoration-none"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
