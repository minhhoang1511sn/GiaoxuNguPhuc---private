'use client';

import Link from 'next/link';
import styles from './layout.module.css';

const stats = [
  { icon: '✦', value: '128', label: 'Bài viết', delta: '+12', color: '#6ee7b7', href: '/admin/post' },
  { icon: '◈', value: '340', label: 'Bình luận', delta: '+28', color: '#93c5fd', href: '/admin/comment' },
  { icon: '◎', value: '56',  label: 'Tài khoản', delta: '+4',  color: '#c4b5fd', href: '/admin/accounts' },
  { icon: '◆', value: '14',  label: 'Khoá học',  delta: '+1',  color: '#f9a8d4', href: '/admin/course' },
  { icon: '◐', value: '8,291', label: 'Lượt xem', delta: '+203', color: '#fcd34d', href: '/admin/luot-xem' },
  { icon: '◇', value: '7',   label: 'Giáo sĩ',   delta: '',    color: '#86efac', href: '/admin/clergy' },
];

const activities = [
  { action: 'Bài viết mới được đăng', user: 'Admin', time: '09:12', color: '#6ee7b7' },
  { action: 'Tài khoản mới đăng ký', user: 'Nguyễn Văn A', time: '08:45', color: '#93c5fd' },
  { action: 'Bình luận mới trên bài "Lễ Phục Sinh"', user: 'Trần Thị B', time: '08:30', color: '#c4b5fd' },
  { action: 'Khoá học "Giáo lý căn bản" được cập nhật', user: 'Admin', time: '07:55', color: '#f9a8d4' },
  { action: 'Thông báo realtime được gửi', user: 'Hệ thống', time: '07:20', color: '#fcd34d' },
];

const quickActions = [
  { icon: '✦', label: 'Thêm bài viết', href: '/admin/post/new' },
  { icon: '◆', label: 'Thêm khoá học', href: '/admin/course' },
  { icon: '◑', label: 'Gửi thông báo', href: '/admin/notification' },
  { icon: '◇', label: 'Thêm giáo sĩ', href: '/admin/clergy/new' },
];

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <Link href={s.href} key={s.label} className={`${styles.statCard} ${styles.statCardLink}`}>
            <span className={styles.statIcon} style={{ color: s.color }}>{s.icon}</span>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
            {s.delta && (
              <span className={styles.statDelta} style={{ color: s.color }}>{s.delta}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Bottom */}
      <div className={styles.dashboardBottom}>

        {/* Activity */}
        <div className={styles.activityCard}>
          <p className={styles.cardHeading}>Hoạt động gần đây</p>
          <ul className={styles.activityList}>
            {activities.map((a, i) => (
              <li key={i} className={styles.activityItem}>
                <span className={styles.activityDot} style={{ background: a.color }} />
                <div className={styles.activityBody}>
                  <span className={styles.activityAction}>{a.action}</span>
                  <span className={styles.activityMeta}>{a.user} · {a.time}</span>
                </div>
              </li>
            ))}
          </ul>
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