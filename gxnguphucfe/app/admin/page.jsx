'use client';
import Link from 'next/link';
export default function AdminDashboard() {
  const stats = [
    { label: 'Bài viết', value: '128', delta: '+12', icon: '✦', color: '#6ee7b7', href: '/admin/post' },
    { label: 'Bình luận', value: '340', delta: '+28', icon: '◈', color: '#93c5fd', href: '/admin/binh-luan' },
    { label: 'Tài khoản', value: '56', delta: '+4', icon: '◎', color: '#fbbf24', href: '/admin/tai-khoan' },
    { label: 'Khoá học', value: '14', delta: '+1', icon: '◆', color: '#f9a8d4', href: '/admin/khoa-hoc' },
    { label: 'Lượt xem', value: '8,291', delta: '+203', icon: '◐', color: '#a5b4fc', href: null },
    { label: 'Giáo sĩ', value: '7', delta: '—', icon: '◇', color: '#fdba74', href: '/admin/giao-si' },
  ];

  const recentActivity = [
    { time: '09:12', action: 'Bài viết mới được đăng', user: 'Admin', type: 'post' },
    { time: '08:45', action: 'Tài khoản mới đăng ký', user: 'Nguyễn Văn A', type: 'user' },
    { time: '08:30', action: 'Bình luận mới trên bài "Lễ Phục Sinh"', user: 'Trần Thị B', type: 'comment' },
    { time: '07:55', action: 'Khoá học "Giáo lý căn bản" được cập nhật', user: 'Admin', type: 'course' },
    { time: '07:20', action: 'Thông báo realtime được gửi', user: 'Hệ thống', type: 'notify' },
  ];

  const typeColor = { post: '#6ee7b7', user: '#93c5fd', comment: '#fbbf24', course: '#f9a8d4', notify: '#a5b4fc' };

  return (
    <div className="dashboard">
      {/* Stats grid */}
      <section className="stats-grid">
        {stats.map((s) => {
          const card = (
            <div className={`stat-card${s.href ? ' stat-card--link' : ''}`} key={s.label}>
              <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
              <div className="stat-body">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
              <span className="stat-delta" style={{ color: s.delta === '—' ? '#6b7280' : '#6ee7b7' }}>
                {s.delta}
              </span>
            </div>
          );

          return s.href ? (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              {card}
            </Link>
          ) : card;
        })}
      </section>

      {/* Bottom row */}
      <div className="dashboard-bottom">
        {/* Activity */}
        <section className="activity-card">
          <h2 className="card-heading">Hoạt động gần đây</h2>
          <ul className="activity-list">
            {recentActivity.map((a, i) => (
              <li key={i} className="activity-item">
                <span className="activity-dot" style={{ background: typeColor[a.type] }} />
                <div className="activity-body">
                  <span className="activity-action">{a.action}</span>
                  <span className="activity-meta">{a.user} · {a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="quick-card">
          <h2 className="card-heading">Thao tác nhanh</h2>
          <div className="quick-grid">
            {[
              { label: 'Thêm bài viết', icon: '✦', href: '/admin/post/new' },
              { label: 'Thêm khoá học', icon: '◆', href: '/admin/course/new' },
              { label: 'Gửi thông báo', icon: '◑', href: '/admin/notification/new' },
              { label: 'Thêm giáo sĩ', icon: '◇', href: '/admin/clergy/new' },
            ].map((q) => (
              <a key={q.label} href={q.href} className="quick-btn">
                <span className="quick-icon">{q.icon}</span>
                <span>{q.label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}