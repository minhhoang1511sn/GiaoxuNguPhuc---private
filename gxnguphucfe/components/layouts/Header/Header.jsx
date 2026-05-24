"use client";
import './Header.css';
import { MdCampaign, MdPerson, MdMenu } from 'react-icons/md';
import { FaChurch } from 'react-icons/fa';
import Link from "next/link"; 

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <FaChurch size={20} />
          </div>
          <span className="logo-text">Giáo xứ Ngũ Phúc</span>
        </div>

        {/* Menu */}
        <nav className="nav">
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
        <div className="actions">
          <button>
            <MdCampaign size={20} />
          </button>
          <button>
            <MdPerson size={20} />
          </button>
          <button className="menu">
            <MdMenu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
