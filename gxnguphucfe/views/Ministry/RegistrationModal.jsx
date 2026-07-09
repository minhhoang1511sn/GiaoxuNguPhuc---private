"use client";

import { useState } from "react";
import { publicFor } from "@/app/lib/apiClient";

const apiRegister = publicFor("/api/ministry-registrations");

export default function RegistrationModal({ ministries, defaultMinistryId, onClose }) {
  const [form, setForm] = useState({
    ministryId: defaultMinistryId || (ministries[0]?.id ?? ""),
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.phone.trim() || !form.ministryId) {
      setError("Vui lòng điền đầy đủ họ tên, số điện thoại và chọn đoàn thể.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRegister("", {
        method: "POST",
        body: JSON.stringify({
          ministryId: Number(form.ministryId),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          note: form.note.trim() || null,
        }),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu modal được mở sẵn cho 1 đoàn thể cụ thể (ví dụ từ trang chi tiết đoàn
  // thể) và chỉ có đúng 1 lựa chọn khả dụng, khoá dropdown lại thay vì cho
  // đổi sang đoàn thể khác — tránh người dùng bấm nhầm rồi tưởng đã đăng ký
  // đúng đoàn thể đang xem.
  const lockMinistry = Boolean(defaultMinistryId) && ministries.length <= 1;

  const handleOverlayClick = () => {
    if (submitting) return; // đang gửi thì không cho đóng modal giữa chừng
    onClose();
  };

  return (
    <div className="registration-modal-overlay" onClick={handleOverlayClick}>
      <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="registration-modal-close"
          onClick={onClose}
          disabled={submitting}
          aria-label="Đóng"
        >
          ✕
        </button>

        {success ? (
          <div className="registration-success">
            <div className="registration-success-icon">✓</div>
            <h3>Đăng ký thành công!</h3>
            <p>Cảm ơn bạn đã đăng ký tham gia. Ban phụ trách sẽ liên hệ với bạn sớm nhất.</p>
            <button className="ministry-btn-primary" onClick={onClose}>Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="registration-form">
            <h3 className="registration-title">Đăng ký tham gia đoàn thể</h3>

            <label className="registration-field">
              <span>Đoàn thể muốn tham gia *</span>
              <select
                name="ministryId"
                value={form.ministryId}
                onChange={handleChange}
                disabled={lockMinistry}
              >
                {ministries.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </label>

            <label className="registration-field">
              <span>Họ và tên *</span>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" />
            </label>

            <label className="registration-field">
              <span>Số điện thoại *</span>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="09xxxxxxxx" />
            </label>

            <label className="registration-field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@vidu.com" />
            </label>

            <label className="registration-field">
              <span>Ghi chú / Lý do muốn tham gia</span>
              <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
            </label>

            {error && <p className="registration-error">{error}</p>}

            <button type="submit" className="ministry-btn-primary" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}