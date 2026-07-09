"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./News.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";
import { usePageBanner } from "@/app/lib/usePageBanner";
import { publicFor } from "@/app/lib/apiClient";

/* ════════════════════════════════
   Config
════════════════════════════════ */
const PAGE_SIZE = 6;

// Map enum Category (string trả về từ backend) -> nhãn + màu badge hiển thị
// Thứ tự & nhãn tham khảo cấu trúc chuyên mục phổ biến của các trang giáo xứ/giáo phận.
const CATEGORY_CONFIG = {
  TinTuc: { label: "Tin Tức", color: "blue" },
  ThongBao: { label: "Thông Báo", color: "orange" },
  GioiTre: { label: "Giới Trẻ", color: "orange" },
  GiaoLy: { label: "Giáo Lý", color: "purple" },
  SuyNiem: { label: "Suy Niệm", color: "green" },
  LichPhungVu: { label: "Lịch Phụng Vụ", color: "purple" },
  HoatDongDoanThe: { label: "Hoạt Động Đoàn Thể", color: "blue" },
  CaoPho: { label: "Cáo Phó", color: "orange" },
  HinhAnhVideo: { label: "Hình Ảnh - Video", color: "green" },
  Khac: { label: "Khác", color: "blue" },
};

const CATEGORY_LIST = Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
  key,
  label: cfg.label,
}));

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] ?? { label: category ?? "Khác", color: "blue" };
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
const apiFetch = publicFor("/api/posts");

const apiGetPosts = ({ page = 1, search = "", category = "" }) => {
  const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return apiFetch(`?${params.toString()}`);
};

const apiGetFeatured = (take = 3) => apiFetch(`/featured?take=${take}`);

