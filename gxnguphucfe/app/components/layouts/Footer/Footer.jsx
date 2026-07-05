"use client";
import './Footer.css';
import { FaChurch } from 'react-icons/fa';
import { useContactInfo } from '@/app/lib/useContactInfo';

function Footer() {
  const { contact, loading } = useContactInfo();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="logo-icon">
                <FaChurch size={20} />
              </div>
              {contact.parishName || 'Giáo xứ Ngũ Phúc'}
            </div>
            <p className="footer-description">
              Cộng đoàn chào đón, tận tâm với đức tin, phục vụ và rao giảng Tin Mừng.
            </p>
          </div>

          {/* Links */}
          <div className="footer-section">
            <h4 className="footer-title">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li>
                <a href="/calendar">Lịch lễ</a>
              </li>
              <li>
                <a href="/newsletter">Bản tin Giáo xứ</a>
              </li>
              <li>
                <a href="/donate">Quyên góp trực tuyến</a>
              </li>
              <li>
                <a href="/signup">Đăng ký thành viên</a>
              </li>
              <li>
                <a href="/gallery">Thư viện ảnh</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-contact">
              {loading ? (
                <li>Đang tải…</li>
              ) : (
                <>
                  {contact.address && <li>{contact.address}</li>}
                  {contact.phone && <li>{contact.phone}</li>}
                  {contact.email && <li>{contact.email}</li>}
                </>
              )}
            </ul>
          </div>

          {/* Office Hours */}
          <div className="footer-section">
            <h4 className="footer-title">Giờ Thánh Lễ</h4>
            <div className="footer-hours">
              {(contact.massSchedule || '').split('|').filter(Boolean).map((line) => (
                <p key={line}>{line.trim()}</p>
              ))}
            </div>
            <h4 className="footer-title">Giờ văn phòng</h4>
            <div className="footer-hours">
              {(contact.officeHours || '').split('|').filter(Boolean).map((line) => (
                <p key={line}>{line.trim()}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {contact.parishName || 'Giáo xứ Ngũ Phúc'}. Bảo lưu mọi quyền.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Chính sách bảo mật</a>
            <a href="/terms">Điều khoản dịch vụ</a>
            <a href="/sitemap">Sơ đồ trang</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
