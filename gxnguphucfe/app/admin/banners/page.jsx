"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./AdminBanner.module.css";
import { uploadImage, resolveImageUrl } from "@/app/lib/uploadImage";
import { apiGetPageSetting, apiUpdatePageBanner, BANNER_PAGE_KEYS } from "@/app/lib/usePageBanner";
import { apiGetHomeSlides, apiAddHomeSlide, apiDeleteHomeSlide, apiReorderHomeSlides } from "@/app/lib/useHomeSlides";

const PAGES = [
  { id: "about", name: "Trang Về Giáo Xứ" },
  { id: "ministries", name: "Trang Các Giới & Hội Đoàn" },
  { id: "news", name: "Trang Tin Tức" },
  { id: "register", name: "Trang Đăng Ký Giáo Lý" },
  { id: "contact", name: "Trang Liên Hệ" },
  { id: "calendar", name: "Trang Lịch Phụng Vụ" },
];

// Đảm bảo danh sách trang ở đây luôn khớp với AllowedPageKeys phía BE.
if (process.env.NODE_ENV !== "production") {
  const mismatch = PAGES.some((p) => !BANNER_PAGE_KEYS.includes(p.id));
  if (mismatch) {
    // eslint-disable-next-line no-console
    console.warn("[admin/banners] PAGES không khớp với BANNER_PAGE_KEYS ở usePageBanner.js");
  }
}

