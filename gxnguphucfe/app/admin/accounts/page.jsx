'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './accounts.module.css';
import { apiFor, safeApiFetch } from '@/app/lib/apiClient';
import { useAuth } from '@/app/contexts/AuthContext';

/* ── Config ── */
const PAGE_SIZE = 10;

const ROLE_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Admin', label: 'Admin' },
  { key: 'User', label: 'User' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'locked', label: 'Đã khoá' },
];

const APPROVAL_FILTERS = [
  { key: 'all', label: 'Mọi trạng thái duyệt' },
  { key: 'Pending', label: 'Chờ duyệt' },
  { key: 'Approved', label: 'Đã duyệt' },
  { key: 'Rejected', label: 'Đã từ chối' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  role: 'User',
  ministryId: '',
};

// Backend nhận Role dưới dạng SỐ (enum UserRole: User = 0, Admin = 1), không
// tự parse được chuỗi "User"/"Admin" vì không cấu hình JsonStringEnumConverter.
// UI vẫn làm việc với chuỗi cho dễ đọc, nhưng phải đổi sang số ngay trước khi
// gửi lên API (giống cách trang Bài viết đang làm với Status/Category).
const ROLE_VALUE = { User: 0, Admin: 1 };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── API helpers ── */
const apiFetch = apiFor('/api/account');

function buildQuery({ page, search, role, status, approval }) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('pageSize', PAGE_SIZE);
  if (search) params.set('search', search);
  if (role !== 'all') params.set('role', role);
  if (status !== 'all') params.set('isActive', status === 'active' ? 'true' : 'false');
  if (approval && approval !== 'all') params.set('approvalStatus', APPROVAL_VALUE[approval]);
  return params.toString();
}

// Backend nhận ApprovalStatus dưới dạng SỐ (enum UserApprovalStatus: Pending=0, Approved=1, Rejected=2)
const APPROVAL_VALUE = { Pending: 0, Approved: 1, Rejected: 2 };

const apiGetList = (filters) => apiFetch(`?${buildQuery(filters)}`);
const apiCreate = (data) => apiFetch('', { method: 'POST', body: JSON.stringify(data) });
const apiUpdateRole = (id, role) => apiFetch(`/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
const apiUpdateStatus = (id, isActive) => apiFetch(`/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) });
const apiUpdateMinistry = (id, ministryId) => apiFetch(`/${id}/ministry`, { method: 'PUT', body: JSON.stringify({ ministryId }) });
const apiUpdateApproval = (id, approvalStatus) => apiFetch(`/${id}/approval`, { method: 'PUT', body: JSON.stringify({ approvalStatus: APPROVAL_VALUE[approvalStatus] }) });
const apiResetPassword = (id, newPassword) => apiFetch(`/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ newPassword: newPassword || null }) });
const apiDelete = (id) => apiFetch(`/${id}`, { method: 'DELETE' });

// Danh sách đoàn thể để hiển thị dropdown gán cho tài khoản role User
const apiGetMinistries = () => safeApiFetch('/api/ministries/admin').then((r) => r ?? []);

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
   Modal tạo tài khoản
════════════════════════════════ */
function CreateAccountModal({ onClose, onSave, ministries }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    if (!form.password || form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        ...form,
        ministryId: form.role === 'User' && form.ministryId ? Number(form.ministryId) : null,
      });
    } catch (err) {
      setErrors((e) => ({ ...e, form: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Tạo tài khoản mới</h3>
            <p className={styles.modalSub}>Dùng cho tài khoản nhân sự / Ban quản trị</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {errors.form && <div className={styles.errorMsg}>{errors.form}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Họ tên <span className={styles.required}>*</span></label>
            <input
              className={`${styles.fieldInput} ${errors.fullName ? styles.fieldError : ''}`}
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email <span className={styles.required}>*</span></label>
            <input
              type="email"
              className={`${styles.fieldInput} ${errors.email ? styles.fieldError : ''}`}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="example@gmail.com"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mật khẩu <span className={styles.required}>*</span></label>
            <input
              type="password"
              className={`${styles.fieldInput} ${errors.password ? styles.fieldError : ''}`}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Vai trò</label>
            <select
              className={styles.fieldSelect}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {form.role === 'User' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Đoàn thể</label>
              <select
                className={styles.fieldSelect}
                value={form.ministryId}
                onChange={(e) => set('ministryId', e.target.value)}
              >
                <option value="">— Chưa gán (gán sau ở danh sách) —</option>
                {ministries.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Modal xác nhận xoá
════════════════════════════════ */
function ConfirmDeleteModal({ account, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Xoá tài khoản</h3>
            <p className={styles.modalSub}>Hành động này không thể hoàn tác</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Bạn có chắc muốn xoá tài khoản <strong style={{ color: '#e2e8f0' }}>{account.fullName}</strong> ({account.email})?
          </p>
          {error && <div className={styles.errorMsg}>{error}</div>}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
          <button className={styles.btnDanger} onClick={handleConfirm} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Xoá tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Modal đặt lại mật khẩu (Admin reset password)
════════════════════════════════ */
function ResetPasswordModal({ account, onClose, onConfirm }) {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { newPassword } sau khi thành công
  const [copied, setCopied] = useState(false);

  const handleConfirm = async () => {
    if (mode === 'manual' && password.trim().length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await onConfirm(mode === 'manual' ? password.trim() : null);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard không khả dụng (http/không có quyền) — bỏ qua, admin vẫn thấy mật khẩu để copy tay
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Đặt lại mật khẩu</h3>
            <p className={styles.modalSub}>{account.fullName} ({account.email})</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} disabled={loading}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {!result ? (
            <>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Mọi phiên đăng nhập hiện tại của tài khoản này sẽ bị đăng xuất sau khi đặt lại mật khẩu.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Cách đặt mật khẩu</label>
                <select
                  className={styles.fieldSelect}
                  value={mode}
                  onChange={(e) => { setMode(e.target.value); setError(''); }}
                >
                  <option value="auto">Tự động sinh mật khẩu ngẫu nhiên</option>
                  <option value="manual">Tự nhập mật khẩu mới</option>
                </select>
              </div>

              {mode === 'manual' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Mật khẩu mới</label>
                  <input
                    type="text"
                    className={`${styles.fieldInput} ${error ? styles.fieldError : ''}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              )}

              {error && <div className={styles.errorMsg}>{error}</div>}
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Đã đặt lại mật khẩu thành công{result.emailSent === false ? '' : ' và gửi email cho người dùng'}.
                Mật khẩu mới (chỉ hiển thị 1 lần):
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#0f1220', border: '1px solid #1e2540', borderRadius: 8,
                padding: '0.6rem 0.75rem',
              }}>
                <code style={{ flex: 1, fontSize: '0.95rem', color: '#6ee7b7', letterSpacing: '0.03em' }}>
                  {result.newPassword}
                </code>
                <button className={styles.actionBtn} onClick={handleCopy} type="button">
                  {copied ? 'Đã chép' : 'Chép'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          {!result ? (
            <>
              <button className={styles.btnCancel} onClick={onClose} disabled={loading}>Huỷ</button>
              <button className={styles.btnPrimary} onClick={handleConfirm} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Đặt lại mật khẩu'}
              </button>
            </>
          ) : (
            <button className={styles.btnPrimary} onClick={onClose}>Đóng</button>
          )}
        </div>
      </div>
    </div>
  );
}


