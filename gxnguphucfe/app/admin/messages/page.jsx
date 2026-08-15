'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './messages.module.css';
import { apiFor } from '@/app/lib/apiClient';

const apiFetch = apiFor('/api/contact-messages');

const apiGetList = () => apiFetch('/admin');
const apiMarkAsRead = (id) => apiFetch(`/admin/${id}/read`, { method: 'PUT' });
const apiDelete = (id) => apiFetch(`/admin/${id}`, { method: 'DELETE' });

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Toast ── */
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

/* ── Detail Modal ── */
function DetailModal({ item, onClose, onDelete }) {
  const rows = [
    ['Họ và tên', item.fullName],
    ['Email', item.email],
    ['Chủ đề', item.subject],
    ['Ngày gửi', fmtDate(item.createdAt)],
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Tin nhắn liên hệ</h2>
            <p className={styles.modalSub}>{item.fullName}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.detailRow}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
              </div>
            ))}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Nội dung</span>
              <span className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>{item.content}</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => onDelete(item)}>
            Xoá tin nhắn
          </button>
          <a
            className={styles.btnPublish}
            href={`mailto:${item.email}?subject=${encodeURIComponent('Re: ' + item.subject)}`}
          >
            ✉ Trả lời qua email
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ContactMessagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [detail, setDetail] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetList();
      setItems(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openDetail = async (item) => {
    setDetail(item);
    if (!item.isRead) {
      try {
        const updated = await apiMarkAsRead(item.id);
        setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
      } catch {
        // đánh dấu đã đọc thất bại không quan trọng bằng việc xem được nội dung — bỏ qua lặng lẽ
      }
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Xoá tin nhắn của "${item.fullName}"?`)) return;
    try {
      await apiDelete(item.id);
      addToast('Đã xoá tin nhắn');
      setDetail(null);
      fetchList();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const filtered = items.filter((item) => {
    if (filter === 'unread' && item.isRead) return false;
    if (filter === 'read' && !item.isRead) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = items.filter((i) => !i.isRead).length;

  const chips = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'read', label: 'Đã đọc' },
  ];
  const chipClass = (key) => {
    const m = { all: 'activeAll', unread: 'activeReview', read: 'activePublished' };
    return styles[m[key]] ?? '';
  };

  return (
    <>
      <Toast toasts={toasts} />

      {detail && (
        <DetailModal item={detail} onClose={() => setDetail(null)} onDelete={handleDelete} />
      )}

      <div className={styles.page}>
        {/* Header */}
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.heading}>Tin nhắn liên hệ</h1>
            <p className={styles.sub}>
              {items.length} tin nhắn{unreadCount > 0 ? ` — ${unreadCount} chưa đọc` : ''}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên, email, chủ đề…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.chips}>
            {chips.map((c) => (
              <button
                key={c.key}
                className={`${styles.chip} ${filter === c.key ? chipClass(c.key) : ''}`}
                onClick={() => setFilter(c.key)}
              >{c.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Người gửi', 'Chủ đề', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>Không có tin nhắn nào phù hợp.</div>
          ) : filtered.map((item, i) => (
            <div
              key={item.id}
              className={styles.tableRow}
              style={{ animationDelay: `${i * 30}ms`, fontWeight: item.isRead ? 400 : 600 }}
              onClick={() => openDetail(item)}
            >
              <div className={styles.personInfo}>
                <div className={styles.personName}>{item.fullName}</div>
                <div className={styles.personSub}>{item.email}</div>
              </div>
              <div className={styles.cell}>{item.subject}</div>
              <div className={styles.cell}>{fmtDate(item.createdAt)}</div>
              <div>
                <span
                  className={styles.statusPill}
                  style={item.isRead
                    ? { background: 'rgba(110,231,183,0.1)', color: '#6ee7b7' }
                    : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
                >
                  <span
                    className={styles.statusDot}
                    style={{ background: item.isRead ? '#10b981' : '#f59e0b' }}
                  />
                  {item.isRead ? 'Đã đọc' : 'Chưa đọc'}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => { e.stopPropagation(); openDetail(item); }}
                >Xem</button>
                <button
                  className={`${styles.actionBtn} ${styles.del}`}
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                >Xoá</button>
              </div>
            </div>
          ))}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {filtered.length === 0 ? 'Không có tin nhắn nào' : `Hiển thị ${filtered.length} / ${items.length} tin nhắn`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
