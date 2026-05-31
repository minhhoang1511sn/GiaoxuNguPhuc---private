"use client";
import styles from './Header.module.css';
import { MdCampaign, MdPerson, MdMenu } from 'react-icons/md';
import { FaChurch } from 'react-icons/fa';
import Link from "next/link"; 

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <FaChurch size={20} />
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
          <Link href="/library">Thư viện</Link>
          <Link href="/register">Đăng ký</Link>
          <Link href="/contact">Liên hệ</Link>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <button><MdCampaign size={20} /></button>
          <button><MdPerson size={20} /></button>
          <button className={styles.menu}><MdMenu size={24} /></button>
        </div>
      </div>
    </header>
  );
}

export default Header;