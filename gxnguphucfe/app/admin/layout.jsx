'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const menuItems = [
  {
    group: 'Nội dung',
    items: [
      { href: '/admin', icon: '▪', label: 'Tổng quan' },
      { href: '/admin/post', icon: '✦', label: 'Bài viết', badge: '' },
      { href: '/admin/comment', icon: '◈', label: 'Bình luận', badge: '' },
    ],
  },
  {
    group: 'Người dùng',
    items: [
      { href: '/admin/dang-ki', icon: '◉', label: 'Đăng ký', badge: '' },
      { href: '/admin/accounts', icon: '◎', label: 'Tài khoản', badge: '' },
    ],
  },
  {
    group: 'Học tập & Giáo sĩ',
    items: [
      { href: '/admin/course', icon: '◆', label: 'Khoá học', badge: '' },
      { href: '/admin/clergy', icon: '◇', label: 'Giáo sĩ', badge: '' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { href: '/admin/luot-xem', icon: '◐', label: 'Đếm lượt xem' },
      { href: '/admin/notification', icon: '◑', label: 'Thông báo', badge: '' },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className={styles.adminShell}>
      {/* SIDEBAR */}
      <aside className={`${styles.adminSidebar} ${collapsed ? styles.collapsed : ''}`}>

        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>✝</div>
          {!collapsed && (
            <div>
              <span className={styles.logoTitle}>Ngũ Phúc</span>
              <span className={styles.logoSub}>Admin Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          {menuItems.map((group) => (
            <div key={group.group} className={styles.navGroup}>
              {!collapsed && (
                <span className={styles.navGroupLabel}>{group.group}</span>
              )}
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.active : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={`${styles.navBadge} ${item.badge === 'Realtime' ? styles.realtime : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {active && <span className={styles.activeBar} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
          {!collapsed && (
            <Link href="/login" className={styles.logoutBtn}>
              <span>⏻</span> Đăng xuất
            </Link>
          )}
        </div>
      </aside>

      {/* MAIN — margin-left cập nhật theo collapsed state */}
      <div
        className={styles.adminMain}
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        }}
      >
        {/* Topbar */}
        <header className={styles.adminTopbar}>
          <h1 className={styles.pageTitle}>
            {menuItems.flatMap((g) => g.items).find((i) => i.href === pathname)?.label ?? 'Dashboard'}
          </h1>
          <div className={styles.topbarRight}>
            <div className={styles.topbarTime}>{dateStr}</div>
            <div className={styles.adminAvatar}>A</div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.adminContent}>{children}</main>
      </div>
    </div>
  );
}