/* ════════════════════════════════
   Component
════════════════════════════════ */
export default function NewsPage() {
  const { bannerUrl } = usePageBanner("news");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [featuredPosts, setFeaturedPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGetPosts({
        page: currentPage,
        search,
        category: activeCategory,
      });
      setPosts(result.items ?? []);
      setTotalPages(Math.max(1, result.totalPages ?? 1));
    } catch (err) {
      console.error(err);
      setError("Không thể tải tin tức. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, activeCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Tin nổi bật cho sidebar - chỉ tải 1 lần
  useEffect(() => {
    apiGetFeatured(3)
      .then((data) => setFeaturedPosts(data ?? []))
      .catch((err) => console.error("Không tải được tin nổi bật:", err));
  }, []);

  // Đếm số bài viết theo từng category (gọi nhẹ, page rất nhỏ chỉ để lấy totalCount)
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CATEGORY_LIST.map((cat) =>
        apiFetch(`?page=1&pageSize=1&category=${cat.key}`)
          .then((r) => [cat.key, r.totalCount ?? 0])
          .catch(() => [cat.key, 0])
      )
    ).then((entries) => {
      if (!cancelled) setCategoryCounts(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  }

  function handleCategoryClick(key) {
    setCurrentPage(1);
    setActiveCategory((prev) => (prev === key ? "" : key));
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    // TODO: nối API đăng ký nhận tin khi backend có endpoint tương ứng
    setEmail("");
  }

  return (
    <div className="news-page">
      {/* Hero */}
      <div
        className={`news-hero${bannerUrl ? " news-hero--image" : ""}`}
        style={bannerUrl ? {
          backgroundImage: `linear-gradient(rgba(17,24,39,0.55) 0%, rgba(17,24,39,0.75) 100%), url('${bannerUrl}')`,
        } : undefined}
      >
        <div className="news-heroInner">
          <h1 className="news-heroTitle">Tin Tức &amp; Sự Kiện</h1>
          <p className="news-heroSub">
            Cập nhật những thông tin mới nhất, các hoạt động mục vụ và đời sống đức tin từ cộng đoàn Giáo xứ Ngũ Phúc.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="news-main">
        <div className="news-grid">
          {/* Articles */}
          <div className="news-articlesList">
            {loading && (
              <p style={{ color: "#617589", padding: "24px 0" }}>Đang tải bài viết...</p>
            )}

            {!loading && error && (
              <p style={{ color: "#dc2626", padding: "24px 0" }}>{error}</p>
            )}

            {!loading && !error && posts.length === 0 && (
              <p style={{ color: "#617589", padding: "24px 0" }}>
                Chưa có bài viết nào{search ? ` khớp với "${search}"` : ""}.
              </p>
            )}

            {!loading &&
              !error &&
              posts.map((post) => {
                const catCfg = getCategoryConfig(post.category);
                return (
                  <article key={post.id} className="news-articleCard">
                    <Link
                      href={`/news/${post.slug}`}
                      className="news-articleImage"
                      style={{
                        display: "block",
                        backgroundImage: post.thumbnailUrl ? `url(${resolveImageUrl(post.thumbnailUrl)})` : undefined,
                        backgroundColor: post.thumbnailUrl ? undefined : "#e5e7eb",
                      }}
                    />
                    <div className="news-articleBody">
                      <div className="news-articleMeta">
                        <span className={`news-badge news-badge-${catCfg.color}`}>
                          {catCfg.label}
                        </span>
                        <span className="news-articleDate">
                          • {fmtDate(post.publishedAt ?? post.createdAt)}
                        </span>
                      </div>
                      <Link href={`/news/${post.slug}`} style={{ textDecoration: "none" }}>
                        <h3 className="news-articleTitle">{post.title}</h3>
                      </Link>
                      <p className="news-articleExcerpt">{post.excerpt}</p>
                      <Link href={`/news/${post.slug}`} className="news-readMore">
                        Đọc thêm
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="news-pagination">
                <button
                  className="news-pageBtn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`news-pageBtn ${currentPage === p ? "news-pageBtnActive" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="news-pageBtn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="news-sidebar">
            {/* Search */}
            <form className="news-sideWidget" onSubmit={handleSearchSubmit}>
              <h4 className="news-widgetTitle">Tìm kiếm</h4>
              <div className="news-searchBox">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="news-searchIcon">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm bài viết..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="news-searchInput"
                />
              </div>
            </form>

            {/* Categories */}
            <div className="news-sideWidget">
              <h4 className="news-widgetTitle news-widgetTitleBlue">Danh Mục</h4>
              <ul className="news-categoryList">
                {CATEGORY_LIST.map((cat, i) => (
                  <li key={cat.key}>
                    <a
                      href="#"
                      className="news-categoryItem"
                      style={activeCategory === cat.key ? { color: "#137fec" } : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategoryClick(cat.key);
                      }}
                    >
                      <span>{cat.label}</span>
                      <span className="news-categoryCount">
                        {categoryCounts[cat.key] ?? 0}
                      </span>
                    </a>
                    {i < CATEGORY_LIST.length - 1 && <div className="news-categoryDivider" />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured */}
            <div className="news-sideWidget">
              <h4 className="news-widgetTitle news-widgetTitleGold">Tin Nổi Bật</h4>
              <div className="news-featuredList">
                {featuredPosts.length === 0 && (
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
                    Chưa có tin nổi bật.
                  </p>
                )}
                {featuredPosts.map((item) => {
                  const catCfg = getCategoryConfig(item.category);
                  return (
                    <Link key={item.id} href={`/news/${item.slug}`} className="news-featuredItem">
                      <div
                        className="news-featuredThumb"
                        style={{
                          backgroundImage: item.thumbnailUrl ? `url(${resolveImageUrl(item.thumbnailUrl)})` : undefined,
                          backgroundColor: item.thumbnailUrl ? undefined : "#e5e7eb",
                        }}
                      />
                      <div>
                        <span className="news-featuredTag">{catCfg.label}</span>
                        <h5 className="news-featuredTitle">{item.title}</h5>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <form className="news-newsletter" onSubmit={handleNewsletterSubmit}>
              <div className="news-newsletterIcon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <h4 className="news-newsletterTitle">Đăng ký nhận tin</h4>
              <p className="news-newsletterSub">
                Nhận thông báo thánh lễ và tin tức mới nhất qua email.
              </p>
              <div className="news-newsletterForm">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="news-newsletterInput"
                  required
                />
                <button type="submit" className="news-newsletterBtn">
                  Đăng ký ngay
                </button>
              </div>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
