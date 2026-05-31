"use client";
import './Footer.css';
import { FaChurch } from 'react-icons/fa';
function Footer() {
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
              Giáo xứ Ngũ Phúc
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
              <li>Hố Nai 3, Trảng Bom, Đồng Nai</li>
              <li>(028) 3845 6789</li>
              <li>giaoxu@nguphuc.org</li>
            </ul>
          </div>

          {/* Office Hours */}
          <div className="footer-section">
            <h4 className="footer-title">Giờ Thánh Lễ</h4>
            <div className="footer-hours">
              <p>Thứ 2 - Thứ 4 - Thứ 6: 4:30</p>
              <p>Thứ 3 - Thứ 5: 4:30 - 18:00</p>
              <p>Thứ 7: 4:30 - 18:00</p>
              <p>Chúa nhật: 4:30 - 7h30 -17:00</p>
            </div>
            <h4 className="footer-title">Giờ văn phòng</h4>
            <div className="footer-hours">
              <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
              <p>Thứ 7: 8:00 - 12:00</p>
              <p>Chúa nhật: Đóng cửa</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2023 Giáo xứ Ngũ Phúc. Bảo lưu mọi quyền.</p>
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
