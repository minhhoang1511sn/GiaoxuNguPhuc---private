'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './Home.css';
import { useContactInfo } from '@/app/lib/useContactInfo';
import { resolveImageUrl } from '@/app/lib/uploadImage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7272';

// Nhãn hiển thị cho chuyên mục bài viết — khớp với enum PostCategory ở backend.
const CATEGORY_LABEL = {
  TinTuc: 'Tin tức',
  ThongBao: 'Thông báo',
  GiaoLy: 'Giáo lý',
  SuyNiem: 'Suy niệm',
  HoatDongDoanThe: 'Đoàn thể',
  LichPhungVu: 'Lịch Phụng vụ',
  CaoPho: 'Cáo phó',
  HinhAnhVideo: 'Hình ảnh - Video',
  GioiTre: 'Giới trẻ',
  Khac: 'Khác',
};

// Gradient dự phòng cho ảnh đại diện bài viết khi bài viết chưa có ThumbnailUrl.
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

function fmtDateShort(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateBadge(d) {
  if (!d) return '';
  return new Date(d)
    .toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase();
}

async function safeGetPosts(query) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts${query}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function Home() {
  const slides = ['/images/slider1.JPG', '/images/slider2.JPG', '/images/slider3.JPG'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const { contact, loading: contactLoading } = useContactInfo();

  const [latestPosts, setLatestPosts] = useState([]);
  const [announcementPosts, setAnnouncementPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      setPostsLoading(true);
      setPostsError('');

      const [featuredData, announcementData, recentData] = await Promise.all([
        safeGetPosts('/featured?take=3'),
        safeGetPosts('?page=1&pageSize=3&category=ThongBao&sortBy=publishedAt&sortOrder=desc'),
        // Lấy 1 lô bài viết gần đây để tự lọc ra bài có EventDate trong tương lai
        // (BE chưa có tham số lọc/sắp xếp riêng theo EventDate).
        safeGetPosts('?page=1&pageSize=30&sortBy=publishedAt&sortOrder=desc'),
      ]);

      if (!alive) return;

      if (!featuredData && !announcementData && !recentData) {
        setPostsError('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.');
      }

      setLatestPosts(Array.isArray(featuredData) ? featuredData : featuredData?.items ?? []);
      setAnnouncementPosts(announcementData?.items ?? []);

      const now = Date.now();
      const events = (recentData?.items ?? [])
        .filter((p) => p.eventDate && new Date(p.eventDate).getTime() >= now)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 3);
      setUpcomingEvents(events);

      setPostsLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const massScheduleLines = (contact.massSchedule || '')
    .split('|')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <>
      <section className="hero-wrapper">
        {/* SLIDER */}
        {slides.map((src, i) => (
          <div
            key={i}
            className="hero-slide"
            style={{ backgroundImage: `url(${src})`, opacity: i === current ? 1 : 0 }}
          />
        ))}

        {/* OVERLAY */}
        <div className="hero-overlay" />

        {/* HERO CONTENT */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            CHÀO MỪNG ĐẾN VỚI GIÁO XỨ
          </div>

          <h1 className="hero-title">{contactLoading ? 'Giáo xứ Ngũ Phúc' : (contact.parishName || 'Giáo xứ Ngũ Phúc')}</h1>

          <p className="hero-subtitle">"Hiệp thông – Phục vụ – Loan báo Tin Mừng"</p>

          <div className="hero-actions">
            <Link href="/news" className="btn-primary">
              <i className="bi bi-newspaper" />
              Tin tức mới nhất
            </Link>
            <Link href="/calendar" className="btn-secondary">
              <i className="bi bi-clock" />
              Lịch lễ hôm nay
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions-overlay">
          <div className="quick-actions-wrapper">
            <div className="quick-grid">
              <Link href="/library" className="quick-action-item">
                <div className="quick-icon bg-blue">
                  <i className="bi bi-book-half"></i>
                </div>
                <span>Sách ngày</span>
              </Link>

              <Link href="/calendar" className="quick-action-item">
                <div className="quick-icon bg-green">
                  <i className="bi bi-calendar3"></i>
                </div>
                <span>Lịch lễ</span>
              </Link>

              <Link href="/register" className="quick-action-item">
                <div className="quick-icon bg-yellow">
                  <i className="bi bi-pen"></i>
                </div>
                <span>Đăng ký</span>
              </Link>

              {contact.youtube ? (
                <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="quick-action-item">
                  <div className="quick-icon bg-red">
                    <i className="bi bi-play-btn"></i>
                  </div>
                  <span>Trực tuyến</span>
                </a>
              ) : (
                <Link href="/contact" className="quick-action-item">
                  <div className="quick-icon bg-red">
                    <i className="bi bi-play-btn"></i>
                  </div>
                  <span>Trực tuyến</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LỊCH LỄ SECTION — lấy từ Thông tin liên hệ (Admin > Thông tin liên hệ) */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '150px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
              Lịch lễ
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Cùng dự lễ Thánh Thể</p>
              <Link href="/contact" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '500', fontSize: '16px' }}>
                Xem chi tiết →
              </Link>
            </div>
          </div>

          {contactLoading ? (
            <p style={{ color: '#666' }}>Đang tải giờ lễ…</p>
          ) : massScheduleLines.length > 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '35px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                border: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {massScheduleLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '18px',
                    borderRadius: '12px',
                    background: i % 2 === 0 ? '#eff6ff' : '#fffbeb',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: i % 2 === 0 ? '#dbeafe' : '#fed7aa',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                    }}
                  >
                    <svg style={{ width: '20px', height: '20px', color: i % 2 === 0 ? '#2563eb' : '#ea580c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{line}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '35px',
                textAlign: 'center',
                color: '#666',
                border: '1px solid #e5e7eb',
              }}
            >
              Giờ lễ đang được cập nhật. Vui lòng xem chi tiết tại trang Liên hệ.
            </div>
          )}
        </div>
      </section>

      {/* THÔNG BÁO GIÁO XỨ + SỰ KIỆN SẮP TỚI */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

            {/* Thông báo Giáo xứ */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#fef3c7', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>Thông báo Giáo xứ</h2>
              </div>

              <div style={{ backgroundColor: '#fffbeb', border: '3px solid #fbbf24', borderLeft: '6px solid #f59e0b', borderRadius: '12px', padding: '25px' }}>
                {postsLoading ? (
                  <p style={{ margin: 0, color: '#666' }}>Đang tải thông báo…</p>
                ) : announcementPosts.length === 0 ? (
                  <p style={{ margin: 0, color: '#666' }}>Hiện chưa có thông báo nào.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {announcementPosts.map((p) => (
                      <Link key={p.id} href={`/news/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{p.title}</h3>
                        </div>
                        <p style={{ fontSize: '15px', color: '#666', margin: 0, paddingLeft: '16px' }}>{p.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sự kiện sắp tới */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#dbeafe', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>Sự kiện sắp tới</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {postsLoading ? (
                  <p style={{ color: '#666' }}>Đang tải sự kiện…</p>
                ) : upcomingEvents.length === 0 ? (
                  <p style={{ color: '#666' }}>Hiện chưa có sự kiện sắp tới nào.</p>
                ) : (
                  upcomingEvents.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/news/${p.slug}`}
                      style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: i === 0 ? '#3b82f6' : '#9ca3af', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: i === 0 ? '#3b82f6' : '#9ca3af', fontWeight: '600', marginBottom: '6px' }}>
                            {fmtDateBadge(p.eventDate)}
                          </div>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px 0' }}>{p.title}</h3>
                          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{p.excerpt}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}

                <Link
                  href="/calendar"
                  style={{ display: 'block', textAlign: 'center', color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '15px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', marginTop: '5px' }}
                >
                  Xem lịch đầy đủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIN TỨC MỚI */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '50px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>Tin tức mới</h2>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Cập nhật từ cộng đoàn và các ban ngành</p>
            </div>
            <Link href="/news" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '500', fontSize: '16px' }}>
              Xem tất cả →
            </Link>
          </div>

          {postsError && (
            <p style={{ color: '#dc2626', marginBottom: '20px' }}>{postsError}</p>
          )}

          {postsLoading ? (
            <p style={{ color: '#666' }}>Đang tải tin tức…</p>
          ) : latestPosts.length === 0 ? (
            <p style={{ color: '#666' }}>Chưa có bài viết nào được đăng.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {latestPosts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/news/${p.slug}`}
                  style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', textDecoration: 'none', display: 'block', color: 'inherit' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '220px',
                      background: p.thumbnailUrl
                        ? `center / cover no-repeat url(${resolveImageUrl(p.thumbnailUrl)})`
                        : FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        backgroundColor: 'white',
                        color: '#1a1a1a',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '6px 14px',
                        borderRadius: '20px',
                      }}
                    >
                      {CATEGORY_LABEL[p.category] ?? p.category ?? 'Khác'}
                    </span>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#666' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{fmtDateShort(p.publishedAt || p.createdAt)}</span>
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px', lineHeight: '1.4' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
                      {p.excerpt}
                    </p>
                    <span style={{ color: '#0066cc', fontWeight: '600', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Đọc thêm →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
