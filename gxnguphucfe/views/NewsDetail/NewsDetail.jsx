"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import "./NewsDetail.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";

/* ════════════════════════════════
   Config
════════════════════════════════ */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7272";

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

function fmtDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

/* ════════════════════════════════
   API helpers
════════════════════════════════ */
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/posts${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

const apiGetPostBySlug = (slug) => apiFetch(`/slug/${encodeURIComponent(slug)}`);
const apiGetFeatured = (take = 4) => apiFetch(`/featured?take=${take}`);
const apiAddComment = (postId, data) =>
  apiFetch(`/${postId}/comments`, { method: "POST", body: JSON.stringify(data) });

/* ════════════════════════════════
   Component
════════════════════════════════ */
export default function NewsDetail({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const [related, setRelated] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ authorName: "", authorEmail: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadedSlugRef = useRef(null);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await apiGetPostBySlug(slug);
      setPost(data);
      setComments(data.comments ?? []);
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true);
      } else {
        console.error(err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // Chặn StrictMode (dev) gọi effect 2 lần liên tiếp cho cùng 1 slug,
    // tránh API tăng view count 2 lần mỗi khi vào trang.
    if (loadedSlugRef.current === slug) return;
    loadedSlugRef.current = slug;
    loadPost();
  }, [slug, loadPost]);

  useEffect(() => {
    apiGetFeatured(4)
      .then((data) => setRelated((data ?? []).filter((p) => p.slug !== slug)))
      .catch((err) => console.error("Không tải được tin liên quan:", err));
  }, [slug]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!post) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    if (commentForm.authorName.trim().length < 2) {
      setSubmitError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    if (commentForm.content.trim().length < 1) {
      setSubmitError("Vui lòng nhập nội dung bình luận.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiAddComment(post.id, {
        authorName: commentForm.authorName.trim(),
        authorEmail: commentForm.authorEmail.trim() || null,
        content: commentForm.content.trim(),
      });
      setComments((prev) => [...prev, created]);
      setCommentForm({ authorName: "", authorEmail: "", content: "" });
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      setSubmitError("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <main className="detail-main">
          <p className="detail-stateMsg">Đang tải bài viết...</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="detail-page">
        <main className="detail-main">
          <p className="detail-stateMsg">
            Không tìm thấy bài viết này. Có thể bài viết đã bị xoá hoặc đường dẫn không đúng.
          </p>
          <div style={{ textAlign: "center" }}>
            <Link href="/news" className="detail-backLink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
              </svg>
              Quay lại trang Tin tức
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="detail-page">
        <main className="detail-main">
          <p className="detail-stateMsg error">{error ?? "Đã có lỗi xảy ra."}</p>
        </main>
      </div>
    );
  }

  const catCfg = getCategoryConfig(post.category);
  const tags = (post.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="detail-page">
      <main className="detail-main">
        <div className="detail-breadcrumb">
          <Link href="/news">Tin Tức</Link>
          <span>/</span>
          <span>{catCfg.label}</span>
        </div>

        <Link href="/news" className="detail-backLink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
          </svg>
          Quay lại trang Tin tức
        </Link>

        <div className="detail-grid">
          {/* Article */}
          <div>
            <article className="detail-article">
              {(post.coverImageUrl || post.thumbnailUrl) && (
                <div
                  className="detail-cover"
                  style={{ backgroundImage: `url(${resolveImageUrl(post.coverImageUrl || post.thumbnailUrl)})` }}
                />
              )}

              <div className="detail-body">
                <div className="detail-meta">
                  <span className={`detail-badge detail-badge-${catCfg.color}`}>
                    {catCfg.label}
                  </span>
                  <span className="detail-date">
                    {fmtDate(post.publishedAt ?? post.createdAt)}
                  </span>
                </div>

                <h1 className="detail-title">{post.title}</h1>

                <div className="detail-authorRow">
                  <div
                    className="detail-authorAvatar"
                    style={
                      post.authorAvatar
                        ? { backgroundImage: `url(${post.authorAvatar})` }
                        : undefined
                    }
                  >
                    {!post.authorAvatar && initials(post.authorName)}
                  </div>
                  <span className="detail-authorName">{post.authorName}</span>
                  <span className="detail-viewCount">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {post.viewCount} lượt xem
                  </span>
                </div>

                {/* Nội dung bài viết - lưu dạng plain text, giữ xuống dòng bằng CSS */}
                <div className="detail-content">{post.content}</div>

                {tags.length > 0 && (
                  <div className="detail-tags">
                    {tags.map((tag) => (
                      <span key={tag} className="detail-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>

            {/* Comments */}
            <section className="detail-commentsSection">
              <h3 className="detail-commentsTitle">
                Bình luận {comments.length > 0 && `(${comments.length})`}
              </h3>

              {post.allowComments ? (
                <>
                  <form className="detail-commentForm" onSubmit={handleCommentSubmit}>
                    <div className="detail-commentFormRow">
                      <input
                        type="text"
                        placeholder="Họ tên *"
                        className="detail-input"
                        value={commentForm.authorName}
                        onChange={(e) =>
                          setCommentForm((f) => ({ ...f, authorName: e.target.value }))
                        }
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (không bắt buộc)"
                        className="detail-input"
                        value={commentForm.authorEmail}
                        onChange={(e) =>
                          setCommentForm((f) => ({ ...f, authorEmail: e.target.value }))
                        }
                      />
                    </div>
                    <textarea
                      placeholder="Viết bình luận của bạn..."
                      className="detail-textarea"
                      value={commentForm.content}
                      onChange={(e) =>
                        setCommentForm((f) => ({ ...f, content: e.target.value }))
                      }
                      required
                    />
                    {submitError && (
                      <p style={{ color: "#dc2626", fontSize: "0.85rem", margin: 0 }}>
                        {submitError}
                      </p>
                    )}
                    {submitSuccess && (
                      <p style={{ color: "#16a34a", fontSize: "0.85rem", margin: 0 }}>
                        Gửi bình luận thành công, cảm ơn bạn!
                      </p>
                    )}
                    <div className="detail-commentSubmitRow">
                      <button type="submit" className="detail-submitBtn" disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi bình luận"}
                      </button>
                    </div>
                  </form>

                  <div className="detail-commentList">
                    {comments.length === 0 && (
                      <p className="detail-commentsEmpty">
                        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
                      </p>
                    )}
                    {comments.map((c) => (
                      <div key={c.id} className="detail-commentItem">
                        <div className="detail-commentAvatar">{initials(c.authorName)}</div>
                        <div className="detail-commentBody">
                          <div className="detail-commentHeader">
                            <span className="detail-commentAuthor">{c.authorName}</span>
                            <span className="detail-commentDate">{fmtDateTime(c.createdAt)}</span>
                          </div>
                          <p className="detail-commentContent">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="detail-commentsDisabled">
                  Bài viết này đã đóng bình luận.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="detail-sideWidget">
              <h4 className="detail-widgetTitle">Tin Liên Quan</h4>
              <div className="detail-relatedList">
                {related.length === 0 && (
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
                    Chưa có tin liên quan.
                  </p>
                )}
                {related.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="detail-relatedItem">
                    <div
                      className="detail-relatedThumb"
                      style={
                        item.thumbnailUrl
                          ? { backgroundImage: `url(${resolveImageUrl(item.thumbnailUrl)})` }
                          : undefined
                      }
                    />
                    <h5 className="detail-relatedTitle">{item.title}</h5>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
