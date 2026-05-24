'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './admin.css';

const menuItems = [
  {
    group: 'Nội dung',
    items: [
      { href: '/admin', icon: '▪', label: 'Tổng quan' },
      { href: '/admin/bai-viet', icon: '✦', label: 'Bài viết', badge: 'CRUD' },
      { href: '/admin/comment', icon: '◈', label: 'Bình luận', badge: 'CRUD' },
    ],
  },
  {
    group: 'Người dùng',
    items: [
      { href: '/admin/dang-ki', icon: '◉', label: 'Đăng ký', badge: 'CRUD' },
      { href: '/admin/accounts', icon: '◎', label: 'Tài khoản', badge: 'CRUD' },
    ],
  },
  {
    group: 'Học tập & Giáo sĩ',
    items: [
      { href: '/admin/course', icon: '◆', label: 'Khoá học', badge: 'CRUD' },
      { href: '/admin/clergy', icon: '◇', label: 'Giáo sĩ', badge: 'CRUD' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { href: '/admin/luot-xem', icon: '◐', label: 'Đếm lượt xem' },
      { href: '/admin/notification', icon: '◑', label: 'Thông báo', badge: 'Realtime' },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">✝</div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">Ngũ Phúc</span>
              <span className="logo-sub">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {menuItems.map((group) => (
            <div key={group.group} className="nav-group">
              {!collapsed && <span className="nav-group-label">{group.group}</span>}
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? 'active' : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className={`nav-badge ${item.badge === 'Realtime' ? 'realtime' : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {active && <span className="active-bar" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
          {!collapsed && (
            <Link href="/auth/login" className="logout-btn">
              <span>⏻</span> Đăng xuất
            </Link>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {menuItems.flatMap(g => g.items).find(i => i.href === pathname)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-time">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="admin-avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}