"use client";

import { useState } from "react";
import "./Library.css";
import { useContactInfo } from "@/app/lib/useContactInfo";

const dailyReadings = [
  {
    id: 1,
    badge: "Thường Niên",
    badgeType: "green",
    date: "10 Tháng 10, 2023",
    title: "Thứ Ba Tuần XXVII Thường Niên",
    excerpt: 'Tin Mừng: Lc 10, 38-42 - "Martha, Martha, con lo lắng bối rối về nhiều chuyện quá."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3TrQL06RwRl6POIl24E_wNamUNfHMGDfLKTKZ_8-UGydJnJOp4acCR1xeRaJqEaufG9UhTi6Vx_-ww8IyFqcyqB4mdngRTBlKQ0ipVsIsDns__1H3BmONg4CeXqvrEvdZqQsiVsO2DziiC4mBFoDkoOpo4REg6aGpNASivSu8tQfbrCCG4-7Gjt2SCRT-7_3uceoSvpBC60XDeElO_6jrWThNSde-d2ZiC2mjBA_Wmbleem9vw-pNZDyXCtGNkQXrNBRYQdlxY20",
  },
  {
    id: 2,
    badge: "Lễ Nhớ",
    badgeType: "red",
    date: "09 Tháng 10, 2023",
    title: "Thứ Hai Tuần XXVII - Lễ Thánh Đi-ô-ni-si-ô",
    excerpt: "Bài đọc 1: Gn 1,1 - 2,2.11. Tin Mừng: Lc 10,25-37. \u201cÔng muốn thử thách Chúa Giêsu.\u201d",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbrvLQheOFHJOO8eglTOi2ri70BiVg4grn1_F_tw6i7VZEWtuGF8oKLOcvX3Z6oB7fPwxno5ZptdPEav43kFmYQVmhN0Yfjd1p768sNngY6baVzYA-5pQP7ShhP_hIB4F-aqZldxwBjzBLYpQHcKy2MCBmbYABA5Nn-okXE4ATlN_bUhle9qZwZTY9IMVMtlKGQS4PwZknJvv95EF96Dg7MKKXqc6sa7n6rCiXqzp1TCTsRTBvSbUKhtHAzOOukkdKlnayX_BSbX4",
  },
];

const sermons = [
  { id: 1, title: "CN XXVII Thường Niên A - Vườn Nho Của Chúa", priest: "Lm. Giuse Nguyễn Văn An", duration: "15 phút" },
  { id: 2, title: "CN XXVI Thường Niên A - Hai Người Con", priest: "Lm. Phêrô Trần Văn Bình", duration: "18 phút" },
];

const documents = [
  { id: 1, title: "Đơn Xin Rửa Tội (Trẻ Em)", type: "PDF", size: "1.2 MB", iconType: "pdf" },
  { id: 2, title: "Tờ Khai Hôn Phối", type: "PDF", size: "2.4 MB", iconType: "pdf" },
  { id: 3, title: "Lịch Sinh Hoạt Mục Vụ 2024", type: "DOCX", size: "500 KB", iconType: "doc" },
  { id: 4, title: "Bản Tin Hiệp Thông Tuần Này", type: "PDF", size: "3.1 MB", iconType: "pdf" },
];

const quickLinks = [
  "Lớp Giáo Lý",
  "Ca Đoàn",
  "Hội Đồng Mục Vụ",
  "Lịch Công Giáo",
];

