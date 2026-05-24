'use client';

// export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import './register.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    alert("Mật khẩu nhập lại không khớp!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5109/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data || "Đăng ký thất bại");
      return;
    }

    alert("Đăng ký thành công!");
    // router.push('/auth/login');
  } catch (err) {
    console.error("Không kết nối được API:", err);
  }
};
  return (
    <div className="auth-page">
      <div className="auth-card shadow-lg">
        <h2 className="fw-bold text-center mb-2">Đăng ký</h2>
        <p className="text-muted text-center mb-4">
          Chào mừng bạn đến với Giáo Xứ Ngũ Phúc
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Họ tên</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Nhập lại mật khẩu</label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2">
            Đăng ký
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted">Đã có tài khoản?</span>{' '}
          <Link href="/auth/login"   className="fw-semibold text-decoration-none">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
