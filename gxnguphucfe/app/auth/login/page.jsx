'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đã đăng nhập sẵn (ví dụ mở lại tab) -> vào thẳng /admin, khỏi phải đăng
  // nhập lại. Mọi tài khoản đã đăng nhập đều được vào /admin — việc giới hạn
  // tính năng theo vai trò (Admin toàn quyền, User theo đoàn thể) nằm ở bên
  // trong AdminLayout, không phải ở bước điều hướng này.
  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/admin');
    }
  }, [loading, user, router]);

  if (!mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      // Không tự router.push ở đây nữa — useEffect phía trên sẽ tự điều hướng
      // ngay khi "user" trong AuthContext được cập nhật, tránh việc gọi
      // điều hướng 2 lần cùng lúc (1 lần ở đây, 1 lần ở effect) gây xung đột.
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>

        {/* HEADER */}
        <div className={styles.textCenter}>
          <h2>Đăng nhập</h2>
          <p>Chào mừng bạn đến với Giáo Xứ Ngũ Phúc</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* EMAIL */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={`${styles.formControl} ${styles.emailInput}`}
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mật khẩu</label>
            <input
              type="password"
              className={`${styles.formControl} ${styles.passwordInput}`}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* OPTIONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                className={styles.formCheckInput}
                type="checkbox"
                id="remember"
              />
              <label className={styles.formCheckLabel} htmlFor="remember">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Link href="#">Quên mật khẩu?</Link>
          </div>

          {/* BUTTON */}
          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* FOOTER */}
        <div className={styles.textCenter}>
          <span>Chưa có tài khoản?</span>{' '}
          <Link href="/auth/register">Đăng ký</Link>
        </div>

      </div>
    </div>
  );
}
