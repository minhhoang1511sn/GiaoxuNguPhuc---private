'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './contact-info.module.css';
import { apiGetContactInfoAdmin, apiUpdateContactInfo } from '@/app/lib/useContactInfo';

const EMPTY_FORM = {
  parishName: '',
  address: '',
  phone: '',
  emergencyPhone: '',
  email: '',
  facebook: '',
  youtube: '',
  zalo: '',
  mapEmbedUrl: '',
  mapUrl: '',
  officeHours: '',
  massSchedule: '',
};

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

export default function ContactInfoAdminPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const fetchContact = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetContactInfoAdmin();
      setForm({
        parishName: data.parishName ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        emergencyPhone: data.emergencyPhone ?? '',
        email: data.email ?? '',
        facebook: data.facebook ?? '',
        youtube: data.youtube ?? '',
        zalo: data.zalo ?? '',
        mapEmbedUrl: data.mapEmbedUrl ?? '',
        mapUrl: data.mapUrl ?? '',
        officeHours: data.officeHours ?? '',
        massSchedule: data.massSchedule ?? '',
      });
    } catch (err) {
      addToast('Không tải được thông tin liên hệ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContact(); }, [fetchContact]);

  const validate = () => {
    const e = {};
    if (!form.parishName.trim() || form.parishName.trim().length < 2) e.parishName = 'Vui lòng nhập tên giáo xứ';
    if (!form.address.trim() || form.address.trim().length < 2) e.address = 'Vui lòng nhập địa chỉ';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Email không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      addToast('Vui lòng kiểm tra lại các trường bắt buộc', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        parishName: form.parishName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        emergencyPhone: form.emergencyPhone.trim() || null,
        email: form.email.trim(),
        facebook: form.facebook.trim() || null,
        youtube: form.youtube.trim() || null,
        zalo: form.zalo.trim() || null,
        mapEmbedUrl: form.mapEmbedUrl.trim() || null,
        mapUrl: form.mapUrl.trim() || null,
        officeHours: form.officeHours.trim() || null,
        massSchedule: form.massSchedule.trim() || null,
      };
      await apiUpdateContactInfo(payload);
      addToast('Đã lưu thông tin liên hệ. Trang công khai sẽ hiển thị dữ liệu mới.');
    } catch (err) {
      addToast('Lỗi khi lưu: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} />

      <div className={styles.page}>
        {/* Header */}
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.heading}>Thông tin liên hệ</h1>
            <p className={styles.sub}>
              Dữ liệu này hiển thị ở trang "Liên hệ", chân trang (Footer) và các widget hỗ trợ phía công khai — lấy trực tiếp từ đây, không còn set cứng.
            </p>
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving || loading}>
            {saving ? <span className={styles.spinner} /> : '✦ '}
            Lưu thay đổi
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>Đang tải…</div>
        ) : (
          <div className={styles.grid}>
            {/* Cột trái: form nhập */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Thông tin cơ bản</h3>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tên giáo xứ <span className={styles.required}>*</span></label>
                <input
                  className={`${styles.fieldInput} ${errors.parishName ? styles.fieldError : ''}`}
                  placeholder="VD: Giáo xứ Ngũ Phúc"
                  value={form.parishName}
                  onChange={(e) => set('parishName', e.target.value)}
                />
                {errors.parishName && <span className={styles.errorMsg}>{errors.parishName}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Địa chỉ <span className={styles.required}>*</span></label>
                <input
                  className={`${styles.fieldInput} ${errors.address ? styles.fieldError : ''}`}
                  placeholder="VD: Hố Nai 3, Trảng Bom, Đồng Nai"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                />
                {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Điện thoại văn phòng <span className={styles.required}>*</span></label>
                  <input
                    className={`${styles.fieldInput} ${errors.phone ? styles.fieldError : ''}`}
                    placeholder="VD: (028) 3845 6789"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                  {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Điện thoại khẩn cấp</label>
                  <input
                    className={styles.fieldInput}
                    placeholder="VD: 090 123 4567"
                    value={form.emergencyPhone}
                    onChange={(e) => set('emergencyPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email <span className={styles.required}>*</span></label>
                <input
                  className={`${styles.fieldInput} ${errors.email ? styles.fieldError : ''}`}
                  placeholder="VD: giaoxu@nguphuc.org"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
              </div>

              <h3 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>Mạng xã hội</h3>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Facebook</label>
                  <input
                    className={styles.fieldInput}
                    placeholder="https://facebook.com/..."
                    value={form.facebook}
                    onChange={(e) => set('facebook', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Youtube</label>
                  <input
                    className={styles.fieldInput}
                    placeholder="https://youtube.com/..."
                    value={form.youtube}
                    onChange={(e) => set('youtube', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Zalo</label>
                <input
                  className={styles.fieldInput}
                  placeholder="Số Zalo liên hệ"
                  value={form.zalo}
                  onChange={(e) => set('zalo', e.target.value)}
                />
              </div>

              <h3 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>Bản đồ</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Link nhúng Google Maps (embed src)</label>
                <input
                  className={styles.fieldInput}
                  placeholder="https://www.google.com/maps/embed?..."
                  value={form.mapEmbedUrl}
                  onChange={(e) => set('mapEmbedUrl', e.target.value)}
                />
                <span className={styles.hint}>Lấy từ Google Maps → Chia sẻ → Nhúng bản đồ → copy phần src trong iframe.</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Link "Xem trên Google Maps"</label>
                <input
                  className={styles.fieldInput}
                  placeholder="https://maps.app.goo.gl/..."
                  value={form.mapUrl}
                  onChange={(e) => set('mapUrl', e.target.value)}
                />
              </div>

              <h3 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>Giờ lễ &amp; giờ văn phòng</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Giờ Thánh lễ</label>
                <textarea
                  className={styles.fieldTextarea}
                  placeholder="Mỗi dòng ngăn bằng dấu | . VD: Thứ 2 - Thứ 6: 4:30 | Chúa nhật: 4:30 - 7:30 - 17:00"
                  value={form.massSchedule}
                  onChange={(e) => set('massSchedule', e.target.value)}
                />
                <span className={styles.hint}>Dùng dấu "|" để ngăn các dòng — Footer sẽ tự xuống dòng theo dấu này.</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Giờ làm việc văn phòng</label>
                <textarea
                  className={styles.fieldTextarea}
                  placeholder="Mỗi dòng ngăn bằng dấu | . VD: Thứ 2 - Thứ 6: 08:00 - 17:00 | Chúa nhật: Đóng cửa"
                  value={form.officeHours}
                  onChange={(e) => set('officeHours', e.target.value)}
                />
                <span className={styles.hint}>Dùng dấu "|" để ngăn các dòng.</span>
              </div>
            </div>

            {/* Cột phải: preview */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>👁️ Xem trước</h3>
              <p className={styles.cardDesc}>Dữ liệu sẽ hiển thị như thế này ở trang công khai.</p>

              <div className={styles.previewList}>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Tên</span>
                  <span className={form.parishName ? styles.previewVal : styles.previewEmpty}>
                    {form.parishName || 'Chưa nhập'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Địa chỉ</span>
                  <span className={form.address ? styles.previewVal : styles.previewEmpty}>
                    {form.address || 'Chưa nhập'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Điện thoại</span>
                  <span className={form.phone ? styles.previewVal : styles.previewEmpty}>
                    {[form.phone, form.emergencyPhone].filter(Boolean).join(' · ') || 'Chưa nhập'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Email</span>
                  <span className={form.email ? styles.previewVal : styles.previewEmpty}>
                    {form.email || 'Chưa nhập'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Facebook</span>
                  <span className={form.facebook ? styles.previewVal : styles.previewEmpty}>
                    {form.facebook || 'Không có'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Youtube</span>
                  <span className={form.youtube ? styles.previewVal : styles.previewEmpty}>
                    {form.youtube || 'Không có'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Zalo</span>
                  <span className={form.zalo ? styles.previewVal : styles.previewEmpty}>
                    {form.zalo || 'Không có'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Giờ lễ</span>
                  <span className={form.massSchedule ? styles.previewVal : styles.previewEmpty}>
                    {form.massSchedule
                      ? form.massSchedule.split('|').map((l) => l.trim()).filter(Boolean).join(' • ')
                      : 'Chưa nhập'}
                  </span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>Giờ v.phòng</span>
                  <span className={form.officeHours ? styles.previewVal : styles.previewEmpty}>
                    {form.officeHours
                      ? form.officeHours.split('|').map((l) => l.trim()).filter(Boolean).join(' • ')
                      : 'Chưa nhập'}
                  </span>
                </div>
                {form.mapEmbedUrl && (
                  <iframe
                    src={form.mapEmbedUrl}
                    title="Xem trước bản đồ"
                    style={{ border: 0, width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
