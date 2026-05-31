'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

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
    } catch (err) {
      console.error("Không kết nối được API:", err);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h2>Đăng ký</h2>
        <p>Chào mừng bạn đến với Giáo Xứ Ngũ Phúc</p>

        <form onSubmit={handleSubmit}>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Họ tên</label>
            <input
              type="text"
              className={styles.formControl}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={styles.formControl}
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mật khẩu</label>
            <input
              type="password"
              className={styles.formControl}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nhập lại mật khẩu</label>
            <input
              type="password"
              className={styles.formControl}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.btn}>
            Đăng ký
          </button>
        </form>

        <div className={styles.textCenter}>
          <span>Đã có tài khoản?</span>{' '}
          <Link href="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}