"use client";

import { useState } from "react";
import "./Register.css";

const sacraments = [
  {
    id: 1,
    title: "Rửa Tội",
    desc: "Đăng ký rửa tội cho trẻ sơ sinh và trẻ nhỏ. Cần chuẩn bị giấy khai sinh và thông tin người đỡ đầu.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTRv5oA-Cl8dYB1YPKGne8Dg0gAInNAyyPqIpG7EI6hx4iQoovJIBthM6NIZA021KvRDnFdZAwyPKsorlnquVmtHYVobscjkMPB-SqkRZCMmrxACaBAzCDTW-yok_AEOVd9WNY8bffNN-_SQgxqavMklvq0YBWjvZjx2M8K5xcbHB7iJ6pme-sVSYpYVOLuI1x8Jq_-6tzYeyM4o2RPXstG0_kxsdh4fmMhUJSWnPhnwVYw2BgV9lhM880l8QBHB26iV3EgFFQ6ao",
  },
  {
    id: 2,
    title: "Hôn Phối",
    desc: "Đặt lịch gặp cha xứ và đăng ký lớp giáo lý hôn nhân. Vui lòng đăng ký trước ngày cưới 6 tháng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcm8hKtzKAy9lJTcDnSK-za2UiTO_0rQucMuVlJlse0mGdIo6SDPjzS9lXTI4GCW3Q07HZa6jJFphTT-5nfIyPQyGSGJMvn3EJmbVL_wXPfU3e9wVykSqZM_exCDrVB199rFeh4NyVBgxcd4KajR27IK7CGKXaqVuoICweTtINWu5kbcqWcCss7SPAh7BHA0td3BanFX8m9laqsjhreIVUL79wpFA-j1oIYMJmB0jJZE1agt-ZuBufoeiWoABNcj9OOlA-H7kdz3s",
  },
];

const educationCards = [
  {
    id: 1,
    iconClass: "reg-edu-icon-blue",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
      </svg>
    ),
    title: "Đăng ký Giáo Lý",
    desc: "Ghi danh cho các lớp Xưng Tội Lần Đầu, Thêm Sức và Bao Đồng niên khóa mới.",
    action: "Xem chi tiết",
  },
  {
    id: 2,
    iconClass: "reg-edu-icon-orange",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 1l-5 5v11l5-4.5V1zM1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5V6c-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6z" />
      </svg>
    ),
    title: "Dự Tòng (RCIA)",
    desc: "Lớp tìm hiểu đạo Công giáo dành cho người lớn. Khóa học bắt đầu vào tháng 9.",
    action: "Ghi danh",
  },
  {
    id: 3,
    iconClass: "reg-edu-icon-purple",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    title: "Tham gia Hội Đoàn",
    desc: "Ca đoàn, Hội các bà mẹ, Legio Mariae... Hãy cùng tham gia phục vụ cộng đoàn.",
    action: "Đăng ký ngay",
  },
];

const donationAmounts = ["100.000đ", "200.000đ", "500.000đ"];

export default function RegisterPage() {
  const [search, setSearch] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);

  return (
    <div className="reg-page">

      {/* Hero */}
      <div className="reg-hero-wrap">
        <div className="reg-hero">
          <div className="reg-hero-text">
            <h1 className="reg-hero-title">Cổng Đăng Ký Trực Tuyến</h1>
            <p className="reg-hero-sub">
              Kênh chính thức cho các Bí tích, Lớp giáo lý và đóng góp xây dựng Giáo xứ Ngũ Phúc. Nhanh chóng, tiện lợi và bảo mật.
            </p>
          </div>
          <div className="reg-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="reg-search-icon">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm biểu mẫu (VD: Rửa tội, Hôn phối...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="reg-search-input"
            />
            <button className="reg-search-btn">Tìm kiếm</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="reg-main">
        <div className="reg-container">

          {/* Section: Sacraments */}
          <section className="reg-section">
            <div className="reg-section-heading">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="reg-icon-accent">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <h2 className="reg-section-title">Các Bí Tích &amp; Phụng Vụ</h2>
            </div>
            <div className="reg-sacraments-grid">
              {sacraments.map((s) => (
                <div key={s.id} className="reg-sacrament-card">
                  <div className="reg-sacrament-img" style={{ backgroundImage: `url(${s.image})` }} />
                  <div className="reg-sacrament-body">
                    <div>
                      <h3 className="reg-sacrament-title">{s.title}</h3>
                      <p className="reg-sacrament-desc">{s.desc}</p>
                    </div>
                    <button className="reg-sacrament-link">
                      Bắt đầu đăng ký
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Education */}
          <section className="reg-section">
            <div className="reg-section-heading">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="reg-icon-accent">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              </svg>
              <h2 className="reg-section-title">Giáo Dục &amp; Hội Đoàn</h2>
            </div>
            <div className="reg-edu-grid">
              {educationCards.map((c) => (
                <div key={c.id} className="reg-edu-card">
                  <div className={`reg-edu-icon ${c.iconClass}`}>{c.icon}</div>
                  <h3 className="reg-edu-title">{c.title}</h3>
                  <p className="reg-edu-desc">{c.desc}</p>
                  <a href="#" className="reg-edu-btn">{c.action}</a>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Donation + Feedback */}
          <section className="reg-bottom-grid">

            {/* Donation */}
            <div className="reg-donation">
              <div className="reg-donation-decor" />
              <div className="reg-donation-inner">
                <div className="reg-donation-left">
                  <div className="reg-donation-header">
                    <div className="reg-donation-header-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                      </svg>
                    </div>
                    <h2 className="reg-donation-title">Đóng Góp Xây Dựng</h2>
                  </div>
                  <p className="reg-donation-desc">
                    Sự đóng góp của quý vị giúp duy trì các hoạt động mục vụ và xây dựng nhà Chúa ngày càng khang trang hơn. Xin Chúa trả công bội hậu.
                  </p>
                  <div className="reg-donation-amounts">
                    {donationAmounts.map((amt) => (
                      <button
                        key={amt}
                        className={`reg-amount-btn ${selectedAmount === amt ? "active" : ""}`}
                        onClick={() => setSelectedAmount(amt)}
                      >
                        {amt}
                      </button>
                    ))}
                    <button className="reg-amount-btn-white">Nhập số khác</button>
                  </div>
                </div>
                <div className="reg-qr-box">
                  <div className="reg-qr-placeholder">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM13 21h2v-2h-2z" />
                    </svg>
                  </div>
                  <span className="reg-qr-label">Quét mã QR</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="reg-feedback">
              <div className="reg-feedback-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <h3 className="reg-feedback-title">Ý kiến &amp; Góp ý</h3>
                <p className="reg-feedback-desc">
                  Chúng tôi luôn lắng nghe mọi tâm tư nguyện vọng của giáo dân để xây dựng cộng đoàn tốt hơn.
                </p>
              </div>
              <button className="reg-feedback-btn">Gửi ý kiến</button>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