function Accordion({ title, subtitle, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="lib-accordion">
      <button className="lib-accordion-summary" onClick={() => setOpen(!open)}>
        <div className="lib-accordion-left">
          <div className="lib-accordion-icon">{icon}</div>
          <div>
            <h3 className="lib-accordion-title">{title}</h3>
            <p className="lib-accordion-sub">{subtitle}</p>
          </div>
        </div>
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="currentColor"
          className={`lib-accordion-chevron ${open ? "open" : ""}`}
        >
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </button>
      {open && <div className="lib-accordion-body">{children}</div>}
    </div>
  );
}

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const { contact } = useContactInfo();

  return (
    <div className="lib-page">

      {/* Hero */}
      <section className="lib-hero">
        <div className="lib-hero-inner">
          <span className="lib-hero-badge">Thư viện Giáo Xứ</span>
          <h1 className="lib-hero-title">Tài Liệu &amp; Nguồn Tin</h1>
          <p className="lib-hero-sub">
            Nơi lưu trữ các bài giảng, suy niệm lời Chúa hằng ngày và các văn bản hành chính phục vụ cộng đoàn dân Chúa.
          </p>
          <div className="lib-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="lib-search-icon">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng, thông báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lib-search-input"
            />
            <button className="lib-search-btn">Tìm</button>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="lib-main">
        <div className="lib-layout">

          {/* Left: Accordions */}
          <div className="lib-content">
            <div className="lib-section-header">
              <h2 className="lib-section-title">Tài Liệu Mục Vụ</h2>
              <p className="lib-section-sub">Chọn danh mục bên dưới để xem chi tiết các nguồn tài liệu.</p>
            </div>

            <div className="lib-accordions">
              {/* Accordion 1: Daily Readings */}
              <Accordion
                title="Phụng Vụ Lời Chúa (Daily Readings)"
                subtitle="Suy niệm và bài đọc hằng ngày"
                defaultOpen={true}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                  </svg>
                }
              >
                {dailyReadings.map((r) => (
                  <div key={r.id} className="lib-reading-card">
                    <div className="lib-reading-img" style={{ backgroundImage: `url(${r.image})` }} />
                    <div className="lib-reading-body">
                      <div className="lib-reading-meta">
                        <span className={`lib-badge lib-badge-${r.badgeType}`}>{r.badge}</span>
                        <span className="lib-reading-date">{r.date}</span>
                      </div>
                      <h4 className="lib-reading-title">{r.title}</h4>
                      <p className="lib-reading-excerpt">{r.excerpt}</p>
                      <button className="lib-read-more">
                        Đọc Chi Tiết
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </Accordion>

              {/* Accordion 2: Sermons */}
              <Accordion
                title="Bài Giảng Chúa Nhật (Weekly Sermons)"
                subtitle="Video và Audio các bài giảng lễ"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                  </svg>
                }
              >
                {sermons.map((s) => (
                  <div key={s.id} className="lib-sermon-card">
                    <div className="lib-sermon-left">
                      <div className="lib-sermon-play">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="lib-sermon-title">{s.title}</h4>
                        <p className="lib-sermon-meta">{s.priest} • {s.duration}</p>
                      </div>
                    </div>
                    <div className="lib-sermon-actions">
                      <button className="lib-btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                        </svg>
                        Tải Về
                      </button>
                      <button className="lib-btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        </svg>
                        Nghe
                      </button>
                    </div>
                  </div>
                ))}
              </Accordion>

              {/* Accordion 3: Documents */}
              <Accordion
                title="Biểu Mẫu & Văn Bản (Forms & Documents)"
                subtitle="Tờ khai hôn phối, Rửa tội, và thông báo"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.46 0 12.34 0c-1.6 0-3.04.65-4.09 1.68L6 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6.5 8.25L5 14l1.4-1.4 2.1 2.1 5.1-5.1L15 11 8.5 17.25z" />
                  </svg>
                }
              >
                <div className="lib-docs-grid">
                  {documents.map((d) => (
                    <div key={d.id} className="lib-doc-card">
                      <div className={`lib-doc-icon ${d.iconType === "pdf" ? "lib-doc-icon-pdf" : "lib-doc-icon-doc"}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                        </svg>
                      </div>
                      <div className="lib-doc-info">
                        <h5 className="lib-doc-title">{d.title}</h5>
                        <p className="lib-doc-meta">{d.type} • {d.size}</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="lib-doc-download">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="lib-sidebar">
            {/* Mass Times */}
            <div className="lib-widget">
              <div className="lib-widget-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="lib-widget-icon-gold">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                </svg>
                <h3 className="lib-widget-title">Giờ Lễ</h3>
              </div>
              <ul className="lib-mass-list">
                {[
                  { label: "Ngày thường", time: "05:00 & 17:30" },
                  { label: "Thứ Bảy", time: "17:30 (Lễ I CN)" },
                  { label: "Chúa Nhật", time: "05:00, 07:30, 16:00, 18:30" },
                ].map((item, i) => (
                  <li key={i} className={`lib-mass-item ${i < 2 ? "lib-mass-item-border" : ""}`}>
                    <span className="lib-mass-label">{item.label}</span>
                    <span className="lib-mass-time">{item.time}</span>
                  </li>
                ))}
              </ul>
              <button className="lib-widget-btn">Xem Chi Tiết</button>
            </div>

            {/* Contact Widget */}
            <div className="lib-contact-widget">
              <div className="lib-contact-decor" />
              <h3 className="lib-contact-title">Cần giúp đỡ?</h3>
              <p className="lib-contact-sub">Liên hệ với văn phòng giáo xứ nếu bạn cần hỗ trợ về các thủ tục Bí Tích.</p>
              <div className="lib-contact-phone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>{contact.phone || contact.emergencyPhone || 'Đang cập nhật'}</span>
              </div>
              <button className="lib-contact-btn">Gửi Tin Nhắn</button>
            </div>

            {/* Quick Links */}
            <div className="lib-widget">
              <h3 className="lib-widget-title" style={{ marginBottom: "12px" }}>Liên Kết Nhanh</h3>
              <ul className="lib-quicklinks">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <a href="#" className="lib-quicklink">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