export default function AccountsAdminPage() {
  const { user: currentUser } = useAuth();

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [ministries, setMinistries] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  useEffect(() => {
    apiGetMinistries().then(setMinistries);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGetList({ page, search, role: roleFilter, status: statusFilter, approval: approvalFilter });
      setItems(result.items);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.totalCount || 0);
    } catch (err) {
      addToast(err.message || 'Không tải được danh sách tài khoản', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, approvalFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset về trang 1 khi đổi bộ lọc/tìm kiếm
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, approvalFilter]);

  const handleCreate = async (form) => {
    await apiCreate({ ...form, role: ROLE_VALUE[form.role] ?? 0 });
    setShowCreate(false);
    addToast('Đã tạo tài khoản mới');
    load();
  };

  const handleRoleChange = async (account, role) => {
    setBusyId(account.id);
    try {
      await apiUpdateRole(account.id, ROLE_VALUE[role] ?? 0);
      addToast(`Đã đổi vai trò của ${account.fullName} thành ${role}`);
      load();
    } catch (err) {
      addToast(err.message || 'Không thể đổi vai trò', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleMinistryChange = async (account, ministryIdRaw) => {
    const ministryId = ministryIdRaw === '' ? null : Number(ministryIdRaw);
    setBusyId(account.id);
    try {
      await apiUpdateMinistry(account.id, ministryId);
      addToast(
        ministryId
          ? `Đã gán ${account.fullName} vào đoàn thể đã chọn`
          : `Đã bỏ gán đoàn thể của ${account.fullName}`
      );
      load();
    } catch (err) {
      addToast(err.message || 'Không thể đổi đoàn thể', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusToggle = async (account) => {
    setBusyId(account.id);
    try {
      await apiUpdateStatus(account.id, !account.isActive);
      addToast(account.isActive ? `Đã khoá tài khoản ${account.fullName}` : `Đã mở khoá tài khoản ${account.fullName}`);
      load();
    } catch (err) {
      addToast(err.message || 'Không thể thay đổi trạng thái', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleApproval = async (account, approvalStatus) => {
    setBusyId(account.id);
    try {
      await apiUpdateApproval(account.id, approvalStatus);
      addToast(
        approvalStatus === 'Approved'
          ? `Đã duyệt tài khoản ${account.fullName}`
          : `Đã từ chối tài khoản ${account.fullName}`
      );
      load();
    } catch (err) {
      addToast(err.message || 'Không thể cập nhật trạng thái duyệt', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (newPassword) => {
    const data = await apiResetPassword(resetTarget.id, newPassword);
    addToast(`Đã đặt lại mật khẩu cho ${resetTarget.fullName}`);
    load();
    return data; // { userId, email, newPassword } — hiển thị trong modal
  };

  const handleDelete = async () => {
    await apiDelete(deleteTarget.id);
    addToast(`Đã xoá tài khoản ${deleteTarget.fullName}`);
    setDeleteTarget(null);
    load();
  };

  return (
    <div className={styles.page}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div className={styles.topbar}>
        <div>
          <h2 className={styles.heading}>Quản lý tài khoản</h2>
          <p className={styles.sub}>{totalCount} tài khoản</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          + Tạo tài khoản
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.chips}>
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.chip} ${roleFilter === f.key ? styles.chipActive : ''}`}
              onClick={() => setRoleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.chips}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.chip} ${statusFilter === f.key ? styles.chipActive : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.chips}>
          {APPROVAL_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.chip} ${approvalFilter === f.key ? styles.chipActive : ''}`}
              onClick={() => setApprovalFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.th}>Tài khoản</span>
          <span className={styles.th}>Vai trò</span>
          <span className={styles.th}>Đoàn thể</span>
          <span className={styles.th}>Trạng thái</span>
          <span className={styles.th}>Đăng nhập gần nhất</span>
          <span className={styles.th}>Ngày tạo</span>
          <span className={styles.th}></span>
        </div>

        {loading ? (
          <div className={styles.tableEmpty}>Đang tải...</div>
        ) : items.length === 0 ? (
          <div className={styles.tableEmpty}>Không có tài khoản nào phù hợp</div>
        ) : (
          items.map((acc) => {
            const isSelf = acc.id === currentUser?.id;
            const busy = busyId === acc.id;
            return (
              <div className={styles.tableRow} key={acc.id}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>{acc.fullName.trim().charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.userName}>
                      {acc.fullName}
                      {isSelf && <span className={styles.youTag}>(bạn)</span>}
                      {acc.approvalStatus === 'Pending' && (
                        <span className={styles.youTag} style={{ color: '#fbbf24' }}>Chờ duyệt</span>
                      )}
                      {acc.approvalStatus === 'Rejected' && (
                        <span className={styles.youTag} style={{ color: '#f87171' }}>Đã từ chối</span>
                      )}
                    </div>
                    <div className={styles.userEmail}>{acc.email}</div>
                  </div>
                </div>

                <select
                  className={`${styles.roleSelect} ${acc.role === 'Admin' ? styles.roleAdmin : styles.roleUser}`}
                  value={acc.role}
                  disabled={isSelf || busy}
                  onChange={(e) => handleRoleChange(acc, e.target.value)}
                  title={isSelf ? 'Không thể tự đổi vai trò của chính mình' : ''}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>

                {acc.role === 'Admin' ? (
                  <span className={styles.dateCell} title="Tài khoản Admin không cần gán đoàn thể">—</span>
                ) : (
                  <select
                    className={styles.roleSelect}
                    value={acc.ministryId ?? ''}
                    disabled={busy}
                    onChange={(e) => handleMinistryChange(acc, e.target.value)}
                    title="Đoàn thể quản lý bài viết"
                  >
                    <option value="">— Chưa gán —</option>
                    {ministries.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}

                <button
                  className={`${styles.statusPill} ${acc.isActive ? styles.statusActive : styles.statusLocked}`}
                  disabled={isSelf || busy}
                  onClick={() => handleStatusToggle(acc)}
                  title={isSelf ? 'Không thể tự khoá tài khoản của chính mình' : 'Bấm để đổi trạng thái'}
                >
                  <span className={styles.statusDot} />
                  {acc.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                </button>

                <span className={styles.dateCell}>{fmtDate(acc.lastLoginAt)}</span>
                <span className={styles.dateCell}>{fmtDate(acc.createdAt)}</span>

                <div className={styles.rowActions}>
                  {acc.approvalStatus === 'Pending' && (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.pendingAction}`}
                        disabled={busy}
                        onClick={() => handleApproval(acc, 'Approved')}
                        title="Duyệt tài khoản"
                      >
                        Duyệt
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.del} ${styles.pendingAction}`}
                        disabled={busy}
                        onClick={() => handleApproval(acc, 'Rejected')}
                        title="Từ chối tài khoản"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    className={styles.actionBtn}
                    disabled={busy}
                    onClick={() => setResetTarget(acc)}
                    title="Đặt lại mật khẩu"
                  >
                    Đặt lại MK
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.del}`}
                    disabled={isSelf || busy}
                    onClick={() => setDeleteTarget(acc)}
                    title={isSelf ? 'Không thể tự xoá tài khoản của chính mình' : 'Xoá'}
                  >
                    Xoá
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className={styles.tableFoot}>
          <span className={styles.footInfo}>Trang {page} / {totalPages}</span>
          <div className={styles.pager}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => (
                <span key={p} style={{ display: 'flex' }}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className={styles.pageBtn} style={{ border: 'none' }}>…</span>}
                  <button
                    className={`${styles.pageBtn} ${p === page ? styles.active : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateAccountModal onClose={() => setShowCreate(false)} onSave={handleCreate} ministries={ministries} />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          account={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          account={resetTarget}
          onClose={() => setResetTarget(null)}
          onConfirm={handleResetPassword}
        />
      )}
    </div>
  );
}
