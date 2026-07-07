'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';
import { useAuth } from '@/app/contexts/AuthContext';
import { apiUpdateMyProfile, apiChangeMyPassword } from '@/app/lib/useProfile';
import { uploadImage, resolveImageUrl } from '@/app/lib/uploadImage';

const ROLE_LABEL = { Admin: 'Quản trị viên', User: 'Người dùng' };

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

export default function MyProfilePage() {
  const { user, refreshMe, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  if (!user) return null;

  /* ── Cập nhật họ tên / ảnh đại diện ── */

  const setProfile = (k, v) => {
    setProfileForm((f) => ({ ...f, [k]: v }));
    setProfileErrors((e) => ({ ...e, [k]: '' }));
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileErrors((er) => ({ ...er, avatarUrl: 'Vui lòng chọn một file ảnh.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrors((er) => ({ ...er, avatarUrl: 'Kích thước ảnh tối đa là 5MB.' }));
      return;
    }

    setUploading(true);
    setProfileErrors((er) => ({ ...er, avatarUrl: '' }));
    try {
      const url = await uploadImage(file, 'avatars');
      setProfile('avatarUrl', url);
    } catch (err) {
      setProfileErrors((er) => ({ ...er, avatarUrl: 'Tải ảnh lên thất bại: ' + err.message }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => setProfile('avatarUrl', '');

  const validateProfile = () => {
    const e = {};
    if (!profileForm.fullName.trim() || profileForm.fullName.trim().length < 2) {
      e.fullName = 'Vui lòng nhập họ tên (ít nhất 2 ký tự)';
    }
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = async () => {
    if (uploading) return;
    if (!validateProfile()) {
      addToast('Vui lòng kiểm tra lại thông tin', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await apiUpdateMyProfile({
        fullName: profileForm.fullName.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      });
      await refreshMe();
      addToast('Đã cập nhật thông tin cá nhân');
    } catch (err) {
      addToast('Lỗi khi lưu: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Đổi mật khẩu ── */

  const setPw = (k, v) => {
    setPwForm((f) => ({ ...f, [k]: v }));
    setPwErrors((e) => ({ ...e, [k]: '' }));
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) e.newPassword = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    if (pwForm.confirmNewPassword !== pwForm.newPassword) e.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePw()) {
      addToast('Vui lòng kiểm tra lại các trường bắt buộc', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await apiChangeMyPassword(pwForm);
      addToast('Đổi mật khẩu thành công, vui lòng đăng nhập lại...');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      // Đổi mật khẩu thu hồi mọi phiên đăng nhập khác (refresh token) — đăng xuất
      // luôn phiên hiện tại ở đây để người dùng đăng nhập lại bằng mật khẩu mới.
      setTimeout(async () => {
        await logout();
        router.push('/auth/login');
      }, 1200);
    } catch (err) {
      addToast('Lỗi khi đổi mật khẩu: ' + err.message, 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const avatarLetter = (profileForm.fullName || user.email || 'A').trim().charAt(0).toUpperCase();

  return (
    <>
      <Toast toasts={toasts} />

      <div className={styles.page}>
        {/* Header */}
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.heading}>Hồ sơ của tôi</h1>
            <p className={styles.sub}>
              Cập nhật thông tin cá nhân và mật khẩu cho tài khoản đang đăng nhập.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Cột trái: thông tin cá nhân */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>👤 Thông tin cá nhân</h3>

            {/* Thông tin chỉ xem */}
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoVal}>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Vai trò</span>
                <span className={`${styles.badge} ${user.role === 'Admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
              </div>
              {user.ministryName && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Đoàn thể</span>
                  <span className={styles.infoVal}>{user.ministryName}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Trạng thái</span>
                <span className={`${styles.badge} ${user.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {user.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                </span>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Ảnh đại diện */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Ảnh đại diện</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className={styles.avatarRow}>
                <div className={styles.avatarPreview}>
                  {profileForm.avatarUrl ? (
                    <img src={resolveImageUrl(profileForm.avatarUrl)} alt="Ảnh đại diện" />
                  ) : (
                    <span>{avatarLetter}</span>
                  )}
                </div>
                <div className={styles.avatarActions}>
                  <div className={styles.avatarBtns}>
                    <button type="button" className={styles.btnGhost} onClick={handlePickFile} disabled={uploading}>
                      {uploading ? 'Đang tải...' : 'Đổi ảnh'}
                    </button>
                    {profileForm.avatarUrl && (
                      <button type="button" className={styles.btnGhost} onClick={handleRemoveAvatar} disabled={uploading}>
                        Xoá ảnh
                      </button>
                    )}
                  </div>
                  <span className={styles.hint}>JPG, PNG, WEBP hoặc GIF, tối đa 5MB.</span>
                </div>
              </div>
              {profileErrors.avatarUrl && <span className={styles.errorMsg}>{profileErrors.avatarUrl}</span>}
            </div>

            {/* Họ tên */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Họ và tên <span className={styles.required}>*</span></label>
              <input
                className={`${styles.fieldInput} ${profileErrors.fullName ? styles.fieldError : ''}`}
                placeholder="VD: Nguyễn Văn A"
                value={profileForm.fullName}
                onChange={(e) => setProfile('fullName', e.target.value)}
              />
              {profileErrors.fullName && <span className={styles.errorMsg}>{profileErrors.fullName}</span>}
            </div>

            <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={savingProfile || uploading}>
              {savingProfile ? <span className={styles.spinner} /> : '✦ '}
              Lưu thông tin
            </button>
          </div>

          {/* Cột phải: đổi mật khẩu */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>🔒 Đổi mật khẩu</h3>
            <p className={styles.cardDesc}>
              Sau khi đổi mật khẩu, mọi phiên đăng nhập khác (kể cả phiên này) sẽ bị thu hồi — bạn cần đăng nhập lại.
            </p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Mật khẩu hiện tại <span className={styles.required}>*</span></label>
              <input
                type="password"
                autoComplete="current-password"
                className={`${styles.fieldInput} ${pwErrors.currentPassword ? styles.fieldError : ''}`}
                value={pwForm.currentPassword}
                onChange={(e) => setPw('currentPassword', e.target.value)}
              />
              {pwErrors.currentPassword && <span className={styles.errorMsg}>{pwErrors.currentPassword}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Mật khẩu mới <span className={styles.required}>*</span></label>
              <input
                type="password"
                autoComplete="new-password"
                className={`${styles.fieldInput} ${pwErrors.newPassword ? styles.fieldError : ''}`}
                value={pwForm.newPassword}
                onChange={(e) => setPw('newPassword', e.target.value)}
              />
              {pwErrors.newPassword && <span className={styles.errorMsg}>{pwErrors.newPassword}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Xác nhận mật khẩu mới <span className={styles.required}>*</span></label>
              <input
                type="password"
                autoComplete="new-password"
                className={`${styles.fieldInput} ${pwErrors.confirmNewPassword ? styles.fieldError : ''}`}
                value={pwForm.confirmNewPassword}
                onChange={(e) => setPw('confirmNewPassword', e.target.value)}
              />
              {pwErrors.confirmNewPassword && <span className={styles.errorMsg}>{pwErrors.confirmNewPassword}</span>}
            </div>

            <button className={styles.saveBtn} onClick={handleChangePassword} disabled={savingPw}>
              {savingPw ? <span className={styles.spinner} /> : '✦ '}
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
