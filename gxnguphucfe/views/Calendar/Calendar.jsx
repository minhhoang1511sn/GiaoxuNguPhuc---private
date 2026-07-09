"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./Calendar.module.css";
import { useContactInfo } from "@/app/lib/useContactInfo";
import { usePageBanner } from "@/app/lib/usePageBanner";
import { getLiturgicalInfo, SEASON_COLOR } from "@/app/lib/liturgicalCalendar";
import { API_BASE_URL } from "@/app/lib/apiClient";

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// Cập nhật ID/CLS để map chính xác với CSS Modules
const FILTERS = [
  { id: "mass", label: "Thánh Lễ", cls: "filterMass" },
  { id: "sacrament", label: "Bí Tích", cls: "filterSacrament" },
  { id: "activity", label: "Sinh Hoạt", cls: "filterActivity" },
  { id: "special", label: "Sự Kiện", cls: "filterSpecial" },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateKey(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function fmtFull(y, m, d) {
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildMonthGrid(year, month, eventsByDate) {
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0 = CN
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const today = new Date();
  const isTodayCell = (y, m, d) =>
    today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d;

  const cells = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d);
    const liturgical = getLiturgicalInfo(year, month, d);
    cells.push({
      day: d,
      currentMonth: true,
      key,
      isToday: isTodayCell(year, month, d),
      isSunday: new Date(year, month - 1, d).getDay() === 0,
      liturgical,
      events: eventsByDate[key] || [],
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, currentMonth: false, events: [] });
  }

  return cells;
}

// Modal Component
function DayDetailModal({ dateLabel, liturgical, events, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.detailTag}>{dateLabel}</span>
            {liturgical?.label && (
              <h2
                className={styles.detailTitle}
                style={{ color: SEASON_COLOR[liturgical.season] || "#111418", fontSize: "1.15rem", marginTop: 6 }}
              >
                {liturgical.label}
              </h2>
            )}
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div className={styles.modalBody}>
          {events.length === 0 ? (
            <p className={styles.emptyState}>
              Không có sự kiện riêng nào của giáo xứ trong ngày này.
            </p>
          ) : (
            events.map((ev, i) => {
              // Helper để lấy đúng class màu dựa trên type sự kiện
              const eventTypeClass = styles[`eventItem${ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}`];

              return (
                <div key={i}>
                  <h3 className={styles.detailTitle}>{ev.raw.title}</h3>
                  <div className={styles.detailMeta} style={{ flexWrap: "wrap" }}>
                    {ev.raw.timeLabel && (
                      <div className={styles.detailMetaItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                        </svg>
                        <span>{ev.raw.timeLabel}</span>
                      </div>
                    )}
                    {/* Badge màu sự kiện nhỏ ở góc báo hiệu loại sự kiện */}
                    <span className={`${styles.eventItem} ${eventTypeClass}`}>
                       {ev.type === "mass" ? "Thánh Lễ" : ev.type === "sacrament" ? "Bí Tích" : ev.type === "activity" ? "Sinh Hoạt" : "Sự Kiện"}
                    </span>
                  </div>

                  {ev.raw.location && (
                    <div className={styles.detailRow}>
                      <div className={styles.detailRowIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className={styles.detailRowLabel}>Địa điểm</p>
                        <p className={styles.detailRowValue}>{ev.raw.location}</p>
                      </div>
                    </div>
                  )}

                  {ev.raw.description && (
                    <p className={styles.detailDescription}>
                      {ev.raw.description}
                    </p>
                  )}

                  {i < events.length - 1 && <div className={styles.divider} style={{ margin: "16px 0" }} />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function CalendarPage() {
  const today = new Date();
  const { bannerUrl } = usePageBanner("calendar");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { contact } = useContactInfo();

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/parish-calendar-events?year=${year}&month=${month}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setError("Không tải được lịch lễ riêng của giáo xứ.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const typeKey = (ev.eventTypeName || "special").toLowerCase();
      if (activeFilter !== "all" && typeKey !== activeFilter) continue;

      const d = new Date(ev.eventDate);
      const key = dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
      if (!map[key]) map[key] = [];
      map[key].push({
        type: typeKey,
        label: ev.timeLabel || ev.title,
        raw: ev,
      });
    }
    return map;
  }, [events, activeFilter]);

  const calendarDays = useMemo(() => buildMonthGrid(year, month, eventsByDate), [year, month, eventsByDate]);

 const effectiveSelectedKey = useMemo(() => {
    // 1. Ưu tiên tuyệt đối ngày người dùng click (dù có sự kiện hay không)
    if (selectedKey) return selectedKey;
    
    // 2. Nếu chưa click (vừa load trang):
    const now = new Date();
    const todayKey = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    // - Nếu đang ở tháng hiện tại -> Mặc định chọn ngày hôm nay
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
      return todayKey;
    }
    
    // - Nếu chuyển sang tháng khác -> Chọn ngày đầu tiên có sự kiện, hoặc mặc định là ngày mùng 1
    const firstWithEvents = calendarDays.find((c) => c.currentMonth && c.events.length > 0);
    return firstWithEvents?.key ?? dateKey(year, month, 1);
  }, [selectedKey, year, month, calendarDays]);

  const selectedDayEvents = effectiveSelectedKey ? eventsByDate[effectiveSelectedKey] ?? [] : [];
  const [selY, selM, selD] = effectiveSelectedKey ? effectiveSelectedKey.split("-").map(Number) : [];
  const selectedLiturgical = effectiveSelectedKey ? getLiturgicalInfo(selY, selM, selD) : null;

  const goPrevMonth = useCallback(() => {
    setSelectedKey(null);
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  }, [month]);
  const goNextMonth = useCallback(() => {
    setSelectedKey(null);
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  }, [month]);
  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedKey(null);
  }, [today]);

  const massScheduleLines = (contact?.massSchedule || "")
    .split("|")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className={styles.calPage}>
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Ảnh bìa trang — admin có thể đổi ở /admin/banners */}
          <div
            className={styles.hero}
            style={bannerUrl ? {
              backgroundImage: `linear-gradient(0deg, rgba(10,20,40,0.65) 0%, rgba(10,20,40,0.15) 100%), url('${bannerUrl}')`,
            } : undefined}
          >
            <div className={styles.heroContent}>
              <span className={styles.heroEyebrow}>Giáo xứ Ngũ Phúc</span>
              <h1 className={styles.heroTitle}>Lịch Phụng Vụ</h1>
              <p className={styles.heroSubtitle}>
                Theo dõi lịch thánh lễ, cử hành bí tích và các sự kiện cộng đoàn trong tháng.
              </p>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className={styles.heading}>
            <div>
              <h2 className={styles.title}>Xem theo tháng</h2>
              <p className={styles.subtitle}>
                Chọn loại sự kiện để lọc nhanh trong lịch bên dưới.
              </p>
            </div>
            <div className={styles.filters}>
              <div className={styles.filterLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                </svg>
                <span>Lọc:</span>
              </div>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`
                    ${styles.filterBtn} 
                    ${styles[f.cls]} 
                    ${activeFilter === f.id ? styles.active : ""}
                  `}
                  onClick={() => setActiveFilter(activeFilter === f.id ? "all" : f.id)}
                >
                  <span className={styles.filterDot} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "#dc2626", marginBottom: 16, fontSize: 14 }}>{error}</p>
          )}

          {/* Calendar Layout */}
          <div className={styles.layout}>

            {/* Main Calendar */}
            <div className={styles.calendar}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <button className={styles.navBtn} onClick={goPrevMonth} aria-label="Tháng trước">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button className={styles.navBtn} onClick={goNextMonth} aria-label="Tháng sau">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                  <h2 className={styles.monthTitle}>{MONTH_NAMES[month - 1]} {year}</h2>
                </div>
                <div className={styles.toolbarRight}>
                  <button className={styles.todayBtn} onClick={goToday}>Hôm nay</button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className={styles.dowHeader}>
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className={styles.dowCell}>{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className={styles.grid}>
                {loading ? (
                  <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", color: "#666" }}>
                    Đang tải lịch…
                  </div>
                ) : (
                  calendarDays.map((d, i) => {
                    const isSelected = d.currentMonth && d.key === effectiveSelectedKey;
                    
                    return (
                      <div
                        key={d.currentMonth ? d.key : `other-${i}`}
                        className={`
                          ${styles.day} 
                          ${!d.currentMonth ? styles.dayOther : ""} 
                          ${d.isToday ? styles.dayTodayWrap : ""}
                        `}
                        style={{
                          ...(isSelected ? { outline: "2px solid #137fec", outlineOffset: "-2px", zIndex: 1 } : {}),
                          ...(d.currentMonth ? { cursor: "pointer" } : {})
                        }}
                        onClick={() => {
                          if (!d.currentMonth) return;
                          setSelectedKey(d.key);
                          setDayModalOpen(true);
                        }}
                      >
                        <span className={`
                          ${styles.dayNum} 
                          ${d.isToday ? styles.dayToday : ""} 
                          ${d.isSunday && !d.isToday ? styles.daySunday : ""}
                        `}>
                          {d.day}
                        </span>
                        
                        {d.currentMonth && d.liturgical?.label && (
                          <div
                            className={`${styles.liturgicalLabel} ${d.isSunday ? styles.liturgicalLabelSunday : styles.liturgicalLabelNormal}`}
                            style={{ color: SEASON_COLOR[d.liturgical.season] || "#617589" }}
                            title={d.liturgical.label}
                          >
                            {d.liturgical.label}
                          </div>
                        )}
                        
                        <div className={styles.eventsList}>
                          {d.events.map((ev, j) => {
                            // Tạo tên class động (vd: eventItemMass, eventItemSacrament...)
                            const typeClassName = styles[`eventItem${ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}`];
                            return (
                              <div key={j} className={`${styles.eventItem} ${typeClassName || ""}`}>
                                {ev.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>

              {/* Lịch Phụng vụ Công giáo Việt Nam */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.widgetIcon}>
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  Lịch Phụng vụ Công giáo
                </h3>
                <p className={styles.widgetDesc}>
                  Bài đọc, lễ kính và niên lịch Phụng vụ hằng ngày theo nguồn chính thức của Hội Đồng Giám Mục Việt Nam.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a
                    href="https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailBtn}
                    style={{ textAlign: "center", textDecoration: "none" }}
                  >
                    Xem Lời Chúa &amp; Lịch Phụng vụ hôm nay
                  </a>
                  <a
                    href="https://gcatholic.org/calendar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    Xem lịch phụng vụ trọn tháng theo Giáo phận →
                  </a>
                </div>
              </div>

              {/* Mass Schedule */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.widgetIcon}>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                  </svg>
                  Giờ Lễ Thường Xuyên
                </h3>
                {massScheduleLines.length > 0 ? (
                  <div className={styles.schedule}>
                    {massScheduleLines.map((line, i) => (
                      <div key={i}>
                        <div className={styles.timeChips}>
                          <span className={`${styles.chip} ${i % 2 === 0 ? styles.chipBlue : styles.chipGold}`}>
                            {line}
                          </span>
                        </div>
                        {i < massScheduleLines.length - 1 && <div className={styles.divider} style={{ marginTop: 12, marginBottom: 12 }} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>
                    Giờ lễ đang được cập nhật, vui lòng xem tại trang Liên hệ.
                  </p>
                )}
              </div>

              {/* Event Detail - Widget Sự kiện ngày đã chọn */}
              <div className={`${styles.widget} ${styles.eventDetailWidget}`}>
                <div className={styles.detailBar} />
                <div className={styles.detailBody}>
                  <span className={styles.detailTag}>
                    {effectiveSelectedKey ? fmtFull(selY, selM, selD) : "Chi tiết sự kiện"}
                  </span>
                  {selectedLiturgical?.label && (
                    <h3
                      className={styles.detailTitle}
                      style={{ color: SEASON_COLOR[selectedLiturgical.season] || "#111418" }}
                    >
                      {selectedLiturgical.label}
                    </h3>
                  )}
                  {selectedDayEvents.length === 0 ? (
                    <p className={styles.emptyState}>
                      Không có sự kiện riêng nào của giáo xứ trong ngày này.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {selectedDayEvents.map((ev, i) => (
                        <div key={i} style={{ paddingBottom: i < selectedDayEvents.length - 1 ? 16 : 0, borderBottom: i < selectedDayEvents.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                          <h3 className={styles.detailTitle}>{ev.raw.title}</h3>
                          <div className={styles.detailMeta}>
                            {ev.raw.timeLabel && (
                              <div className={styles.detailMetaItem}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                                </svg>
                                <span>{ev.raw.timeLabel}</span>
                              </div>
                            )}
                          </div>
                          {ev.raw.location && (
                            <div className={styles.detailRow}>
                              <div className={styles.detailRowIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                              </div>
                              <div>
                                <p className={styles.detailRowLabel}>Địa điểm</p>
                                <p className={styles.detailRowValue}>{ev.raw.location}</p>
                              </div>
                            </div>
                          )}
                          {ev.raw.description && (
                            <p className={styles.detailDescription}>
                              {ev.raw.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Modal chi tiết ngày */}
      {dayModalOpen && effectiveSelectedKey && (
        <DayDetailModal
          dateLabel={fmtFull(selY, selM, selD)}
          liturgical={selectedLiturgical}
          events={selectedDayEvents}
          onClose={() => setDayModalOpen(false)}
        />
      )}
    </div>
  );
}