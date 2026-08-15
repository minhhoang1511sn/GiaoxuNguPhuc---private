'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image'; // Import thẻ Image của Next.js
import { resolveImageUrl } from '@/app/lib/uploadImage';

const fullMenuItems = [
  {
    group: 'Nội dung',
    items: [
      { href: '/admin', icon: '▪', label: 'Tổng quan' },
      { href: '/admin/post', icon: '✦', label: 'Bài viết', badge: '' },
      { href: '/admin/banners', icon: '◈', label: 'Banners', badge: '' },
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
      { href: '/admin/history', icon: '❖', label: 'Lược sử giáo xứ', badge: '' },
      { href: '/admin/ministry', icon: '❋', label: 'Đoàn thể', badge: '' },
      { href: '/admin/lich-le', icon: '📅', label: 'Lịch lễ riêng', badge: '' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { href: '/admin/contact-info', icon: '☏', label: 'Thông tin liên hệ' },
      { href: '/admin/messages', icon: '✉', label: 'Tin nhắn liên hệ', badge: '' },
    ],
  },
  {
    group: 'Tài khoản',
    items: [
      { href: '/admin/profile', icon: '⚙', label: 'Hồ sơ của tôi', badge: '' },
    ],
  },
];

// Tài khoản role User (có đoàn thể) chỉ được thấy 2 mục này: xem tổng quan cơ bản
// và quản lý bài viết của chính đoàn thể mình — không đụng được vào tài khoản,
// đoàn thể, giáo sĩ, hệ thống... (những khu vực đó vẫn chỉ Admin toàn quyền).
const ministryMenuItems = [
  {
    group: 'Đoàn thể của tôi',
    items: [
      { href: '/admin', icon: '▪', label: 'Tổng quan' },
      { href: '/admin/post', icon: '✦', label: 'Bài viết', badge: '' },
    ],
  },
  {
    group: 'Tài khoản',
    items: [
      { href: '/admin/profile', icon: '⚙', label: 'Hồ sơ của tôi', badge: '' },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [dateStr, setDateStr] = useState('');

  // Giao diện Dark/Light của khu vực quản trị — lưu lựa chọn vào localStorage
  // để giữ nguyên qua các lần truy cập sau. Mặc định 'dark' (giao diện gốc).
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = window.localStorage.getItem('gxnp-admin-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('gxnp-admin-theme', next);
      return next;
    });
  };

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  // Bảo vệ khu vực /admin:
  // - Bất kỳ tài khoản nào đã đăng nhập đều vào được /admin — việc GIỚI HẠN
  //   tính năng theo vai trò nằm ở menu hiển thị + API BE (không phải ở việc
  //   chặn vào hẳn khu vực quản trị).
  // - Admin: toàn quyền, thấy hết menu, được thêm/sửa/xoá mọi thứ.
  // - User: chỉ thấy menu rút gọn ("Tổng quan" + "Bài viết"), và chỉ thao tác
  //   được trên bài viết CỦA ĐOÀN THỂ MÌNH — BE tự chặn theo MinistryId ở API
  //   (nếu tài khoản User chưa được gán đoàn thể, API bài viết sẽ trả 403,
  //   trang /admin/post tự hiển thị thông báo tương ứng thay vì chặn cả layout).
  // - Chưa đăng nhập: không vào được, về thẳng /auth/login.
  const isAdmin = user?.role === 'Admin';
  const isMinistryUser = user?.role === 'User' && !!user?.ministryId;
  const menuItems = isAdmin ? fullMenuItems : ministryMenuItems;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // suppressHydrationWarning: một số extension trình duyệt (Bitdefender, AVG...)
  // chèn thuộc tính bis_skin_checked vào các thẻ div lồng sâu TRƯỚC khi React
  // hydrate xong, khiến React báo hydration mismatch giả (nội dung 2 bên thực
  // ra giống hệt nhau, chỉ là extension làm lệch cây DOM). suppressHydrationWarning
  // ở layout gốc (html/body) không lan xuống được các thẻ con sâu như thẻ này.
  if (loading || !user) {
    return (
      <div className={styles.authGate} data-admin-theme={theme} suppressHydrationWarning>
        {loading ? 'Đang kiểm tra đăng nhập...' : 'Đang chuyển hướng...'}
      </div>
    );
  }

  const avatarLetter = (user.fullName || user.email || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.adminShell} data-admin-theme={theme}>
      {/* SIDEBAR */}
      <aside className={`${styles.adminSidebar} ${collapsed ? styles.collapsed : ''}`}>

        {/* Logo */}
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIconWrap}>
            <Image
              src="/images/logo.ico"
              alt="Logo Giáo xứ Ngũ Phúc"
              width={40}
              height={40}
              className={styles.logoImage}
            />
          </div>
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
          <button
            type="button"
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {!collapsed && (
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              <span>⏻</span> Đăng xuất
            </button>
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
            <Link href="/" className={styles.backToSiteBtn} title="Về trang người dùng">
              <span aria-hidden="true">↩</span> Về trang người dùng
            </Link>
            <div className={styles.topbarTime}>{dateStr}</div>
            <Link href="/admin/profile" className={styles.topbarUserLink} title="Hồ sơ của tôi">
              <span className={styles.topbarUserName}>{user.fullName}</span>
              <div className={styles.adminAvatar} title={user.email}>
                {user.avatarUrl ? (
                  <Image src={resolveImageUrl(user.avatarUrl)} alt={user.fullName} width={32} height={32} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized />
                ) : (
                  avatarLetter
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Thông báo cho tài khoản User chưa được Admin gán đoàn thể — vẫn cho
            vào khu vực quản trị nhưng chưa thao tác được bài viết cho tới khi
            được gán, tránh việc bấm vào "Bài viết" rồi mới thấy lỗi 403. */}
        {!isAdmin && !isMinistryUser && (
          <div className={styles.authGate} style={{ margin: '16px 24px 0' }}>
            Tài khoản của bạn chưa được gán đoàn thể nào. Vui lòng liên hệ Admin để được gán đoàn thể trước khi quản lý bài viết.
          </div>
        )}

        {/* Content */}
        <main className={styles.adminContent}>{children}</main>
      </div>
    </div>
  );
}