'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './history.module.css';
import { uploadImage, resolveImageUrl } from '@/app/lib/uploadImage';

/* ── Config ── */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

const EMPTY_FORM = {
  year: '',
  title: '',
  content: '',
  imageUrl: '',
  displayOrder: 0,
};

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/parish-history${path}`, {
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

const apiGetAll = () => apiFetch('/admin');
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
   Modal
════════════════════════════════ */
function HistoryModal({ mode, initial, onClose, onSave }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng file lần sau
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((er) => ({ ...er, imageUrl: 'Vui lòng chọn một file ảnh.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, imageUrl: 'Kích thước ảnh tối đa là 5MB.' }));
      return;
    }

    setUploading(true);
    setErrors((er) => ({ ...er, imageUrl: '' }));
    try {
      const url = await uploadImage(file, 'general');
      set('imageUrl', url);
    } catch (err) {
      setErrors((er) => ({ ...er, imageUrl: 'Tải ảnh lên thất bại: ' + err.message }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => set('imageUrl', '');

  const validate = () => {
    const e = {};
    if (!form.year.trim()) e.year = 'Vui lòng nhập năm hoặc giai đoạn';
    if (!form.title.trim() || form.title.trim().length < 2) e.title = 'Vui lòng nhập tiêu đề (ít nhất 2 ký tự)';
    if (!form.content.trim() || form.content.trim().length < 2) e.content = 'Vui lòng nhập nội dung mô tả';
    if (form.displayOrder === '' || Number.isNaN(Number(form.displayOrder))) e.displayOrder = 'Thứ tự hiển thị phải là số';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (uploading) return;
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
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{isEdit ? 'Chỉnh sửa mốc lược sử' : 'Thêm mốc lược sử mới'}</h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.title}` : 'Điền thông tin một giai đoạn/sự kiện trong lịch sử giáo xứ'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Year */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Năm / Giai đoạn <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.year ? styles.fieldError : ''}`}
              placeholder="VD: 1954 hoặc 1975 - 1990"
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
            />
            {errors.year && <span className={styles.errorMsg}>{errors.year}</span>}
          </div>

          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tiêu đề <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.title ? styles.fieldError : ''}`}
              placeholder="VD: Thành lập giáo xứ"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
          </div>

          {/* Content */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nội dung mô tả <span className={styles.required}>*</span></label>
            <textarea
              className={`${styles.fieldTextarea} ${errors.content ? styles.fieldError : ''}`}
              rows={5}
              placeholder="Mô tả chi tiết về mốc sự kiện này"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
            />
            {errors.content && <span className={styles.errorMsg}>{errors.content}</span>}
          </div>

          {/* Display order */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Thứ tự hiển thị</label>
            <input
              type="number"
              className={`${styles.fieldInput} ${errors.displayOrder ? styles.fieldError : ''}`}
              value={form.displayOrder}
              onChange={(e) => set('displayOrder', e.target.value)}
            />
            {errors.displayOrder && <span className={styles.errorMsg}>{errors.displayOrder}</span>}
          </div>

          {/* Image upload */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Ảnh minh hoạ</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {form.imageUrl ? (
                  <img
                    src={resolveImageUrl(form.imageUrl)}
                    alt="Xem trước"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 22, opacity: 0.4 }}>📜</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={handlePickFile}
                  disabled={uploading}
                  style={{ padding: '8px 14px' }}
                >
                  {uploading ? 'Đang tải lên…' : (form.imageUrl ? 'Đổi ảnh khác' : '📁 Chọn ảnh từ máy')}
                </button>
                {form.imageUrl && !uploading && (
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={handleRemoveImage}
                    style={{ padding: '8px 14px', color: '#f87171' }}
                  >
                    Xoá ảnh
                  </button>
                )}
              </div>
            </div>
            <span className={styles.errorMsg} style={{ color: '#94a3b8' }}>
              Hỗ trợ JPG, PNG, WEBP, GIF — tối đa 5MB. Không bắt buộc.
            </span>
            {errors.imageUrl && <span className={styles.errorMsg}>{errors.imageUrl}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            <button className={styles.btnPublish} onClick={handleSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Thêm mốc lược sử'}
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
export default function HistoryPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetAll();
      setMilestones(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  const filtered = milestones.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const hay = `${m.year} ${m.title} ${m.content}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Save (tạo hoặc sửa) */
  const handleSave = async (formData, editId) => {
    const payload = {
      year: formData.year.trim(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl?.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật mốc lược sử thành công');
      } else {
        await apiCreate(payload);
        addToast('Thêm mốc lược sử thành công');
      }
      setModal(null);
      fetchMilestones();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (milestone) => {
    if (!confirm(`Xoá mốc lược sử "${milestone.title}"?`)) return;
    try {
      await apiDelete(milestone.id);
      addToast('Đã xoá');
      fetchMilestones();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const openEdit = (milestone) => {
    setModal({
      mode: 'edit',
      milestone: {
        id: milestone.id,
        year: milestone.year,
        title: milestone.title,
        content: milestone.content,
        imageUrl: milestone.imageUrl ?? '',
        displayOrder: milestone.displayOrder,
      },
    });
  };

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <HistoryModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.milestone : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className={styles.postsPage}>
        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Quản lý Lược sử Giáo xứ</h1>
            <p className={styles.postsSub}>
              {milestones.length} mốc sự kiện · Hiển thị dạng dòng thời gian ở tab "Lịch sử"
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm mốc lược sử
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.postsToolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm theo năm, tiêu đề, nội dung…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Sự kiện', 'Năm/Giai đoạn', 'Thứ tự', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy mốc lược sử phù hợp.</div>
          ) : filtered.map((milestone, i) => (
            <div key={milestone.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={styles.postInfo}>
                <div className={styles.postThumb}>
                  {milestone.imageUrl ? (
                    <img src={resolveImageUrl(milestone.imageUrl)} alt={milestone.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : '📜'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.postTitle} title={milestone.title}>{milestone.title}</div>
                  <div className={styles.postAuthor} title={milestone.content}>{milestone.content}</div>
                </div>
              </div>
              <div className={styles.dateCell}>{milestone.year}</div>
              <div className={styles.dateCell}>{milestone.displayOrder}</div>
              <div className={styles.rowActions}>
                <button className={styles.actionBtn} onClick={() => openEdit(milestone)}>Sửa</button>
                <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(milestone)}>Xoá</button>
              </div>
            </div>
          ))}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {milestones.length === 0 ? 'Chưa có mốc lược sử nào' : `Tổng ${milestones.length} mốc lược sử`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
