'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './post.module.css';
import { uploadImage, resolveImageUrl } from '@/app/lib/uploadImage';
import { useEnumOptions, toLabelMapByKey, toValueMapByKey } from '@/app/lib/useEnumOptions';

/* ── Config ── */
import { apiFor } from '@/app/lib/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';

// Đây thuần là lựa chọn icon hiển thị (không có khái niệm tương ứng ở BE) nên vẫn giữ ở frontend.
const ICONS = [
  { value: '✦', label: '✦  Ngôi sao' },
  { value: '◈', label: '◈  Kim cương lưới' },
  { value: '▪', label: '▪  Ô vuông nhỏ' },
  { value: '◆', label: '◆  Kim cương' },
  { value: '◇', label: '◇  Kim cương viền' },
  { value: '◉', label: '◉  Tròn đặc tâm' },
  { value: '◎', label: '◎  Tròn viền tâm' },
  { value: '◐', label: '◐  Nửa trái' },
  { value: '◑', label: '◑  Nửa phải' },
  { value: '◒', label: '◒  Nửa dưới' },
];

// Màu sắc hiển thị theo trạng thái — chỉ là style, nhãn (label) lấy từ BE.
// Key phải khớp với enum PostStatus ở backend (Models/PostStatus.cs): Draft/Published/Archived.
const STATUS_STYLES = {
  Published: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', dot: '#10b981' },
  Draft:     { color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', dot: '#64748b' },
  Archived:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   dot: '#f59e0b' },
};

const PAGE_SIZE = 8;
const EMPTY_FORM = { icon: '✦', title: '', excerpt: '', content: '', thumbnailUrl: '', category: '', status: '', eventDate: '', isFeatured: false, isPinned: false };

function fmtDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
const apiFetch = apiFor('/api/posts');

const apiGetPosts = (page = 1, search = '', status = '') =>
  apiFetch(`/admin?page=${page}&pageSize=${PAGE_SIZE}${search ? `&search=${encodeURIComponent(search)}` : ''}${status && status !== 'all' ? `&status=${status}` : ''}`);

const apiGetPostDetail = (id) => apiFetch(`/admin/${id}`);

const apiCreate = (data) =>
  apiFetch('', { method: 'POST', body: JSON.stringify(data) });

const apiUpdate = (id, data) =>
  apiFetch(`/${id}`, { method: 'PUT', body: JSON.stringify(data) });

const apiDelete = (id) =>
  apiFetch(`/${id}`, { method: 'DELETE' });

