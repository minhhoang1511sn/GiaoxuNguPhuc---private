"use client";

import { useState } from "react";
import "./Calendar.css";

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const calendarDays = [
  // Prev month
  { day: 25, currentMonth: false, events: [] },
  { day: 26, currentMonth: false, events: [] },
  { day: 27, currentMonth: false, events: [] },
  { day: 28, currentMonth: false, events: [] },
  { day: 29, currentMonth: false, events: [] },
  { day: 30, currentMonth: false, events: [] },
  // Current month
  { day: 1, currentMonth: true, isSunday: false, events: [{ type: "mass", label: "17:30 - Lễ Chiều" }] },
  { day: 2, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }, { type: "mass", label: "17:30 - Lễ Chiều" }] },
  { day: 3, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }, { type: "activity", label: "19:00 - Họp HĐMV" }] },
  { day: 4, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }] },
  { day: 5, currentMonth: true, isToday: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }, { type: "sacrament", label: "16:00 - Giải Tội" }] },
  { day: 6, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }] },
  { day: 7, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }] },
  { day: 8, currentMonth: true, isSunday: true, events: [{ type: "special", label: "Chúa Nhật XXVII TN" }, { type: "mass", label: "05:00 - Lễ Nhất" }, { type: "mass", label: "07:30 - Lễ Thiếu Nhi" }, { type: "mass", label: "17:00 - Lễ Chiều" }] },
  { day: 9, currentMonth: true, events: [{ type: "mass", label: "05:00 - Lễ Sáng" }, { type: "sacrament", label: "09:00 - Rửa Tội" }] },
  { day: 10, currentMonth: true, events: [] },
  { day: 11, currentMonth: true, events: [] },
  { day: 12, currentMonth: true, events: [] },
  { day: 13, currentMonth: true, events: [{ type: "special", label: "Kỷ Niệm Cung Hiến" }, { type: "mass", label: "18:00 - Lễ Trọng" }] },
  { day: 14, currentMonth: true, events: [] },
  { day: 15, currentMonth: true, isSunday: true, events: [{ type: "mass", label: "05:00 - Lễ Nhất" }, { type: "mass", label: "07:30 - Lễ Thiếu Nhi" }] },
  { day: 16, currentMonth: true, events: [] },
  { day: 17, currentMonth: true, events: [] },
  { day: 18, currentMonth: true, events: [] },
  { day: 19, currentMonth: true, events: [] },
  { day: 20, currentMonth: true, events: [{ type: "activity", label: "19:30 - Ca Đoàn" }] },
  { day: 21, currentMonth: true, events: [] },
  { day: 22, currentMonth: true, isSunday: true, events: [] },
  { day: 23, currentMonth: true, events: [] },
  { day: 24, currentMonth: true, events: [] },
  { day: 25, currentMonth: true, events: [] },
  { day: 26, currentMonth: true, events: [] },
  { day: 27, currentMonth: true, events: [] },
  { day: 28, currentMonth: true, events: [] },
  { day: 29, currentMonth: true, isSunday: true, events: [] },
  { day: 30, currentMonth: true, events: [] },
  { day: 31, currentMonth: true, events: [{ type: "special", label: "Lễ Các Thánh" }] },
  // Next month
  { day: 1, currentMonth: false, events: [] },
  { day: 2, currentMonth: false, events: [] },
  { day: 3, currentMonth: false, events: [] },
  { day: 4, currentMonth: false, events: [] },
];

