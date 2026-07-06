'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './layout.module.css';
import { authFetch } from '@/app/lib/authClient';
import { useAuth } from '@/app/contexts/AuthContext';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

// Số bài viết / đơn đăng ký tối đa lấy về để cộng dồn lượt xem, bình luận...
// (BE không có sẵn endpoint tổng hợp riêng nên FE tự cộng từ danh sách).
const AGGREGATE_PAGE_SIZE = 200;

async function safeGet(path) {
  try {
    const res = await authFetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function fmtNumber(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('vi-VN');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Bài viết: Admin thấy toàn bộ, tài khoản đoàn thể chỉ thấy bài của mình
      // (BE tự lọc theo MinistryId ở API /api/posts/admin).
      const postsQuery = `page=1&pageSize=${AGGREGATE_PAGE_SIZE}&sortBy=createdAt&sortOrder=desc`;
      const postsData = await safeGet(`/api/posts/admin?${postsQuery}`);
      const postItems = postsData?.items ?? [];
      const postsTotal = postsData?.totalCount ?? postItems.length;
      const totalViews = postItems.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
      const totalComments = postItems.reduce((sum, p) => sum + (p.commentCount ?? 0), 0);

      const statsList = [
        { icon: '✦', value: postsTotal, label: 'Bài viết', color: '#6ee7b7', href: '/admin/post' },
        { icon: '◈', value: totalComments, label: 'Bình luận', color: '#93c5fd', href: '/admin/post' },
        { icon: '◐', value: totalViews, label: 'Lượt xem', color: '#fcd34d', href: '/admin/post' },
      ];

      let registrationItems = [];

      if (isAdmin) {
        // Các số liệu toàn hệ thống — chỉ Admin mới có quyền gọi các API này.
        const [accountsData, coursesData, clergyData, registrationsData] = await Promise.all([
          safeGet('/api/account?page=1&pageSize=1'),
          safeGet('/api/catechism-classes/admin'),
          safeGet('/api/clergy-members/admin'),
          safeGet(`/api/catechism-registrations/admin?page=1&pageSize=${AGGREGATE_PAGE_SIZE}&sortBy=createdAt&sortOrder=desc`),
        ]);

        registrationItems = registrationsData?.items ?? [];

        statsList.push(
          { icon: '◎', value: accountsData?.totalCount ?? null, label: 'Tài khoản', color: '#c4b5fd', href: '/admin/accounts' },
          { icon: '◆', value: Array.isArray(coursesData) ? coursesData.length : null, label: 'Khoá học', color: '#f9a8d4', href: '/admin/course' },
          { icon: '◇', value: Array.isArray(clergyData) ? clergyData.length : null, label: 'Giáo sĩ', color: '#86efac', href: '/admin/clergy' },
          { icon: '◉', value: registrationsData?.totalCount ?? null, label: 'Đơn đăng ký', color: '#fca5a5', href: '/admin/dang-ki' },
        );
      }

      setStats(statsList);

      // Hoạt động gần đây: gộp bài viết mới nhất + đơn đăng ký mới nhất, sắp theo thời gian.
      const postActivities = postItems.slice(0, 8).map((p) => ({
        action: `Bài viết "${p.title}" ${p.status === 'Published' ? 'đã đăng' : 'được cập nhật'}`,
        user: p.authorName || 'Admin',
        date: p.createdAt,
        color: '#6ee7b7',
      }));
      const regActivities = registrationItems.slice(0, 8).map((r) => ({
        action: `Đơn đăng ký học giáo lý mới (${r.classType})`,
        user: r.fullName,
        date: r.createdAt,
        color: '#c4b5fd',
      }));

      const merged = [...postActivities, ...regActivities]
        .filter((a) => a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

      setActivities(merged);
    } catch (err) {
      setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const quickActions = [
    { icon: '✦', label: 'Thêm bài viết', href: '/admin/post' },
    ...(isAdmin
      ? [
          { icon: '◆', label: 'Thêm khoá học', href: '/admin/course' },
          { icon: '◇', label: 'Thêm giáo sĩ', href: '/admin/clergy' },
          { icon: '◉', label: 'Xem đăng ký', href: '/admin/dang-ki' },
        ]
      : []),
  ];

  return (
    <div className={styles.dashboard}>

      {error && <div className={styles.dashboardError}>{error}</div>}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {(loading ? Array.from({ length: isAdmin ? 7 : 3 }) : stats).map((s, i) => (
          <Link
            href={s?.href ?? '#'}
            key={s?.label ?? i}
            className={`${styles.statCard} ${styles.statCardLink}`}
          >
            <span className={styles.statIcon} style={{ color: s?.color ?? '#ccc' }}>{s?.icon ?? '◌'}</span>
            <div className={styles.statBody}>
              {loading ? (
                <span className={styles.statValueSkeleton} />
              ) : (
                <span className={styles.statValue}>{fmtNumber(s.value)}</span>
              )}
              <span className={styles.statLabel}>{s?.label ?? ''}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom */}
      <div className={styles.dashboardBottom}>

        {/* Activity */}
        <div className={styles.activityCard}>
          <p className={styles.cardHeading}>Hoạt động gần đây</p>
          {loading ? (
            <p className={styles.emptyState}>Đang tải...</p>
          ) : activities.length === 0 ? (
            <p className={styles.emptyState}>Chưa có hoạt động nào.</p>
          ) : (
            <ul className={styles.activityList}>
              {activities.map((a, i) => (
                <li key={i} className={styles.activityItem}>
                  <span className={styles.activityDot} style={{ background: a.color }} />
                  <div className={styles.activityBody}>
                    <span className={styles.activityAction}>{a.action}</span>
                    <span className={styles.activityMeta}>{a.user} · {timeAgo(a.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickCard}>
          <p className={styles.cardHeading}>Thao tác nhanh</p>
          <div className={styles.quickGrid}>
            {quickActions.map((q) => (
              <Link key={q.label} href={q.href} className={styles.quickBtn}>
                <span className={styles.quickIcon}>{q.icon}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
