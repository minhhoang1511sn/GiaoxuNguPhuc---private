'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './clergy.module.css';
import { uploadImage, resolveImageUrl } from '@/app/lib/uploadImage';

/* ── Config ── */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

// Khớp đúng giá trị số với enum ClergyType ở backend (Models/ClergyType.cs).
// Không đổi số của mục đã có.
const TYPE_API = {
  LinhMuc: 0,
  ThayXu: 1,
  TuSi: 2,
  GiaoDan: 3,
};

const TYPE_LABELS = {
  LinhMuc: 'Linh mục',
  ThayXu: 'Thầy xứ / Phó tế',
  TuSi: 'Tu sĩ (Sr.)',
  GiaoDan: 'Giáo dân phụ trách',
};

const TYPES_LIST = Object.keys(TYPE_API).map((key) => ({
  key,
  value: TYPE_API[key],
  label: TYPE_LABELS[key],
}));

const STATUSES_FILTER = [
  { key: 'all', label: 'Tất cả' },
  { key: 'current', label: 'Đang phục vụ' },
  { key: 'past', label: 'Đã kết thúc' },
];

const EMPTY_FORM = {
  fullName: '',
  type: 'LinhMuc',
  position: '',
  ministryName: '',
  schoolYear: '',
  isCurrent: true,
  imageUrl: '',
  email: '',
  phone: '',
  description: '',
  displayOrder: 0,
};

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/clergy-members${path}`, {
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
function ClergyModal({ mode, initial, onClose, onSave }) {
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
      const url = await uploadImage(file, 'clergy');
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
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Vui lòng nhập họ tên (ít nhất 2 ký tự)';
    if (!form.position.trim() || form.position.trim().length < 2) e.position = 'Vui lòng nhập chức danh (ít nhất 2 ký tự)';
    if (form.displayOrder === '' || Number.isNaN(Number(form.displayOrder))) e.displayOrder = 'Thứ tự hiển thị phải là số';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email không hợp lệ';
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
            <h2 className={styles.modalTitle}>{isEdit ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.fullName}` : 'Điền thông tin linh mục / thầy xứ / tu sĩ / người phụ trách'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Full name */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Họ và tên <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.fullName ? styles.fieldError : ''}`}
              placeholder="VD: Lm. Giuse Nguyễn Văn An"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
            />
            {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
          </div>

          {/* Type */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Phân loại <span className={styles.required}>*</span></label>
            <select
              className={styles.fieldSelect}
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              {TYPES_LIST.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Chức danh <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.position ? styles.fieldError : ''}`}
              placeholder="VD: Chánh xứ, Phó xứ, Trưởng Ban Caritas..."
              value={form.position}
              onChange={(e) => set('position', e.target.value)}
            />
            {errors.position && <span className={styles.errorMsg}>{errors.position}</span>}
          </div>

          {/* Ministry name */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Giới / Ban phụ trách</label>
            <input
              className={styles.fieldInput}
              placeholder="VD: Ca Đoàn Têrêsa (để trống nếu phục vụ chung giáo xứ)"
              value={form.ministryName}
              onChange={(e) => set('ministryName', e.target.value)}
            />
          </div>

          {/* School year */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Niên khóa phục vụ</label>
            <input
              className={styles.fieldInput}
              placeholder="VD: 2024-2026"
              value={form.schoolYear}
              onChange={(e) => set('schoolYear', e.target.value)}
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
                  <span style={{ fontSize: 22, opacity: 0.4 }}>✝</span>
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
              Hỗ trợ JPG, PNG, WEBP, GIF — tối đa 5MB.
            </span>
            {errors.imageUrl && <span className={styles.errorMsg}>{errors.imageUrl}</span>}
          </div>

          {/* Email + Phone */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              className={`${styles.fieldInput} ${errors.email ? styles.fieldError : ''}`}
              placeholder="ten@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Số điện thoại</label>
            <input
              className={styles.fieldInput}
              placeholder="09xxxxxxxx"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mô tả / giới thiệu ngắn</label>
            <textarea
              className={styles.fieldTextarea}
              rows={3}
              placeholder="Không bắt buộc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Current toggle */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isCurrent}
                onChange={(e) => set('isCurrent', e.target.checked)}
              />
              Đang phục vụ ở niên khóa hiện tại (hiển thị công khai)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            <button className={styles.btnPublish} onClick={handleSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Thêm thành viên'}
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
export default function ClergyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeSt, setActiveSt] = useState('all');
  const [activeType, setActiveType] = useState('all');

  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetAll();
      setMembers(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filtered = members.filter((m) => {
    if (activeSt === 'current' && !m.isCurrent) return false;
    if (activeSt === 'past' && m.isCurrent) return false;
    if (activeType !== 'all' && m.typeName !== activeType) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${m.fullName} ${m.position} ${m.ministryName ?? ''} ${m.schoolYear ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Save (tạo hoặc sửa) */
  const handleSave = async (formData, editId) => {
    const payload = {
      fullName: formData.fullName.trim(),
      type: TYPE_API[formData.type] ?? 0,
      position: formData.position.trim(),
      ministryName: formData.ministryName?.trim() || null,
      schoolYear: formData.schoolYear?.trim() || null,
      isCurrent: formData.isCurrent,
      imageUrl: formData.imageUrl?.trim() || null,
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      description: formData.description?.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật thông tin thành công');
      } else {
        await apiCreate(payload);
        addToast('Thêm thành viên thành công');
      }
      setModal(null);
      fetchMembers();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (member) => {
    if (!confirm(`Xoá thông tin "${member.fullName}"?`)) return;
    try {
      await apiDelete(member.id);
      addToast('Đã xoá');
      fetchMembers();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const openEdit = (member) => {
    setModal({
      mode: 'edit',
      member: {
        id: member.id,
        fullName: member.fullName,
        type: member.typeName,
        position: member.position,
        ministryName: member.ministryName ?? '',
        schoolYear: member.schoolYear ?? '',
        isCurrent: member.isCurrent,
        imageUrl: member.imageUrl ?? '',
        email: member.email ?? '',
        phone: member.phone ?? '',
        description: member.description ?? '',
        displayOrder: member.displayOrder,
      },
    });
  };

  const chipClass = (key) => {
    const m = { all: 'activeAll', current: 'activePublished', past: 'activeDraft' };
    return styles[m[key]] ?? '';
  };

  const currentCount = members.filter((m) => m.isCurrent).length;

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <ClergyModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.member : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className={styles.postsPage}>
        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Quản lý Giáo sĩ & Ban điều hành</h1>
            <p className={styles.postsSub}>
              {members.length} thành viên · {currentCount} đang phục vụ niên khóa hiện tại
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm thành viên
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.postsToolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm theo tên, chức danh, giới, niên khóa…"
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
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
          >
            <option value="all">Tất cả phân loại</option>
            {TYPES_LIST.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Thành viên', 'Phân loại', 'Giới/Ban', 'Niên khóa', 'Trạng thái', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy thành viên phù hợp.</div>
          ) : filtered.map((member, i) => (
            <div key={member.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={styles.postInfo}>
                <div className={styles.postThumb}>
                  {member.imageUrl ? (
                    <img src={resolveImageUrl(member.imageUrl)} alt={member.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : '✝'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.postTitle} title={member.fullName}>{member.fullName}</div>
                  <div className={styles.postAuthor} title={member.position}>{member.position}</div>
                </div>
              </div>
              <div className={styles.dateCell}>{TYPE_LABELS[member.typeName] ?? member.typeName}</div>
              <div className={styles.dateCell}>{member.ministryName || '—'}</div>
              <div className={styles.dateCell}>{member.schoolYear || 'Không rõ'}</div>
              <div>
                <span
                  className={styles.statusPill}
                  style={member.isCurrent
                    ? { background: 'rgba(110,231,183,0.1)', color: '#6ee7b7' }
                    : { background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}
                >
                  <span className={styles.statusDot} style={{ background: member.isCurrent ? '#10b981' : '#64748b' }} />
                  {member.isCurrent ? 'Đang phục vụ' : 'Đã kết thúc'}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.actionBtn} onClick={() => openEdit(member)}>Sửa</button>
                <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(member)}>Xoá</button>
              </div>
            </div>
          ))}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {members.length === 0 ? 'Chưa có thành viên nào' : `Tổng ${members.length} thành viên`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