export default function CalendarPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [view, setView] = useState("month");
  const [selectedEvent] = useState({
    title: "Thánh Lễ Sáng",
    date: "5/10/2023",
    time: "05:00 - 06:00",
    priest: "Cha Giuse Nguyễn Văn A",
    liturgy: "Thứ 5 Tuần XXVI Thường Niên",
    location: "Nhà Thờ Lớn",
  });

  return (
    <div className="cal-page">
      <main className="cal-main">
        <div className="cal-container">

          {/* Page Heading & Filters */}
          <div className="cal-heading">
            <div>
              <h1 className="cal-title">Lịch Phụng Vụ</h1>
              <p className="cal-subtitle">
                Theo dõi lịch thánh lễ, cử hành bí tích và các sự kiện cộng đoàn trong tháng.
              </p>
            </div>
            <div className="cal-filters">
              <div className="cal-filter-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                </svg>
                <span>Lọc:</span>
              </div>
              {[
                { id: "mass", label: "Thánh Lễ", cls: "filter-mass" },
                { id: "sacrament", label: "Bí Tích", cls: "filter-sacrament" },
                { id: "activity", label: "Sinh Hoạt", cls: "filter-activity" },
                { id: "special", label: "Sự Kiện", cls: "filter-special" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`cal-filter-btn ${f.cls} ${activeFilter === f.id ? "active" : ""}`}
                  onClick={() => setActiveFilter(activeFilter === f.id ? "all" : f.id)}
                >
                  <span className="cal-filter-dot" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Layout */}
          <div className="cal-layout">

            {/* Main Calendar */}
            <div className="cal-calendar">
              {/* Toolbar */}
              <div className="cal-toolbar">
                <div className="cal-toolbar-left">
                  <button className="cal-nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button className="cal-nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                  <h2 className="cal-month-title">Tháng 10 2023</h2>
                </div>
                <div className="cal-toolbar-right">
                  <button className="cal-today-btn">Hôm nay</button>
                  <div className="cal-view-toggle">
                    {["month", "week", "day"].map((v) => (
                      <button
                        key={v}
                        className={`cal-view-btn ${view === v ? "active" : ""}`}
                        onClick={() => setView(v)}
                      >
                        {v === "month" ? "Tháng" : v === "week" ? "Tuần" : "Ngày"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="cal-dow-header">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="cal-dow-cell">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="cal-grid">
                {calendarDays.map((d, i) => (
                  <div
                    key={i}
                    className={`cal-day ${!d.currentMonth ? "cal-day-other" : ""} ${d.isToday ? "cal-day-today-wrap" : ""}`}
                  >
                    <span className={`cal-day-num ${d.isToday ? "cal-day-today" : ""} ${d.isSunday ? "cal-day-sunday" : ""}`}>
                      {d.day}
                    </span>
                    <div className="cal-events">
                      {d.events.map((ev, j) => (
                        <div key={j} className={`cal-event cal-event-${ev.type}`}>
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="cal-sidebar">

              {/* Mass Schedule */}
              <div className="cal-widget">
                <h3 className="cal-widget-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="cal-widget-icon">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                  </svg>
                  Giờ Lễ Thường Xuyên
                </h3>
                <div className="cal-schedule">
                  <div>
                    <p className="cal-schedule-label">Ngày Thường (T2 - T7)</p>
                    <div className="cal-time-chips">
                      <span className="cal-chip cal-chip-blue">05:00</span>
                      <span className="cal-chip cal-chip-blue">17:30</span>
                    </div>
                  </div>
                  <div className="cal-divider" />
                  <div>
                    <p className="cal-schedule-label">Chúa Nhật</p>
                    <div className="cal-time-chips">
                      <span className="cal-chip cal-chip-gold">05:00</span>
                      <span className="cal-chip cal-chip-gold">07:30</span>
                      <span className="cal-chip cal-chip-gold">16:30</span>
                      <span className="cal-chip cal-chip-gold">18:30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Detail */}
              <div className="cal-widget cal-event-detail">
                <div className="cal-detail-bar" />
                <div className="cal-detail-body">
                  <span className="cal-detail-tag">Chi tiết sự kiện</span>
                  <h3 className="cal-detail-title">{selectedEvent.title}</h3>
                  <div className="cal-detail-meta">
                    <div className="cal-detail-meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="cal-detail-meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                      </svg>
                      <span>{selectedEvent.time}</span>
                    </div>
                  </div>
                  <div className="cal-detail-rows">
                    <div className="cal-detail-row">
                      <div className="cal-detail-row-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="cal-detail-row-label">Chủ tế</p>
                        <p className="cal-detail-row-value">{selectedEvent.priest}</p>
                      </div>
                    </div>
                    <div className="cal-detail-row">
                      <div className="cal-detail-row-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="cal-detail-row-label">Phụng vụ Lời Chúa</p>
                        <p className="cal-detail-row-value">{selectedEvent.liturgy}</p>
                      </div>
                    </div>
                    <div className="cal-detail-row">
                      <div className="cal-detail-row-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="cal-detail-row-label">Địa điểm</p>
                        <p className="cal-detail-row-value">{selectedEvent.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="cal-detail-footer">
                    <button className="cal-detail-btn">Xem chi tiết &amp; bài đọc</button>
                  </div>
                </div>
              </div>

              {/* Image Widget */}
              <div className="cal-img-widget">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxBuwZQImo878IFYF7RWX5kB5HWrwZIQpfJS5B1kG7ObviwLBuYm48-Eqq8TCT6bOE89f9G7i0fRlhdTVSUc7wVfiI7Q-xErR6yrXkrw_VJ8s4-7h6c10pPH2mT1oF5I75porgJrisI2kT9YBuB_a_0Pe53mtERtrSZN2Y1TK9s_7GlJEzkVNhERIamSnwG2gSAvdPXMNe8l6rINV3tvPG0QcuEAQQuOiKnTuTfAo4jtX0S9kMxjQmjYszrj9sWatZga1iTGSAT6A"
                  alt="Nhà thờ"
                  className="cal-img"
                />
                <div className="cal-img-overlay">
                  <p className="cal-img-title">Đăng ký Rửa Tội</p>
                  <p className="cal-img-sub">Tìm hiểu thủ tục và đặt lịch hẹn</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
