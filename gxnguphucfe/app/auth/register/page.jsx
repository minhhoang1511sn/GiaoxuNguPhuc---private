'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { BASE_URL } from '@/app/lib/authClient';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || 'Đăng ký thất bại');
        return;
      }

      // Tài khoản mới đăng ký phải chờ Admin duyệt — KHÔNG còn tự động đăng
      // nhập nữa. Admin sẽ nhận được email thông báo để duyệt hoặc từ chối.
      setSubmitted(true);
    } catch (err) {
      console.error('Không kết nối được API:', err);
      setError('Không kết nối được server');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <h2>Đăng ký thành công</h2>
          <p>
            Tài khoản của bạn đã được tạo và đang <strong>chờ Admin duyệt</strong>.
            Bạn sẽ có thể đăng nhập ngay sau khi được duyệt.
          </p>
          <div className={styles.textCenter}>
            <Link href="/auth/login">Quay lại trang đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h2>Đăng ký</h2>
        <p>Chào mừng bạn đến với Giáo Xứ Ngũ Phúc</p>

        <form onSubmit={handleSubmit}>

          {error && <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{error}</p>}

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

          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className={styles.textCenter}>
          <span>Đã có tài khoản?</span>{' '}
          <Link href="/auth/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

