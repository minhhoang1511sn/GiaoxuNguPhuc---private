'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './course.module.css';
import { useEnumOptions, toLabelMapByKey, toValueMapByKey } from '@/app/lib/useEnumOptions';

/* ── Config ── */
import { apiFor } from '@/app/lib/apiClient';

const STATUSES_FILTER = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang mở' },
  { key: 'inactive', label: 'Đang ẩn' },
];

const EMPTY_FORM = {
  name: '',
  description: '',
  classType: '',
  schoolYear: '',
  displayOrder: 0,
  isActive: true,
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
const apiFetch = apiFor('/api/catechism-classes');

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
function CourseModal({ mode, initial, onClose, onSave, classTypesList }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initial ?? { ...EMPTY_FORM, classType: classTypesList[0]?.key ?? '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Vui lòng nhập tên khóa học (ít nhất 2 ký tự)';
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
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{isEdit ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.name}` : 'Điền thông tin và lưu khóa học'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tên khóa học <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.name ? styles.fieldError : ''}`}
              placeholder="VD: Khai Tâm"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mô tả</label>
            <textarea
              className={styles.fieldTextarea}
              rows={3}
              placeholder="Mô tả ngắn hiển thị cho người đăng ký (không bắt buộc)"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Class type mapping */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Nhóm lớp giáo lý <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.fieldSelect}
              value={form.classType}
              onChange={(e) => set('classType', e.target.value)}
            >
              {classTypesList.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <span className={styles.errorMsg} style={{ color: '#94a3b8' }}>
              Dùng để khớp với đơn đăng ký ở trang công khai. Chọn &quot;Khác&quot; nếu đây là khóa học tự do, không thuộc các lớp cố định.
            </span>
          </div>

          {/* School year + display order */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Niên khóa</label>
            <input
              className={styles.fieldInput}
              placeholder="VD: 2026-2027 (để trống nếu áp dụng mọi niên khóa)"
              value={form.schoolYear}
              onChange={(e) => set('schoolYear', e.target.value)}
            />
          </div>

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

          {/* Active toggle */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              Hiển thị khóa học này ở trang đăng ký
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            <button className={styles.btnPublish} onClick={handleSave} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Thêm khóa học'}
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
export default function CoursePage() {
  const { enums } = useEnumOptions();
  const classTypesList = enums.classTypes;
  const classTypeLabelByKey = toLabelMapByKey(classTypesList);
  const classTypeValueByKey = toValueMapByKey(classTypesList);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeSt, setActiveSt] = useState('all');

  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetAll();
      setCourses(data ?? []);
    } catch (err) {
      addToast('Không tải được danh sách khóa học: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = courses.filter((c) => {
    if (activeSt === 'active' && !c.isActive) return false;
    if (activeSt === 'inactive' && c.isActive) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* Save (tạo hoặc sửa) */
  const handleSave = async (formData, editId) => {
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      classType: classTypeValueByKey[formData.classType] ?? 0,
      schoolYear: formData.schoolYear?.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
      isActive: formData.isActive,
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật khóa học thành công');
      } else {
        await apiCreate(payload);
        addToast('Thêm khóa học thành công');
      }
      setModal(null);
      fetchCourses();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (course) => {
    if (!confirm(`Xoá khóa học "${course.name}"?`)) return;
    try {
      await apiDelete(course.id);
      addToast('Đã xoá khóa học');
      fetchCourses();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  const openEdit = (course) => {
    setModal({
      mode: 'edit',
      course: {
        id: course.id,
        name: course.name,
        description: course.description ?? '',
        classType: course.classTypeName,
        schoolYear: course.schoolYear ?? '',
        displayOrder: course.displayOrder,
        isActive: course.isActive,
      },
    });
  };

  const chipClass = (key) => {
    const m = { all: 'activeAll', active: 'activePublished', inactive: 'activeDraft' };
    return styles[m[key]] ?? '';
  };

  const activeCount = courses.filter((c) => c.isActive).length;

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <CourseModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.course : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          classTypesList={classTypesList}
        />
      )}

      <div className={styles.postsPage}>
        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Quản lý khóa học</h1>
            <p className={styles.postsSub}>
              {courses.length} khóa học · {activeCount} đang mở cho đăng ký
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm khóa học
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.postsToolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm khóa học…"
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
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            {['Khóa học', 'Nhóm lớp', 'Niên khóa', 'Thứ tự', 'Trạng thái', 'Thao tác'].map((h) => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy khóa học phù hợp.</div>
          ) : filtered.map((course, i) => (
            <div key={course.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
              <div className={styles.postInfo}>
                <div className={styles.postThumb}>◆</div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.postTitle} title={course.name}>{course.name}</div>
                  {course.description && (
                    <div className={styles.postAuthor} title={course.description}>{course.description}</div>
                  )}
                </div>
              </div>
              <div className={styles.dateCell}>{classTypeLabelByKey[course.classTypeName] ?? course.classTypeName}</div>
              <div className={styles.dateCell}>{course.schoolYear || 'Mọi niên khóa'}</div>
              <div className={styles.statCell}>{course.displayOrder}</div>
              <div>
                <span
                  className={styles.statusPill}
                  style={course.isActive
                    ? { background: 'rgba(110,231,183,0.1)', color: '#6ee7b7' }
                    : { background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}
                >
                  <span className={styles.statusDot} style={{ background: course.isActive ? '#10b981' : '#64748b' }} />
                  {course.isActive ? 'Đang mở' : 'Đang ẩn'}
                </span>
              </div>
              <div className={styles.rowActions}>
                <button className={styles.actionBtn} onClick={() => openEdit(course)}>Sửa</button>
                <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(course)}>Xoá</button>
              </div>
            </div>
          ))}

          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {courses.length === 0 ? 'Chưa có khóa học nào' : `Tổng ${courses.length} khóa học`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
