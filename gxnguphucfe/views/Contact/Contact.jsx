"use client";

import { useState } from "react";
import "./Contact.css";
import { useContactInfo } from "@/app/lib/useContactInfo";
import { usePageBanner } from "@/app/lib/usePageBanner";

const ICONS = {
  address: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  ),
};

const subjectOptions = [
  "Xin lễ cầu nguyện",
  "Hỏi đáp về bí tích",
  "Đăng ký giáo lý",
  "Quyên góp / Từ thiện",
  "Khác",
];

export default function ContactPage() {
  const { contact, loading } = useContactInfo();
  const { bannerUrl } = usePageBanner("contact");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: subjectOptions[0],
    message: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    // Handle form submission
    alert("Tin nhắn của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất!");
  };

  const infoCards = [
    {
      id: "address",
      icon: ICONS.address,
      label: "Địa chỉ",
      content: contact.address ? (
        <p className="contact-info-text">{contact.address}</p>
      ) : null,
    },
    {
      id: "phone",
      icon: ICONS.phone,
      label: "Điện thoại",
      content: (contact.phone || contact.emergencyPhone) ? (
        <>
          {contact.phone && <p className="contact-info-text">{contact.phone} (Văn phòng)</p>}
          {contact.emergencyPhone && (
            <p className="contact-info-text">{contact.emergencyPhone} (Khẩn cấp)</p>
          )}
        </>
      ) : null,
    },
    {
      id: "email",
      icon: ICONS.email,
      label: "Email",
      content: contact.email ? (
        <p className="contact-info-text">{contact.email}</p>
      ) : null,
    },
    {
      id: "hours",
      icon: ICONS.clock,
      label: "Giờ làm việc văn phòng",
      content: contact.officeHours ? (
        <div className="contact-hours-table">
          {contact.officeHours.split("|").filter(Boolean).map((line) => (
            <div className="contact-hours-row" key={line}>
              <span>{line.trim()}</span>
            </div>
          ))}
        </div>
      ) : null,
    },
  ].filter((card) => card.content);

  return (
    <div className="contact-page">

      {/* Hero */}
      <div className="contact-hero-wrap">
        <div
          className="contact-hero"
          style={bannerUrl ? {
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%), url('${bannerUrl}')`,
          } : undefined}
        >
          <h1 className="contact-hero-title">Liên hệ</h1>
          <p className="contact-hero-sub">
            Kết nối với cộng đoàn {contact.parishName || "Giáo xứ Ngũ Phúc"}. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="contact-main">
        <div className="contact-container">

          {/* Section heading */}
          <div>
            <div className="contact-section-heading">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="contact-icon-accent">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <h2 className="contact-section-title">Thông tin liên lạc</h2>
            </div>
            <div className="contact-section-divider" />
            <p className="contact-section-desc">
              Vui lòng liên hệ với văn phòng giáo xứ để biết thêm thông tin về các bí tích, giờ lễ, hoặc các hoạt động mục vụ.
            </p>
          </div>

          {/* Two-column grid */}
          <div className="contact-grid">

            {/* Left: Info cards */}
            <div className="contact-info-list">
              {loading ? (
                <p className="contact-info-text">Đang tải thông tin liên hệ…</p>
              ) : (
                infoCards.map((card) => (
                  <div key={card.id} className="contact-info-card">
                    <div className="contact-info-icon">{card.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p className="contact-info-label">{card.label}</p>
                      {card.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Form */}
            <div className="contact-form-card">
              <h3 className="contact-form-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Gửi tin nhắn cho chúng tôi
              </h3>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label className="contact-label" htmlFor="name">Họ và tên</label>
                  <input
                    className="contact-input"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nhập họ tên của bạn"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="email">Email</label>
                  <input
                    className="contact-input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="subject">Chủ đề</label>
                <select
                  className="contact-select"
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                >
                  {subjectOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="message">Nội dung tin nhắn</label>
                <textarea
                  className="contact-textarea"
                  id="message"
                  name="message"
                  placeholder="Nhập nội dung cần trao đổi..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <button className="contact-submit-btn" onClick={handleSubmit}>
                <span>Gửi tin nhắn</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Map section */}
          <div className="contact-map-section">
            <h3 className="contact-map-heading">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
              </svg>
              Bản đồ chỉ đường
            </h3>
            <div className="contact-map-wrap">
              {contact.mapEmbedUrl ? (
                <iframe
                  className="contact-map-bg"
                  src={contact.mapEmbedUrl}
                  title="Bản đồ Giáo xứ"
                  style={{ border: 0, width: "100%", height: "100%" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="contact-map-bg" />
              )}
              <div className="contact-map-overlay">
                <a
                  className="contact-map-btn"
                  href={
                    contact.mapUrl ||
                    (contact.address
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
                      : "https://www.google.com/maps")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="contact-map-pin">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
