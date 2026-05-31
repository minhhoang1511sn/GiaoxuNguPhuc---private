'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

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
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>

        {/* HEADER */}
        <div className={styles.textCenter}>
          <h2>Đăng nhập</h2>
          <p>Chào mừng bạn đến với Giáo Xứ Ngũ Phúc</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

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
          <button type="submit" className={styles.btn}>
            Đăng nhập
          </button>
        </form>

        {/* FOOTER */}
        <div className={styles.textCenter}>
          <span>Chưa có tài khoản?</span>{' '}
          <Link href="/register">Đăng ký</Link>
        </div>

      </div>
    </div>
  );
}