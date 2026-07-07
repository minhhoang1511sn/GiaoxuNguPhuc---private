"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { MdPerson, MdLogout, MdDashboard, MdArticle, MdEdit } from 'react-icons/md';
import { FaChurch } from 'react-icons/fa';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from "next/image";
import { resolveImageUrl } from '@/app/lib/uploadImage';

function Header() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = user?.role === 'Admin';
  // Tài khoản role User CHỈ quản lý được bài viết khi đã được Admin gán vào 1 đoàn thể.
  const canManageMinistryPosts = !isAdmin && !!user?.ministryId;

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  const avatarLetter = (user?.fullName || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Image
              src="/images/logo.jpg"
              alt="Logo Giáo xứ Ngũ Phúc"
              width={44}
              height={44}
              className={styles.logoImage} /* Thêm class này */
            />
          </div>
          <span className={styles.logoText}>Giáo xứ Ngũ Phúc</span>
        </div>
        {/* Menu */}
        <nav className={styles.nav}>
          <Link href="/">Trang chủ</Link>
          <Link href="/about">Giới thiệu</Link>
          <Link href="/news">Tin tức</Link>
          <Link href="/calendar">Lịch</Link>
          <Link href="/ministry">Đoàn thể</Link>
          <Link href="/register">Đăng ký</Link>
          <Link href="/contact">Liên hệ</Link>

          {/* Đã đăng nhập -> hiện thẳng link tới khu vực quản trị trên nav chính,
              không phải mở dropdown mới thấy. Admin vào /admin (toàn quyền),
              tài khoản đoàn thể vào /admin/post (chỉ quản lý bài viết của mình). */}
          {!loading && isAuthenticated && (
            <Link
              href={isAdmin ? '/admin' : canManageMinistryPosts ? '/admin/post' : '/admin'}
              className={styles.navAdminLink}
            >
              <MdDashboard size={16} /> {isAdmin ? 'Trang quản trị' : canManageMinistryPosts ? 'Quản lý bài viết' : 'Trang quản trị'}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Chưa xong bước kiểm tra đăng nhập -> tạm ẩn nút để tránh nhấp nháy
              giữa 2 trạng thái (chưa login / đã login) trước khi AuthContext xác thực xong */}
          {loading ? (
            <button disabled style={{ opacity: 0.5 }}><MdPerson size={20} /></button>
          ) : !isAuthenticated ? (
            // Chưa đăng nhập -> bấm vào đi thẳng tới trang login
            <button onClick={() => router.push('/auth/login')} title="Đăng nhập">
              <MdPerson size={20} />
            </button>
          ) : (
            <div className={styles.userMenuWrap} ref={menuRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setMenuOpen((v) => !v)}
                title={user.fullName}
              >
                {user.avatarUrl ? (
                  <Image
                    src={resolveImageUrl(user.avatarUrl)}
                    alt={user.fullName}
                    width={40}
                    height={40}
                    className={styles.avatarImg}
                    unoptimized
                  />
                ) : (
                  avatarLetter
                )}
              </button>

              {menuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <div className={styles.userDropdownAvatar}>
                      {user.avatarUrl ? (
                        <Image
                          src={resolveImageUrl(user.avatarUrl)}
                          alt={user.fullName}
                          width={44}
                          height={44}
                          className={styles.avatarImg}
                          unoptimized
                        />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                    <div className={styles.userDropdownInfo}>
                      <div className={styles.userDropdownName}>{user.fullName}</div>
                      <div className={styles.userDropdownRole}>
                        {isAdmin
                          ? 'Quản trị viên'
                          : user.ministryId
                            ? `Đoàn thể: ${user.ministryName ?? '—'}`
                            : 'Chưa thuộc đoàn thể nào'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.userDropdownDivider} />

                  {isAdmin && (
                    // Admin: toàn quyền thêm / sửa / xoá mọi thứ trong hệ thống
                    <Link href="/admin" className={styles.userDropdownItem} onClick={() => setMenuOpen(false)}>
                      <MdDashboard size={18} /> Trang quản trị
                    </Link>
                  )}

                  {canManageMinistryPosts && (
                    // User có đoàn thể: chỉ được đăng bài & quản lý bài viết của đoàn thể mình
                    <Link href="/admin/post" className={styles.userDropdownItem} onClick={() => setMenuOpen(false)}>
                      <MdArticle size={18} /> Quản lý bài viết đoàn thể
                    </Link>
                  )}

                  {/* Mọi tài khoản đều sửa được thông tin cá nhân của chính mình */}
                  <Link href="/admin/profile" className={styles.userDropdownItem} onClick={() => setMenuOpen(false)}>
                    <MdEdit size={18} /> Chỉnh sửa tài khoản
                  </Link>

                  <div className={styles.userDropdownDivider} />

                  <button className={`${styles.userDropdownItem} ${styles.userDropdownLogout}`} onClick={handleLogout}>
                    <MdLogout size={18} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;