'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './dang-ki.module.css';

/* ── Config ── */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';
const PAGE_SIZE = 10;

// Khớp đúng giá trị số với enum RegistrationClassType ở backend
const CLASS_TYPE_API = {
  KhaiTam: 0,
  RuocLe: 1,
  ThemSuc: 2,
  BaoDong: 3,
  DuTong: 4,
  GiaoLyHonNhan: 5,
  Khac: 6,
};

const CLASS_TYPE_LABELS = {
  KhaiTam: 'Khai Tâm',
  RuocLe: 'Xưng Tội - Rước Lễ',
  ThemSuc: 'Thêm Sức',
  BaoDong: 'Bao Đồng',
  DuTong: 'Dự Tòng (RCIA)',
  GiaoLyHonNhan: 'Giáo lý Hôn nhân',
  Khac: 'Khác',
};

const CLASS_TYPES_LIST = Object.keys(CLASS_TYPE_API).map((key) => ({
  key,
  label: CLASS_TYPE_LABELS[key],
}));

const STATUS_CONFIG = {
  Pending: { label: 'Chờ duyệt', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', dot: '#f59e0b' },
  Confirmed: { label: 'Đã xác nhận', color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', dot: '#10b981' },
  Cancelled: { label: 'Đã huỷ', color: '#f87171', bg: 'rgba(248,113,113,0.12)', dot: '#ef4444' },
};

const STATUSES_FILTER = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ duyệt' },
  { key: 'Confirmed', label: 'Đã xác nhận' },
  { key: 'Cancelled', label: 'Đã huỷ' },
];

const SCHOOL_YEARS_FILTER = ['all', '2026-2027', '2027-2028'];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── API helpers ── */
function buildQuery({ page, search, classType, status, schoolYear }) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('pageSize', PAGE_SIZE);
  if (search) params.set('search', search);
  if (classType !== 'all') params.set('classType', CLASS_TYPE_API[classType]);
  if (status !== 'all') params.set('status', status);
  if (schoolYear !== 'all') params.set('schoolYear', schoolYear);
  return params.toString();
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/catechism-registrations${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const apiGetList = (filters) => apiFetch(`/admin?${buildQuery(filters)}`);
const apiGetDetail = (id) => apiFetch(`/admin/${id}`);
const apiUpdateStatus = (id, status) =>
  apiFetch(`/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
const apiDelete = (id) => apiFetch(`/admin/${id}`, { method: 'DELETE' });

async function apiExportExcel(filters) {
  const query = buildQuery({ ...filters, page: 1 });
  const res = await fetch(`${BASE_URL}/api/catechism-registrations/admin/export?${query}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `danh-sach-dang-ky-giao-ly.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
function DetailModal({ item, onClose, onChangeStatus, onDelete }) {
  const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Pending;

  const rows = [
    ['Họ và tên', item.fullName],
    ['Ngày sinh', item.dateOfBirth ? fmtDate(item.dateOfBirth) : '—'],
    ['Giới tính', item.gender || '—'],
    ['Họ tên Cha', item.fatherName || '—'],
    ['Họ tên Mẹ', item.motherName || '—'],
    ['Số điện thoại', item.phone],
    ['Email', item.email || '—'],
    ['Địa chỉ', item.address],
    ['Giáo khu', item.parishZone || '—'],
    ['Lớp giáo lý', CLASS_TYPE_LABELS[item.classType] ?? item.classType],
    ['Niên khóa', item.schoolYear],
    ['Đã Rửa tội', item.isBaptized ? 'Có' : 'Chưa'],
    ['Nơi Rửa tội', item.baptismPlace || '—'],
    ['Ghi chú', item.note || '—'],
    ['Ngày nộp đơn', fmtDate(item.createdAt)],
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Chi tiết đơn đăng ký</h2>
            <p className={styles.modalSub}>{item.fullName}</p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.statusPill} style={{ background: sc.bg, color: sc.color, width: 'fit-content' }}>
            <span className={styles.statusDot} style={{ background: sc.dot }} />
            {sc.label}
          </span>

          <div className={styles.detailGrid}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.detailRow}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => onDelete(item)}>
            Xoá đơn
          </button>
          <div className={styles.modalActions}>
            {item.status !== 'Cancelled' && (
              <button className={styles.btnDraft} onClick={() => onChangeStatus(item, 'Cancelled')}>
                Huỷ đơn
              </button>
            )}
            {item.status !== 'Confirmed' && (
              <button className={styles.btnPublish} onClick={() => onChangeStatus(item, 'Confirmed')}>
                ✓ Xác nhận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function CatechismRegistrationsPage() {
  const [items, setItems] = useState([]);
  const [totalCount, setTotal] = useState(0);
  const [totalPages, setTotalPg] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [classType, setClassType] = useState('all');
  const [status, setStatus] = useState('all');
  const [schoolYear, setSchoolYear] = useState('all');
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const filters = { page, search, classType, status, schoolYear };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetList(filters);
      setItems(data.items ?? []);
      setTotal(data.totalCount ?? 0);
      setTotalPg(data.totalPages ?? 1);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, classType, status, schoolYear]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const openDetail = async (item) => {
    try {
      const full = await apiGetDetail(item.id);
      setDetail(full);
    } catch (err) {
      addToast('Không tải được chi tiết đơn: ' + err.message, 'error');
    }
  };

  const handleChangeStatus = async (item, newStatus) => {
    try {
      await apiUpdateStatus(item.id, newStatus);
      addToast(newStatus === 'Confirmed' ? 'Đã xác nhận đơn đăng ký' : 'Đã huỷ đơn đăng ký');
      setDetail(null);
      fetchList();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Xoá đơn đăng ký của "${item.fullName}"?`)) return;
    try {
      await apiDelete(item.id);
      addToast('Đã xoá đơn đăng ký');
      setDetail(null);
      fetchList();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await apiExportExcel(filters);
      addToast('Đã tải file Excel');
    } catch (err) {
      addToast('Xuất Excel thất bại: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const chipClass = (key) => {
    const m = { all: 'activeAll', Pending: 'activeReview', Confirmed: 'activePublished', Cancelled: 'activeDraft' };
    return styles[m[key]] ?? '';
  };

  return (
    <>
      <Toast toasts={toasts} />

      {detail && (
        <DetailModal
          item={detail}
          onClose={() => setDetail(null)}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
      )}

      <div className={styles.page}>
        {/* Header */}
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.heading}>Quản lý đăng ký giáo lý</h1>
            <p className={styles.sub}>{totalCount} đơn đăng ký</p>
          </div>
          <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Đang xuất…' : '⬇ Xuất Excel'}
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên, SĐT, email…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={classType}
            onChange={(e) => { setClassType(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả lớp giáo lý</option>
            {CLASS_TYPES_LIST.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={schoolYear}
            onChange={(e) => { setSchoolYear(e.target.value); setPage(1); }}
          >
            {SCHOOL_YEARS_FILTER.map((y) => (
              <option key={y} value={y}>{y === 'all' ? 'Tất cả niên khóa' : y}</option>
            ))}
          </select>

          <div className={styles.chips}>
            {STATUSES_FILTER.map((s) => (
              <button
                key={s.key}
                className={`${styles.chip} ${status === s.key ? chipClass(s.key) : ''}`}
                onClick={() => { setStatus(s.key); setPage(1); }}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Học viên / Người đăng ký', 'Lớp giáo lý', 'Niên khóa', 'Ngày nộp', 'Trạng thái', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : items.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy đơn đăng ký phù hợp.</div>
          ) : items.map((item, i) => {
            const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Pending;
            return (
              <div
                key={item.id}
                className={styles.tableRow}
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => openDetail(item)}
              >
                <div className={styles.personInfo}>
                  <div className={styles.personName}>{item.fullName}</div>
                  <div className={styles.personSub}>{item.phone}</div>
                </div>
                <div className={styles.cell}>{CLASS_TYPE_LABELS[item.classType] ?? item.classType}</div>
                <div className={styles.cell}>{item.schoolYear}</div>
                <div className={styles.cell}>{fmtDate(item.createdAt)}</div>
                <div>
                  <span className={styles.statusPill} style={{ background: sc.bg, color: sc.color }}>
                    <span className={styles.statusDot} style={{ background: sc.dot }} />
                    {sc.label}
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
            );
          })}

          {/* Pagination */}
          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {totalCount === 0 ? 'Không có đơn nào' : `Tổng ${totalCount} đơn`}
            </span>
            <div className={styles.pager}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`${styles.pageBtn} ${n === page ? styles.active : ''}`}
                  onClick={() => setPage(n)}
                >{n}</button>
              ))}
              <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