/* ════════════════════════════════
   Toast
════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div className={styles.toastContainer}>
      {toasts.map(t => (
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
function PostModal({ mode, initial, onClose, onSave, categoriesList, statusesList }) {
  const isEdit = mode === 'edit';
  const [form, setForm]       = useState(initial ?? {
    ...EMPTY_FORM,
    category: categoriesList[0]?.key ?? '',
    status: statusesList.find(s => s.key === 'Draft')?.key ?? statusesList[0]?.key ?? '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng file lần sau
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(er => ({ ...er, thumbnailUrl: 'Vui lòng chọn một file ảnh.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, thumbnailUrl: 'Kích thước ảnh tối đa là 5MB.' }));
      return;
    }

    setUploading(true);
    setErrors(er => ({ ...er, thumbnailUrl: '' }));
    try {
      const url = await uploadImage(file, 'posts');
      set('thumbnailUrl', url);
    } catch (err) {
      setErrors(er => ({ ...er, thumbnailUrl: 'Tải ảnh lên thất bại: ' + err.message }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => set('thumbnailUrl', '');

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Vui lòng nhập tiêu đề (ít nhất 5 ký tự)';
    if (form.title.trim().length < 5) e.title = 'Tiêu đề ít nhất 5 ký tự';
    if (!form.excerpt.trim() || form.excerpt.trim().length < 10) e.excerpt = 'Tóm tắt ít nhất 10 ký tự';
    if (!form.content.trim() || form.content.trim().length < 10) e.content = 'Nội dung ít nhất 10 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (statusOverride) => {
    if (uploading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ ...form, status: statusOverride ?? form.status }, isEdit ? initial.id : null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h2>
            <p className={styles.modalSub}>
              {isEdit ? `Đang sửa: ${initial.title}` : 'Điền thông tin và lưu bài viết'}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>

          {/* Icon picker */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Biểu tượng</label>
            <select
              className={styles.fieldSelect}
              value={form.icon}
              onChange={e => set('icon', e.target.value)}
            >
              {ICONS.map(ic => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Chuyên mục <span className={styles.required}>*</span></label>
            <select
              className={styles.fieldSelect}
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              {categoriesList.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Event date — dùng cho mục "Sự kiện sắp tới" ở trang chủ */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Ngày diễn ra sự kiện</label>
            <input
              type="date"
              className={styles.fieldInput}
              value={form.eventDate}
              onChange={e => set('eventDate', e.target.value)}
            />
            <span className={styles.errorMsg} style={{ color: '#94a3b8' }}>
              Nhập ngày trong tương lai để bài viết hiện ở mục "Sự kiện sắp tới" trên trang chủ. Để trống nếu bài viết không phải sự kiện.
            </span>
          </div>

          {/* Featured / Pinned — quyết định bài viết có hiện ở trang chủ hay không */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Hiển thị trang chủ</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => set('isFeatured', e.target.checked)}
                />
                Bài nổi bật (hiện ở mục "Tin tức mới" trang chủ)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={e => set('isPinned', e.target.checked)}
                />
                Ghim bài viết (ưu tiên hiển thị lên đầu danh sách)
              </label>
            </div>
          </div>

          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tiêu đề <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.title ? styles.fieldError : ''}`}
              placeholder="Nhập tiêu đề bài viết… (tối thiểu 5 ký tự)"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
          </div>

          {/* Excerpt */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tóm tắt <span className={styles.required}>*</span></label>
            <textarea
              className={`${styles.fieldTextarea} ${errors.excerpt ? styles.fieldError : ''}`}
              placeholder="Mô tả ngắn về bài viết… (tối thiểu 10 ký tự)"
              rows={2}
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
            />
            {errors.excerpt && <span className={styles.errorMsg}>{errors.excerpt}</span>}
          </div>

          {/* Thumbnail */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Ảnh thumbnail</label>
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
                  width: 80, height: 60, borderRadius: 8, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {form.thumbnailUrl ? (
                  <img
                    src={resolveImageUrl(form.thumbnailUrl)}
                    alt="Xem trước"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 20, opacity: 0.4 }}>🖼</span>
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
                  {uploading ? 'Đang tải lên…' : (form.thumbnailUrl ? 'Đổi ảnh khác' : '📁 Chọn ảnh từ máy')}
                </button>
                {form.thumbnailUrl && !uploading && (
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
            {errors.thumbnailUrl && <span className={styles.errorMsg}>{errors.thumbnailUrl}</span>}
          </div>

          {/* Status (chỉ hiện khi edit) */}
          {isEdit && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Trạng thái</label>
              <select
                className={styles.fieldSelect}
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {statusesList.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Content */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nội dung <span className={styles.required}>*</span></label>
            <textarea
              className={`${styles.fieldTextarea} ${errors.content ? styles.fieldError : ''}`}
              placeholder="Nhập nội dung bài viết… (tối thiểu 10 ký tự)"
              rows={6}
              value={form.content}
              onChange={e => set('content', e.target.value)}
            />
            {errors.content && <span className={styles.errorMsg}>{errors.content}</span>}
          </div>

        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <div className={styles.modalActions}>
            {!isEdit && (
              <button
                className={styles.btnDraft}
                onClick={() => handleSave('Draft')}
                disabled={loading}
              >
                {loading ? <span className={styles.spinner} /> : null}
                Lưu nháp
              </button>
            )}
            <button
              className={styles.btnPublish}
              onClick={() => handleSave(isEdit ? form.status : 'Published')}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : '✦ '}
              {isEdit ? 'Lưu thay đổi' : 'Xuất bản'}
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
export default function PostsPage() {
  const { user: currentUser } = useAuth();
  const { enums } = useEnumOptions();
  const categoriesList = enums.postCategories;
  const statusesList = enums.postStatuses;
  const categoryValueByKey = toValueMapByKey(categoriesList);
  const categoryLabelByKey = toLabelMapByKey(categoriesList);
  const statusValueByKey = toValueMapByKey(statusesList);
  const statusLabelByKey = toLabelMapByKey(statusesList);
  const statusesFilter = [
    { key: 'all', label: 'Tất cả' },
    ...statusesList.map(s => ({ key: s.key, label: s.label })),
  ];

  const [posts, setPosts]         = useState([]);
  const [totalCount, setTotal]    = useState(0);
  const [totalPages, setTotalPg]  = useState(1);
  const [loading, setLoading]     = useState(true);

  const [search, setSearch]       = useState('');
  const [activeSt, setActiveSt]   = useState('all');
  const [page, setPage]           = useState(1);

  const [selected, setSelected]   = useState([]);
  const [modal, setModal]         = useState(null);
  const [toasts, setToasts]       = useState([]);

  /* Toast */
  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  /* Fetch */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetPosts(page, search, activeSt);
      setPosts(data.items ?? []);
      setTotal(data.totalCount ?? 0);
      setTotalPg(data.totalPages ?? 1);
    } catch (err) {
      addToast('Không tải được danh sách bài: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeSt]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  /* Search debounce */
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  /* Selection */
  const toggleSel = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => {
    const ids = posts.map(p => p.id);
    const allChecked = ids.every(id => selected.includes(id));
    setSelected(allChecked ? selected.filter(id => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  };

  /* Save (tạo hoặc sửa) */
  const handleSave = async (formData, editId) => {
    // Map form → API payload
    const payload = {
      title:        formData.title,
      excerpt:      formData.excerpt,
      content:      formData.content,
      thumbnailUrl: formData.thumbnailUrl || null,
      coverImageUrl: null,
      category:     categoryValueByKey[formData.category] ?? 0,
      status:       statusValueByKey[formData.status] ?? 0,
      isFeatured:   !!formData.isFeatured,
      isPinned:     !!formData.isPinned,
      eventDate:    formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
      ...(editId ? {} : { authorId: currentUser?.id }),
    };

    try {
      if (editId) {
        await apiUpdate(editId, payload);
        addToast('Cập nhật bài viết thành công');
      } else {
        await apiCreate(payload);
        addToast('Đăng bài viết thành công');
      }
      setModal(null);
      setPage(1);
      fetchPosts();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  /* Delete */
  const handleDelete = async (post) => {
    if (!confirm(`Xoá bài "${post.title}"?`)) return;
    try {
      await apiDelete(post.id);
      setSelected(s => s.filter(id => id !== post.id));
      addToast('Đã xoá bài viết');
      fetchPosts();
    } catch (err) {
      addToast('Lỗi xoá: ' + err.message, 'error');
    }
  };

  /* Open edit modal — gọi API lấy chi tiết đầy đủ (list row không có content) */
  const openEdit = async (post) => {
    try {
      const detail = await apiGetPostDetail(post.id);
      setModal({
        mode: 'edit',
        post: {
          id:           detail.id,
          icon:         '✦',
          title:        detail.title,
          excerpt:      detail.excerpt,
          content:      detail.content,
          thumbnailUrl: detail.thumbnailUrl ?? '',
          category:     categoryLabelByKey[detail.category] ? detail.category : (categoriesList[0]?.key ?? detail.category), // key từ API: "TinTuc" | "ThongBao" | ...
          status:       detail.status, // key từ API: "Draft" | "Published" | "Archived"
          eventDate:    detail.eventDate ? detail.eventDate.slice(0, 10) : '', // ISO -> "yyyy-MM-dd" cho input type="date"
          isFeatured:   !!detail.isFeatured,
          isPinned:     !!detail.isPinned,
        },
      });
    } catch (err) {
      addToast('Không tải được nội dung bài viết: ' + err.message, 'error');
    }
  };

  const chipClass = (key) => {
    const m = { all: 'activeAll', Published: 'activePublished', Draft: 'activeDraft', Archived: 'activeReview' };
    return styles[m[key]] ?? '';
  };

  const publishedCount = posts.filter(p => p.status === 'Published').length;

  return (
    <>
      <Toast toasts={toasts} />

      {modal && (
        <PostModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.post : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          categoriesList={categoriesList}
          statusesList={statusesList}
        />
      )}

      <div className={styles.postsPage}>

        {/* Header */}
        <div className={styles.postsTopbar}>
          <div>
            <h1 className={styles.postsHeading}>Quản lý bài viết</h1>
            <p className={styles.postsSub}>
              {totalCount} bài viết · {publishedCount} đã đăng (trang này)
            </p>
          </div>
          <button className={styles.postsAddBtn} onClick={() => setModal({ mode: 'create' })}>
            + Thêm bài viết
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.postsToolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Tìm bài viết…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.chips}>
            {statusesFilter.map(s => (
              <button
                key={s.key}
                className={`${styles.chip} ${activeSt === s.key ? chipClass(s.key) : ''}`}
                onClick={() => { setActiveSt(s.key); setPage(1); }}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkInfo}>Đã chọn {selected.length} bài viết</span>
            <button
              className={`${styles.bulkBtn} ${styles.danger}`}
              onClick={() => setSelected([])}
            >Bỏ chọn</button>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            <input
              type="checkbox"
              className={styles.rowCb}
              checked={posts.length > 0 && posts.every(p => selected.includes(p.id))}
              onChange={toggleAll}
            />
            {['Bài viết', 'Ngày đăng', 'Bình luận', 'Trạng thái', 'Thao tác'].map(h => (
              <div key={h} className={styles.th}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.tableEmpty}>Đang tải…</div>
          ) : posts.length === 0 ? (
            <div className={styles.tableEmpty}>Không tìm thấy bài viết phù hợp.</div>
          ) : posts.map((post, i) => {
            const style = STATUS_STYLES[post.status] ?? STATUS_STYLES['Draft'];
            const statusLabel = statusLabelByKey[post.status] ?? post.status;
            return (
              <div key={post.id} className={styles.tableRow} style={{ animationDelay: `${i * 30}ms` }}>
                <input
                  type="checkbox"
                  className={styles.rowCb}
                  checked={selected.includes(post.id)}
                  onChange={() => toggleSel(post.id)}
                  onClick={e => e.stopPropagation()}
                />
                <div className={styles.postInfo}>
                  <div className={styles.postThumb}>✦</div>
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.postTitle} title={post.title}>{post.title}</div>
                    <div className={styles.postAuthor}>{post.authorName}</div>
                  </div>
                </div>
                <div className={styles.dateCell}>{fmtDate(post.createdAt)}</div>
                <div className={styles.statCell}>{post.commentCount}</div>
                <div>
                  <span className={styles.statusPill} style={{ background: style.bg, color: style.color }}>
                    <span className={styles.statusDot} style={{ background: style.dot }} />
                    {statusLabel}
                  </span>
                </div>
                <div className={styles.rowActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={e => { e.stopPropagation(); openEdit(post); }}
                  >Sửa</button>
                  <button
                    className={`${styles.actionBtn} ${styles.del}`}
                    onClick={e => { e.stopPropagation(); handleDelete(post); }}
                  >Xoá</button>
                </div>
              </div>
            );
          })}

          {/* Footer / Pagination */}
          <div className={styles.tableFoot}>
            <span className={styles.footInfo}>
              {totalCount === 0 ? 'Không có bài viết' : `Tổng ${totalCount} bài`}
            </span>
            <div className={styles.pager}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`${styles.pageBtn} ${n === page ? styles.active : ''}`}
                  onClick={() => setPage(n)}
                >{n}</button>
              ))}
              <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
