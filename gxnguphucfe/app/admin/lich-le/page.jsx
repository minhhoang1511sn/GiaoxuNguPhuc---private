'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './lich-le.module.css';
import { apiFor } from '@/app/lib/apiClient';
import { useEnumOptions } from '@/app/lib/useEnumOptions';

/* ── Config ── */

const EMPTY_FORM = {
  title: '',
  description: '',
  eventDate: '',
  eventType: 0,
  timeLabel: '',
  location: '',
  displayOrder: 0,
};

// Màu hiển thị theo loại sự kiện — khớp với enum ParishEventType ở backend
// (Mass=0, Sacrament=1, Activity=2, Special=3).
const TYPE_STYLES = {
  0: { color: '#93c5fd', bg: 'rgba(147,197,253,0.12)' }, // Thánh Lễ
  1: { color: '#c4b5fd', bg: 'rgba(196,181,253,0.12)' }, // Bí Tích
  2: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)' }, // Sinh Hoạt
  3: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }, // Sự Kiện
};

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toDateInputValue(d) {
  if (!d) return '';
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ── API helpers ── */
const apiFetch = apiFor('/api/parish-calendar-events');

const apiGetByMonth = (year, month) => apiFetch(`/admin?year=${year}&month=${month}`);
const apiCreate = (data) => apiFetch('/admin', { method: 'POST', body: JSON.stringify(data) });
const apiUpdate = (id, data) => apiFetch(`/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) });
const apiDelete = (id) => apiFetch(`/admin/${id}`, { method: 'DELETE' });

/* ════════════════════════════════
   Toast
════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.toastIcon}>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════
   Modal thêm/sửa
════════════════════════════════ */
function EventModal({ mode, initial, eventTypeOptions, onClose, onSave }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 2) e.title = 'Vui lòng nhập tiêu đề (ít nhất 2 ký tự)';
    if (!form.eventDate) e.eventDate = 'Vui lòng chọn ngày diễn ra';
    if (form.displayOrder === '' || Number.isNaN(Number(form.displayOrder))) e.displayOrder = 'Thứ tự hiển thị phải là số';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(form, isEdit ? initial.id : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{isEdit ? 'Chỉnh sửa mục lịch lễ' : 'Thêm mục lịch lễ riêng'}</h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.title}` : 'Bổ sung giờ lễ đặc biệt, bí tích, sinh hoạt hoặc sự kiện của giáo xứ'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tiêu đề <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.title ? styles.fieldError : ''}`}
              placeholder="VD: Lễ Bổn mạng Giáo xứ"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
          </div>

          {/* Date + Type */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Ngày diễn ra <span className={styles.required}>*</span></label>
              <input
                type="date"
                className={`${styles.fieldInput} ${errors.eventDate ? styles.fieldError : ''}`}
                value={form.eventDate}
                onChange={(e) => set('eventDate', e.target.value)}
              />
              {errors.eventDate && <span className={styles.errorMsg}>{errors.eventDate}</span>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Loại</label>
              <select
                className={styles.fieldSelect}
                value={form.eventType}
                onChange={(e) => set('eventType', Number(e.target.value))}
              >
                {eventTypeOptions.map((o) => (
                  <option key={o.key} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TimeLabel + Location */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Nhãn giờ / mô tả ngắn</label>
              <input
                className={styles.fieldInput}
                placeholder="VD: 18:00 - Lễ Trọng"
                value={form.timeLabel}
                onChange={(e) => set('timeLabel', e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Địa điểm</label>
              <input
                className={styles.fieldInput}
                placeholder="Để trống = Nhà thờ giáo xứ"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mô tả chi tiết</label>
            <textarea
              className={styles.fieldTextarea}
              rows={4}
              placeholder="Hiển thị khi giáo dân bấm xem chi tiết sự kiện (không bắt buộc)"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Display order */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Thứ tự hiển thị trong ngày</label>
            <input
              type="number"
              className={`${styles.fieldInput} ${errors.displayOrder ? styles.fieldError : ''}`}
              value={form.displayOrder}
              onChange={(e) => set('displayOrder', e.target.value)}
            />
            {errors.displayOrder && <span className={styles.errorMsg}>{errors.displayOrder}</span>}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            <button className={styles.btnPublish} onClick={handleSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Thêm mục lịch lễ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Main page
════════════════════════════════ */
export default function LichLePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

const { enums } = useEnumOptions();
const eventTypeOptions = enums?.parishEventTypes?.length
    ? enums.parishEventTypes
    : [
        { key: 'Mass', value: 0, label: 'Thánh Lễ' },
        { key: 'Sacrament', value: 1, label: 'Bí Tích' },
        { key: 'Activity', value: 2, label: 'Sinh Hoạt' },
        { key: 'Special', value: 3, label: 'Sự Kiện' },
      ];

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetByMonth(year, month);
      setEvents(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const goPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  };
  const goNextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  const handleSave = async (formData, editId) => {
    const payload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      eventDate: formData.eventDate,
      eventType: Number(formData.eventType),
      timeLabel: formData.timeLabel?.trim() || null,
      location: formData.location?.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật mục lịch lễ thành công');
      } else {
        await apiCreate(payload);
        addToast('Thêm mục lịch lễ thành công');
      }
      setModal(null);
      fetchEvents();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (ev) => {
    if (!confirm(`Xoá mục lịch lễ "${ev.title}"?`)) return;
    try {
      await apiDelete(ev.id);
      addToast('Đã xoá');
      fetchEvents();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const openEdit = (ev) => {
    setModal({
      mode: 'edit',
      event: {
        id: ev.id,
        title: ev.title,
        description: ev.description ?? '',
        eventDate: toDateInputValue(ev.eventDate),
        eventType: ev.eventType,
        timeLabel: ev.timeLabel ?? '',
        location: ev.location ?? '',
        displayOrder: ev.displayOrder,
      },
    });
  };

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <EventModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.event : undefined}
          eventTypeOptions={eventTypeOptions}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className={styles.postsPage}>
        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Lịch lễ riêng của Giáo xứ</h1>
            <p className={styles.postsSub}>
              {events.length} mục trong {MONTH_NAMES[month - 1]} {year} · Hiển thị trên trang "Lịch" phía người dùng, bên cạnh Lịch Phụng vụ chung của Giáo hội
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm mục lịch lễ
          </button>
        </div>

        {/* Toolbar: điều hướng tháng */}
        <div className={styles.postsToolbar}>
          <div className={styles.chips}>
            <button className={styles.chip} onClick={goPrevMonth}>← Tháng trước</button>
            <button className={`${styles.chip} ${styles.activeAll}`} onClick={goToday}>Hôm nay</button>
            <button className={styles.chip} onClick={goNextMonth}>Tháng sau →</button>
          </div>
          <div className={styles.toolbarDivider} />
          <span className={styles.postsSub} style={{ margin: 0 }}>
            Đang xem: <strong>{MONTH_NAMES[month - 1]} {year}</strong>
          </span>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Tiêu đề', 'Ngày', 'Loại', 'Nhãn giờ', 'Địa điểm', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : events.length === 0 ? (
            <div className={styles.tableEmpty}>Chưa có mục lịch lễ nào trong tháng này.</div>
          ) : events.map((ev, i) => {
            const typeStyle = TYPE_STYLES[ev.eventType] ?? TYPE_STYLES[3];
            const typeLabel = eventTypeOptions.find((o) => o.value === ev.eventType)?.label ?? ev.eventTypeName;
            return (
              <div key={ev.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
                <div className={styles.postInfo}>
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.postTitle} title={ev.title}>{ev.title}</div>
                    {ev.description && (
                      <div className={styles.postAuthor} title={ev.description}>{ev.description}</div>
                    )}
                  </div>
                </div>
                <div className={styles.dateCell}>{fmtDate(ev.eventDate)}</div>
                <div>
                  <span className={styles.statusPill} style={{ color: typeStyle.color, background: typeStyle.bg }}>
                    <span className={styles.statusDot} style={{ background: typeStyle.color }} />
                    {typeLabel}
                  </span>
                </div>
                <div className={styles.statCell}>{ev.timeLabel || '—'}</div>
                <div className={styles.statCell}>{ev.location || 'Nhà thờ giáo xứ'}</div>
                <div className={styles.rowActions}>
                  <button className={styles.actionBtn} onClick={() => openEdit(ev)}>Sửa</button>
                  <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(ev)}>Xoá</button>
                </div>
              </div>
            );
          })}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {events.length === 0 ? 'Chưa có mục nào' : `Tổng ${events.length} mục trong tháng`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