export default function AdminBanners() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].id);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // ── Slideshow trang chủ ──
  const [slides, setSlides] = useState([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [slidesError, setSlidesError] = useState("");
  const [slideUploading, setSlideUploading] = useState(false);
  const [slideBusyId, setSlideBusyId] = useState(null); // id đang xoá/di chuyển
  const slideFileInputRef = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Load ảnh hiện tại của trang đang được chọn
  const loadCurrent = useCallback(async (pageKey) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetPageSetting(pageKey);
      setCurrentImage(data?.bannerImageUrl ? resolveImageUrl(data.bannerImageUrl) : "");
    } catch (err) {
      setCurrentImage("");
      setError(err.message || "Không tải được ảnh bìa hiện tại của trang.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrent(selectedPage);
  }, [selectedPage, loadCurrent]);

  // Load danh sách ảnh slideshow trang chủ
  const loadSlides = useCallback(async () => {
    setSlidesLoading(true);
    setSlidesError("");
    try {
      const data = await apiGetHomeSlides();
      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      setSlides([]);
      setSlidesError(err.message || "Không tải được danh sách ảnh slideshow.");
    } finally {
      setSlidesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  // Xử lý Upload ảnh: upload file lấy URL, rồi lưu URL đó vào cấu hình của trang
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, "banners");
      const updated = await apiUpdatePageBanner(selectedPage, url);
      setCurrentImage(updated?.bannerImageUrl ? resolveImageUrl(updated.bannerImageUrl) : "");
      showToast("success", "Cập nhật ảnh bìa thành công!");
    } catch (err) {
      showToast("error", "Lỗi: " + (err.message || "Không thể cập nhật ảnh bìa."));
    } finally {
      setUploading(false);
      // Cho phép chọn lại đúng file cũ nếu người dùng muốn thử lại
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Gỡ ảnh bìa hiện tại, quay về ảnh mặc định phía FE
  const handleRemove = async () => {
    if (!currentImage) return;
    setRemoving(true);
    try {
      await apiUpdatePageBanner(selectedPage, null);
      setCurrentImage("");
      showToast("success", "Đã gỡ ảnh bìa, trang sẽ dùng ảnh mặc định.");
    } catch (err) {
      showToast("error", "Lỗi: " + (err.message || "Không thể gỡ ảnh bìa."));
    } finally {
      setRemoving(false);
    }
  };

  const busy = uploading || removing;

  // Thêm ảnh mới vào slideshow trang chủ: upload file lấy URL rồi lưu vào danh sách slide
  const handleSlideUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSlideUploading(true);
    try {
      const url = await uploadImage(file, "banners");
      await apiAddHomeSlide(url);
      await loadSlides();
      showToast("success", "Đã thêm ảnh vào slideshow trang chủ!");
    } catch (err) {
      showToast("error", "Lỗi: " + (err.message || "Không thể thêm ảnh slideshow."));
    } finally {
      setSlideUploading(false);
      if (slideFileInputRef.current) slideFileInputRef.current.value = "";
    }
  };

  // Xoá một ảnh khỏi slideshow trang chủ
  const handleSlideDelete = async (id) => {
    setSlideBusyId(id);
    try {
      await apiDeleteHomeSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      showToast("success", "Đã xoá ảnh khỏi slideshow.");
    } catch (err) {
      showToast("error", "Lỗi: " + (err.message || "Không thể xoá ảnh slideshow."));
    } finally {
      setSlideBusyId(null);
    }
  };

  // Đổi chỗ 1 ảnh với ảnh liền trước/sau rồi lưu lại thứ tự mới lên server
  const handleSlideMove = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setSlides(reordered);
    setSlideBusyId(reordered[newIndex].id);

    try {
      await apiReorderHomeSlides(reordered.map((s) => s.id));
    } catch (err) {
      showToast("error", "Lỗi: " + (err.message || "Không thể sắp xếp lại slideshow."));
      await loadSlides(); // khôi phục lại đúng thứ tự trên server nếu lưu thất bại
    } finally {
      setSlideBusyId(null);
    }
  };

  return (
    <div className={styles.postsPage}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <h2 className={styles.heading}>Quản lý Ảnh nền (Banner) các trang</h2>
      <p className={styles.sub}>
        Ảnh bìa hiển thị ở đầu mỗi trang công khai tương ứng. Nếu chưa cấu hình, trang sẽ tự dùng ảnh mặc định.
      </p>

      <div className={styles.formGroup}>
        <label className={styles.fieldLabel}>Chọn trang cần đổi ảnh:</label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className={styles.select}
          disabled={busy}
        >
          {PAGES.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.previewBox}>
        <h4 className={styles.cardTitle}>Ảnh nền hiện tại:</h4>
        {loading ? (
          <p className={styles.hint}>Đang tải…</p>
        ) : error ? (
          <p className={styles.errorText}>{error}</p>
        ) : currentImage ? (
          <img src={currentImage} alt="Current Banner" className={styles.previewImage} />
        ) : (
          <p className={styles.hint}>Trang này chưa có ảnh nền (Sử dụng ảnh mặc định).</p>
        )}
      </div>

      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          id="banner-upload"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          disabled={busy}
        />
        <label htmlFor="banner-upload" className={`${styles.uploadBtn} ${busy ? styles.disabled : ""}`}>
          {uploading ? "Đang tải lên..." : "Tải lên ảnh mới"}
        </label>

        {currentImage && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            disabled={busy}
          >
            {removing ? "Đang gỡ..." : "Gỡ ảnh, dùng mặc định"}
          </button>
        )}
      </div>

      <hr className={styles.divider} />

      <h2 className={styles.heading}>Slideshow trang chủ</h2>
      <p className={styles.sub}>
        Các ảnh trượt tự động hiển thị ở đầu Trang chủ. Thêm nhiều ảnh và sắp xếp thứ tự hiển thị bên dưới.
      </p>

      <div className={styles.slideList}>
        {slidesLoading ? (
          <p className={styles.hint}>Đang tải…</p>
        ) : slidesError ? (
          <p className={styles.errorText}>{slidesError}</p>
        ) : slides.length === 0 ? (
          <p className={styles.hint}>Chưa có ảnh nào trong slideshow (trang chủ sẽ dùng ảnh mặc định).</p>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className={styles.slideItem}>
              <img src={resolveImageUrl(slide.imageUrl)} alt={`Slide ${index + 1}`} className={styles.slideThumb} />
              <span className={styles.slideOrder}>#{index + 1}</span>
              <div className={styles.slideActions}>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => handleSlideMove(index, -1)}
                  disabled={index === 0 || slideBusyId !== null}
                  title="Di chuyển lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => handleSlideMove(index, 1)}
                  disabled={index === slides.length - 1 || slideBusyId !== null}
                  title="Di chuyển xuống"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleSlideDelete(slide.id)}
                  disabled={slideBusyId !== null}
                >
                  {slideBusyId === slide.id ? "Đang xoá..." : "Xoá"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.uploadSection}>
        <input
          ref={slideFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          id="slide-upload"
          onChange={handleSlideUpload}
          style={{ display: "none" }}
          disabled={slideUploading}
        />
        <label htmlFor="slide-upload" className={`${styles.uploadBtn} ${slideUploading ? styles.disabled : ""}`}>
          {slideUploading ? "Đang tải lên..." : "Thêm ảnh vào slideshow"}
        </label>
      </div>
    </div>
  );
}
