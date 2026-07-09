"use client";

import { useState, useEffect } from "react";
import "./Register.css";
import { usePageBanner } from "@/app/lib/usePageBanner";
import { API_BASE_URL } from "@/app/lib/apiClient";

/* ── Config ── */

const SCHOOL_YEARS = ["2026-2027", "2027-2028"];

const EMPTY_FORM = {
  fullName: "",
  dateOfBirth: "",
  gender: "Nam",
  fatherName: "",
  motherName: "",
  phone: "",
  email: "",
  address: "",
  parishZone: "",
  classType: 0,
  schoolYear: SCHOOL_YEARS[0],
  isBaptized: false,
  baptismPlace: "",
  note: "",
};

function isMinor(classTypeValue) {
  // Dự Tòng & Giáo lý Hôn nhân là lớp cho người lớn -> ẩn thông tin cha mẹ
  return classTypeValue !== 4 && classTypeValue !== 5;
}

export default function RegisterPage() {
  const { bannerUrl } = usePageBanner("register");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Danh sách khóa học lấy từ API (bảng CatechismClasses do admin quản lý)
  // thay vì viết cứng ở frontend, để admin có thể thêm mới/sửa/ẩn khóa học.
  const [classTypes, setClassTypes] = useState([]);
  const [classTypesLoading, setClassTypesLoading] = useState(true);
  const [classTypesError, setClassTypesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/catechism-classes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        const list = data.map((c) => ({
          key: String(c.id),
          value: c.classType,
          label: c.name,
          desc: c.description ?? "",
        }));
        setClassTypes(list);
        if (list.length > 0) {
          setForm((f) => ({ ...f, classType: list[0].value }));
        }
      } catch (err) {
        if (!cancelled) setClassTypesError("Không tải được danh sách khóa học, vui lòng tải lại trang.");
      } finally {
        if (!cancelled) setClassTypesLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = "Vui lòng nhập họ và tên đầy đủ";
    if (!form.phone.trim() || form.phone.trim().length < 9)
      e.phone = "Vui lòng nhập số điện thoại hợp lệ";
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = "Vui lòng nhập địa chỉ đầy đủ";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.schoolYear) e.schoolYear = "Vui lòng chọn niên khóa";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        fatherName: isMinor(Number(form.classType)) ? form.fatherName || null : null,
        motherName: isMinor(Number(form.classType)) ? form.motherName || null : null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        parishZone: form.parishZone.trim() || null,
        classType: Number(form.classType),
        schoolYear: form.schoolYear,
        isBaptized: form.isBaptized,
        baptismPlace: form.isBaptized ? form.baptismPlace || null : null,
        note: form.note.trim() || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/catechism-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setErrorMsg("Gửi đơn không thành công, vui lòng thử lại. (" + err.message + ")");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classTypes.find((c) => c.value === Number(form.classType));
  const showParentFields = isMinor(Number(form.classType));

  return (
    <div className="reg-page">
      {/* Hero */}
      <div
        className="reg-hero-wrap"
        style={bannerUrl ? {
          backgroundImage: `linear-gradient(135deg, rgba(30,64,175,0.85) 0%, rgba(37,99,235,0.78) 100%), url('${bannerUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        <div className="reg-hero">
          <div className="reg-hero-text">
            <h1 className="reg-hero-title">Đăng Ký Học Giáo Lý</h1>
            <p className="reg-hero-sub">
              Ghi danh cho các lớp Khai Tâm, Rước Lễ, Thêm Sức, Bao Đồng, Dự Tòng và Giáo lý Hôn nhân của Giáo xứ Ngũ Phúc.
            </p>
          </div>
        </div>
      </div>

      <main className="reg-main">
        <div className="reg-container">
          {submitted ? (
            <div className="reg-success-card">
              <div className="reg-success-icon">✓</div>
              <h2 className="reg-success-title">Đã gửi đơn đăng ký thành công!</h2>
              <p className="reg-success-desc">
                Ban Giáo Lý sẽ liên hệ với quý vị qua số điện thoại đã cung cấp để xác nhận và hướng dẫn các bước tiếp theo.
              </p>
              <button className="reg-submit-btn" onClick={() => setSubmitted(false)}>
                Gửi đơn khác
              </button>
            </div>
          ) : (
            <form className="reg-form-card" onSubmit={handleSubmit}>
              {/* Chọn lớp giáo lý */}
              <section className="reg-section">
                <h2 className="reg-section-title">Lớp giáo lý muốn đăng ký</h2>
                {classTypesLoading ? (
                  <p className="reg-error-msg">Đang tải danh sách khóa học…</p>
                ) : classTypesError ? (
                  <p className="reg-error-msg">{classTypesError}</p>
                ) : (
                  <div className="reg-class-grid">
                    {classTypes.map((c) => (
                      <label
                        key={c.key}
                        className={`reg-class-card ${Number(form.classType) === c.value ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="classType"
                          value={c.value}
                          checked={Number(form.classType) === c.value}
                          onChange={() => set("classType", c.value)}
                        />
                        <span className="reg-class-name">{c.label}</span>
                        <span className="reg-class-desc">{c.desc}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="reg-field-group">
                  <label className="reg-field-label">
                    Niên khóa <span className="reg-required">*</span>
                  </label>
                  <select
                    className="reg-field-select"
                    value={form.schoolYear}
                    onChange={(e) => set("schoolYear", e.target.value)}
                  >
                    {SCHOOL_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.schoolYear && <span className="reg-error-msg">{errors.schoolYear}</span>}
                </div>
              </section>

              {/* Thông tin học viên */}
              <section className="reg-section">
                <h2 className="reg-section-title">
                  Thông tin {showParentFields ? "học viên" : "người đăng ký"}
                </h2>

                <div className="reg-field-row">
                  <div className="reg-field-group">
                    <label className="reg-field-label">
                      Họ và tên <span className="reg-required">*</span>
                    </label>
                    <input
                      className={`reg-field-input ${errors.fullName ? "error" : ""}`}
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                    />
                    {errors.fullName && <span className="reg-error-msg">{errors.fullName}</span>}
                  </div>

                  <div className="reg-field-group">
                    <label className="reg-field-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="reg-field-input"
                      value={form.dateOfBirth}
                      onChange={(e) => set("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="reg-field-row">
                  <div className="reg-field-group">
                    <label className="reg-field-label">Giới tính</label>
                    <div className="reg-radio-group">
                      {["Nam", "Nữ"].map((g) => (
                        <label key={g} className="reg-radio-pill">
                          <input
                            type="radio"
                            name="gender"
                            checked={form.gender === g}
                            onChange={() => set("gender", g)}
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="reg-field-group">
                    <label className="reg-field-label">Giáo khu</label>
                    <input
                      className="reg-field-input"
                      placeholder="VD: Giáo khu Thánh Giuse"
                      value={form.parishZone}
                      onChange={(e) => set("parishZone", e.target.value)}
                    />
                  </div>
                </div>

                {showParentFields && (
                  <div className="reg-field-row">
                    <div className="reg-field-group">
                      <label className="reg-field-label">Họ tên Cha</label>
                      <input
                        className="reg-field-input"
                        value={form.fatherName}
                        onChange={(e) => set("fatherName", e.target.value)}
                      />
                    </div>
                    <div className="reg-field-group">
                      <label className="reg-field-label">Họ tên Mẹ</label>
                      <input
                        className="reg-field-input"
                        value={form.motherName}
                        onChange={(e) => set("motherName", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="reg-field-group">
                  <label className="reg-checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.isBaptized}
                      onChange={(e) => set("isBaptized", e.target.checked)}
                    />
                    Đã được Rửa Tội
                  </label>
                </div>

                {form.isBaptized && (
                  <div className="reg-field-group">
                    <label className="reg-field-label">Nơi Rửa Tội</label>
                    <input
                      className="reg-field-input"
                      placeholder="VD: Giáo xứ Ngũ Phúc, năm 2015"
                      value={form.baptismPlace}
                      onChange={(e) => set("baptismPlace", e.target.value)}
                    />
                  </div>
                )}
              </section>

              {/* Thông tin liên hệ */}
              <section className="reg-section">
                <h2 className="reg-section-title">Thông tin liên hệ</h2>

                <div className="reg-field-row">
                  <div className="reg-field-group">
                    <label className="reg-field-label">
                      Số điện thoại <span className="reg-required">*</span>
                    </label>
                    <input
                      className={`reg-field-input ${errors.phone ? "error" : ""}`}
                      placeholder="09xxxxxxxx"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                    {errors.phone && <span className="reg-error-msg">{errors.phone}</span>}
                  </div>

                  <div className="reg-field-group">
                    <label className="reg-field-label">Email</label>
                    <input
                      className={`reg-field-input ${errors.email ? "error" : ""}`}
                      placeholder="email@example.com (không bắt buộc)"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                    {errors.email && <span className="reg-error-msg">{errors.email}</span>}
                  </div>
                </div>

                <div className="reg-field-group">
                  <label className="reg-field-label">
                    Địa chỉ <span className="reg-required">*</span>
                  </label>
                  <input
                    className={`reg-field-input ${errors.address ? "error" : ""}`}
                    placeholder="Số nhà, đường, phường/xã..."
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                  {errors.address && <span className="reg-error-msg">{errors.address}</span>}
                </div>

                <div className="reg-field-group">
                  <label className="reg-field-label">Ghi chú</label>
                  <textarea
                    className="reg-field-textarea"
                    rows={3}
                    placeholder="Thông tin thêm nếu cần (không bắt buộc)"
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                  />
                </div>
              </section>

              {errorMsg && <div className="reg-form-error">{errorMsg}</div>}

              <button type="submit" className="reg-submit-btn" disabled={loading || classTypesLoading || classTypes.length === 0}>
                {loading ? "Đang gửi..." : `Gửi đơn đăng ký${selectedClass ? " – " + selectedClass.label : ""}`}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
