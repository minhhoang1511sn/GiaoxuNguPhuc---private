'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ministry.module.css';
import { uploadImage, resolveImageUrl } from '@/app/lib/uploadImage';
import { useEnumOptions, toLabelMapByKey, toValueMapByKey } from '@/app/lib/useEnumOptions';

/* ── Config ── */
import { authFetch } from '@/app/lib/authClient';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

const STATUSES_FILTER = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'inactive', label: 'Ngưng hoạt động' },
];

const EMPTY_FORM = {
  name: '',
  category: '',
  categoryLabel: '',
  description: '',
  imageUrl: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
};

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
async function apiFetch(path, opts = {}) {
  const res = await authFetch(`${BASE_URL}/api/ministries${path}`, {
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
function MinistryModal({ mode, initial, onClose, onSave, categoriesList }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? { ...EMPTY_FORM, category: categoriesList[0]?.key ?? '' });
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
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Vui lòng nhập tên đoàn thể (ít nhất 2 ký tự)';
    if (!form.description.trim() || form.description.trim().length < 2) e.description = 'Vui lòng nhập mô tả hoạt động';
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
            <h2 className={styles.modalTitle}>{isEdit ? 'Chỉnh sửa đoàn thể' : 'Thêm đoàn thể mới'}</h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.name}` : 'Điền thông tin đoàn thể / giới trong giáo xứ'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tên đoàn thể <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.name ? styles.fieldError : ''}`}
              placeholder="VD: Ca Đoàn Têrêsa"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Category */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nhóm phân loại (tab lọc) <span className={styles.required}>*</span></label>
            <select
              className={styles.fieldSelect}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {categoriesList.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Category label (custom display) */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nhãn hiển thị tuỳ chỉnh</label>
            <input
              className={styles.fieldInput}
              placeholder="Để trống sẽ dùng nhãn mặc định của nhóm phân loại"
              value={form.categoryLabel}
              onChange={(e) => set('categoryLabel', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mô tả hoạt động <span className={styles.required}>*</span></label>
            <textarea
              className={`${styles.fieldTextarea} ${errors.description ? styles.fieldError : ''}`}
              rows={4}
              placeholder="Mô tả ngắn gọn về hoạt động của đoàn thể"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            {errors.description && <span className={styles.errorMsg}>{errors.description}</span>}
          </div>

          {/* Icon */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Icon / Emoji</label>
            <input
              className={styles.fieldInput}
              placeholder="VD: 🎵"
              value={form.icon}
              onChange={(e) => set('icon', e.target.value)}
              maxLength={10}
            />
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
            <label className={styles.fieldLabel}>Ảnh đại diện</label>
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
                  <span style={{ fontSize: 22, opacity: 0.4 }}>{form.icon || '👥'}</span>
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

          {/* Active toggle */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              Đang hoạt động (hiển thị công khai)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            <button className={styles.btnPublish} onClick={handleSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Thêm đoàn thể'}
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
export default function MinistryAdminPage() {
  const { enums } = useEnumOptions();
  const categoriesList = enums.ministryCategories;
  const categoryLabelByKey = toLabelMapByKey(categoriesList);
  const categoryValueByKey = toValueMapByKey(categoriesList);

  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeSt, setActiveSt] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchMinistries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetAll();
      setMinistries(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMinistries(); }, [fetchMinistries]);

  const filtered = ministries.filter((m) => {
    if (activeSt === 'active' && !m.isActive) return false;
    if (activeSt === 'inactive' && m.isActive) return false;
    if (activeCategory !== 'all' && m.categoryName !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${m.name} ${m.description} ${m.categoryLabel ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Save (tạo hoặc sửa) */
  const handleSave = async (formData, editId) => {
    const payload = {
      name: formData.name.trim(),
      category: categoryValueByKey[formData.category] ?? 0,
      categoryLabel: formData.categoryLabel?.trim() || null,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl?.trim() || null,
      icon: formData.icon?.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
      isActive: formData.isActive,
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật đoàn thể thành công');
      } else {
        await apiCreate(payload);
        addToast('Thêm đoàn thể thành công');
      }
      setModal(null);
      fetchMinistries();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (ministry) => {
    if (!confirm(`Xoá đoàn thể "${ministry.name}"?`)) return;
    try {
      await apiDelete(ministry.id);
      addToast('Đã xoá');
      fetchMinistries();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const openEdit = (ministry) => {
    setModal({
      mode: 'edit',
      ministry: {
        id: ministry.id,
        name: ministry.name,
        category: ministry.categoryName,
        categoryLabel: ministry.categoryLabel ?? '',
        description: ministry.description,
        imageUrl: ministry.imageUrl ?? '',
        icon: ministry.icon ?? '',
        displayOrder: ministry.displayOrder,
        isActive: ministry.isActive,
      },
    });
  };

  const chipClass = (key) => {
    const m = { all: 'activeAll', active: 'activePublished', inactive: 'activeDraft' };
    return styles[m[key]] ?? '';
  };

  const activeCount = ministries.filter((m) => m.isActive).length;

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <MinistryModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.ministry : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          categoriesList={categoriesList}
        />
      )}

      <div className={styles.postsPage}>
        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Quản lý Đoàn thể</h1>
            <p className={styles.postsSub}>
              {ministries.length} đoàn thể · {activeCount} đang hoạt động
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm đoàn thể
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.postsToolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên, mô tả, nhãn hiển thị…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.chips}>
            {STATUSES_FILTER.map((s) => (
              <button
                key={s.key}
                className={`${styles.chip} ${activeSt === s.key ? chipClass(s.key) : ''}`}
                onClick={() => setActiveSt(s.key)}
              >{s.label}</button>
            ))}
          </div>
          <div className={styles.toolbarDivider} />
          <select
            className={styles.fieldSelect}
            style={{ maxWidth: 200 }}
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value="all">Tất cả phân loại</option>
            {categoriesList.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Đoàn thể', 'Phân loại', 'Thứ tự', 'Trạng thái', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy đoàn thể phù hợp.</div>
          ) : filtered.map((ministry, i) => (
            <div key={ministry.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={styles.postInfo}>
                <div className={styles.postThumb}>
                  {ministry.imageUrl ? (
                    <img src={resolveImageUrl(ministry.imageUrl)} alt={ministry.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : (ministry.icon || '👥')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.postTitle} title={ministry.name}>{ministry.name}</div>
                  <div className={styles.postAuthor} title={ministry.description}>{ministry.description}</div>
                </div>
              </div>
              <div className={styles.dateCell}>{ministry.categoryLabel || categoryLabelByKey[ministry.categoryName] || ministry.categoryName}</div>
              <div className={styles.dateCell}>{ministry.displayOrder}</div>
              <div>
                <span
                  className={styles.statusPill}
                  style={ministry.isActive
                    ? { background: 'rgba(110,231,183,0.1)', color: '#6ee7b7' }
                    : { background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}
                >
                  <span className={styles.statusDot} style={{ background: ministry.isActive ? '#10b981' : '#64748b' }} />
                  {ministry.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.actionBtn} onClick={() => openEdit(ministry)}>Sửa</button>
                <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(ministry)}>Xoá</button>
              </div>
            </div>
          ))}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {ministries.length === 0 ? 'Chưa có đoàn thể nào' : `Tổng ${ministries.length} đoàn thể`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
