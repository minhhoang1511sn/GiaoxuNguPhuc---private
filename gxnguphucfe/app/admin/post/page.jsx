'use client';

import { useState } from 'react';
import './post.css';


const CATS = ['Tất cả', 'Lễ Phụng Vụ', 'Giáo Lý', 'Thông Báo', 'Tin Tức', 'Bài Giảng', 'Kinh Nguyện', 'Giới Trẻ'];

const STATUS_CONFIG = {
  published: { label: 'Đã đăng',  color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', dot: '#10b981' },
  draft:     { label: 'Bản nháp', color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', dot: '#64748b' },
  review:    { label: 'Chờ duyệt',color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  dot: '#f59e0b' },
};

const STATUSES = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'published', label: 'Đã đăng' },
  { key: 'draft',     label: 'Bản nháp' },
  { key: 'review',    label: 'Chờ duyệt' },
];

const PAGE_SIZE = 6;

function formatDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function PostsPage() {
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [activeSt, setActiveSt]   = useState('all');
  const [selected, setSelected]   = useState([]);
  const [page, setPage]           = useState(1);
  const [posts, setPosts]           = useState([]);

  const filtered = posts.filter(p => {
    const mq = p.title.toLowerCase().includes(search.toLowerCase()) ||
               p.author.toLowerCase().includes(search.toLowerCase());
    const mc = activeCat === 'Tất cả' || p.category === activeCat;
    const ms = activeSt === 'all' || p.status === activeSt;
    return mq && mc && ms;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSel = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () => {
    const ids = paginated.map(p => p.id);
    const allChecked = ids.every(id => selected.includes(id));
    setSelected(allChecked
      ? selected.filter(id => !ids.includes(id))
      : [...new Set([...selected, ...ids])]
    );
  };

  const setCat = (c) => { setActiveCat(c); setPage(1); };
  const setSt  = (s) => { setActiveSt(s);  setPage(1); };

  const from = Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length);
  const to   = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <div className="posts-page">

      {/* ── Header ── */}
      <div className="posts-topbar">
        <div>
          <h1 className="posts-heading">Quản lý bài viết</h1>
          <p className="posts-sub">
            {POSTS.length} bài viết · {POSTS.filter(p => p.status === 'published').length} đã đăng
          </p>
        </div>
        <button className="posts-add-btn" onClick={() => alert('Tạo bài viết mới')}>
          + Thêm bài viết
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="posts-toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            placeholder="Tìm bài viết, tác giả…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="toolbar-divider" />

        <div className="chips">
          {CATS.map(c => (
            <button
              key={c}
              className={`chip${activeCat === c ? ' active-all' : ''}`}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>

        <div className="toolbar-divider" />

        <div className="chips">
          {STATUSES.map(s => (
            <button
              key={s.key}
              className={`chip${activeSt === s.key ? ` active-${s.key}` : ''}`}
              onClick={() => setSt(s.key)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── Bulk bar ── */}
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span className="bulk-info">Đã chọn {selected.length} bài viết</span>
          <div className="chips">
            <button className="bulk-btn" onClick={() => alert('Xuất bản')}>Xuất bản</button>
            <button className="bulk-btn" onClick={() => alert('Bản nháp')}>Bản nháp</button>
            <button className="bulk-btn danger" onClick={() => setSelected([])}>Xoá</button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-card">

        {/* Head */}
        <div className="table-head">
          <input
            type="checkbox"
            className="row-cb"
            checked={paginated.length > 0 && paginated.every(p => selected.includes(p.id))}
            onChange={toggleAll}
          />
          {['Bài viết', 'Danh mục', 'Ngày đăng', 'Lượt xem', 'Bình luận', 'Trạng thái', 'Thao tác'].map(h => (
            <div key={h} className="th">{h}</div>
          ))}
        </div>

        {/* Body */}
        {paginated.length === 0 ? (
          <div className="table-empty">Không tìm thấy bài viết phù hợp.</div>
        ) : paginated.map((post, i) => {
          const sc = STATUS_CONFIG[post.status];
          return (
            <div key={post.id} className="table-row" style={{ animationDelay: `${i * 30}ms` }}>
              <input
                type="checkbox"
                className="row-cb"
                checked={selected.includes(post.id)}
                onChange={() => toggleSel(post.id)}
                onClick={e => e.stopPropagation()}
              />
              <div className="post-info">
                <div className="post-thumb">{post.t}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="post-title" title={post.title}>{post.title}</div>
                  <div className="post-author">{post.author}</div>
                </div>
              </div>
              <div>
                <span className="cat-pill">{post.category}</span>
              </div>
              <div className="date-cell">{formatDate(post.date)}</div>
              <div className="stat-cell">{post.views.toLocaleString('vi-VN')}</div>
              <div className="stat-cell">{post.comments}</div>
              <div>
                <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
                  <span className="status-dot" style={{ background: sc.dot }} />
                  {sc.label}
                </span>
              </div>
              <div className="row-actions">
                <button className="action-btn" onClick={e => { e.stopPropagation(); alert(`Sửa: ${post.title}`); }}>Sửa</button>
                <button className="action-btn del" onClick={e => { e.stopPropagation(); alert(`Xoá: ${post.title}`); }}>Xoá</button>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="table-foot">
          <span className="foot-info">
            {filtered.length === 0 ? 'Không có bài viết' : `Hiển thị ${from}–${to} / ${filtered.length} bài`}
          </span>
          <div className="pager">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`page-btn${n === currentPage ? ' active' : ''}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}