"use client";

import { useState } from "react";
import "./News.css";

const articles = [
  {
    id: 1,
    category: "Phụng Vụ",
    categoryColor: "blue",
    date: "20 Tháng 3, 2024",
    title: "Lịch Phụng Vụ Tuần Thánh 2024",
    excerpt:
      "Chi tiết về các thánh lễ và nghi thức trong Tuần Thánh sắp tới tại giáo xứ. Kính mời cộng đoàn theo dõi để hiệp thông sốt sắng trong những ngày trọng đại này.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr2fJVypvXflcX62Say_pylRHl8hwk3pyF3uOcS1UW_au5ATu1keOpNbtb2deUp4sr9Fu6TfKC5K7W2YFYjeuOs_p1JJkU-VgiePExNhYZ5GERFqV3y7rI_MS2SJnfxvHTdpXL2aVi-kUMjl4ES3jrhFKhHH7QGwpLd-s-cExQcpKdOiUJt_1dG6l7WCp8HtpA9FKlsFyQaQYpSRgYNCtWe1vLHHKbegI3UrMEBFALJrjQOsOU7zBjl63qUzBFsPtAdVLmFtMYpmI",
  },
  {
    id: 2,
    category: "Bác Ái",
    categoryColor: "green",
    date: "15 Tháng 5, 2024",
    title: "Tổng kết hoạt động từ thiện tháng 5",
    excerpt:
      "Cập nhật kết quả quyên góp và hình ảnh chuyến đi thăm trại trẻ mồ côi Mái Ấm Tình Thương. Xin chân thành cảm ơn sự quảng đại của quý ân nhân.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRlpQqvHyk0NPkKY1xwUb9v3JBvoOyYulQME72QDaD5bfvFLRQ8WgZsXK-xBLeHcL9dnzce1KYB-QcAetwOmy2Blh5WFzdWzRfEaBXvqEj5d7Ns7xA2FBK3SjnT1M1tCn6GAsfRchizT7ZQ88nWDZZOWZJ90B5v4QVUbJk3Qn4SQPlQk6GLFPms3gnsQhDzm-WsarMmAELFT5MG6KmyAuAXLeZYE985bKqAqhKG5CoO9O6DYrW9QXsGmfCy5usXcQD7GfJ8CL6xKM",
  },
  {
    id: 3,
    category: "Giáo Lý",
    categoryColor: "purple",
    date: "01 Tháng 6, 2024",
    title: "Thông báo lớp Giáo lý Hôn nhân Khóa II/2024",
    excerpt:
      "Giáo xứ thông báo khai giảng lớp Giáo lý Hôn nhân Khóa II dành cho các bạn trẻ chuẩn bị bước vào đời sống hôn nhân. Đăng ký tại văn phòng giáo xứ.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDk-aPMo9taRPpe4B5Dq3XFkbAlPR7YxHCREY2gmTWDK3_hurGRSv8fbHa3g2AawK5RhRMxb3Du02Z23SRigJ9HHaV9qsAyBCS-DiXPsQgckoILACKgalq2B0RGE-PY7UlAcShiA4axynoMQm-aOnV4dABqVWxhxLn9Rls4uttBp1xcb8OaP1-dn3ui1hnRAET7RVyBo1sH6daqw5UbmrmPeRu9K8Xc0DFXV_wYHSA7itNk1stK9jjGlDIO1pf8bVXWlCFbIJrSszs",
  },
  {
    id: 4,
    category: "Giới Trẻ",
    categoryColor: "orange",
    date: "28 Tháng 5, 2024",
    title: "Đại hội Giới trẻ Giáo hạt: Hành trang Đức Tin",
    excerpt:
      "Mời gọi các bạn trẻ tham gia ngày hội lớn của giáo hạt với chủ đề \"Hành trang Đức Tin\" vào Chúa Nhật tới. Nhiều hoạt động giao lưu và chia sẻ ý nghĩa.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIa2WCQC95Tae8_A0kEy2pJCAFSZF4GCdslMajUJ2h_g61hqAjEKSkEvqyq1AfcRVQlc6DhcDMYcBUrCDOCw5vAmr5mhPmz6xiHu7avPv97-y3y0fs1fKVbiiy1dTkTnk2QXJV1nZRZfXf6MZ6IDg3v-tXeaj-HYGaZatr4dwC7tkb3JKq64jVf8Ici2WV4mXxuuKvVq0Ozt0v0r7ot450lQkqLUv4EQjGeWuAJvDR5PSALubrHYDCdMcw9gEMI6vyndDCDN7JCos",
  },
];

const featuredNews = [
  {
    id: 1,
    tag: "Mùa Chay",
    title: "Thư Mục Vụ Mùa Chay 2024 của Đức Giám Mục",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkOoovdaYiSyl6RsS-0rOqLxUsmynDKTqU90l2tNKZqqkQxwknG4AR9yJN5bsdaLoNRPiWevdarogvoOL-3z5_-5ESUAXBPRrqyLPbWfmhkGvEEjiL2fhU42KmGX9rdhgvbFGv9sRsZ8C9nPBIDcBCtu-TEl7S0MC9q-WY5QDhijMhXpA5qt-MJy1HasrZD66EfcMMpRlwL0i26sYrZXMUUbpXMwX4NA-mgNnQvuUBWltWZwRg2tMtyM6xmXaxg1HnuWxUvudAERE",
  },
  {
    id: 2,
    tag: "Đức Tin",
    title: "Chuỗi Mân Côi - Sức mạnh thiêng liêng",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA12W_HAqkc5tgsEYkDkzgGosWzS0-CJNKGr1qocyqnQ8UNfQRUJkvCqVkjRvFhKzECK-mF8ZGsTPZtgtr9ur8NbSLiOMEYTtyEJJQSOg8PQK7-d4BYzBoOnfQfh7xUOseuJXjF1HBj5TnoiB-TGunMlmImNVlrf5MDAP9NAIZdkSVunMZvtdrQE1UWbUqqQVQTjw12RN5uTjdz0uk6RYEoj9If9qdW6Vrk8zXHLyNGaVgWa9QvTilU1THxmLI4hDHKxxCAPiZ6r_A",
  },
  {
    id: 3,
    tag: "Xây Dựng",
    title: "Tiến độ trùng tu tháp chuông nhà thờ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbl5JDH2b68HOCavURpT-vXB1Be_1_6jda-SP8sEd88GL_SJq2ZBN6riqNraLjojc0XPMPEl3L7Pt5GjwSznmI3hlxBQe4uoiK5JG1IOufQWhl-hpmCQjbZGw14L2Gp7KfO_PrmY2PiOJ_ohdVOJBmze-LlTofTgi4VXCyAi3I1L8Yd7VkFf7qpxrQGVYTRC_9qGKHwwQLSN0W2JS6juszSTvG9BAtlEutnmsnQNTNZ5fHjECHMebPHkVNK0a1eNQLqfgdmP8_TU0",
  },
];

export default function NewsPage() {
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="news-page">
      {/* Hero */}
      <div className="news-hero">
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
            {articles.map((article) => (
              <article key={article.id} className="news-articleCard">
                <div
                  className="news-articleImage"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
                <div className="news-articleBody">
                  <div className="news-articleMeta">
                    <span className={`news-badge news-badge-${article.categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="news-articleDate">• {article.date}</span>
                  </div>
                  <h3 className="news-articleTitle">{article.title}</h3>
                  <p className="news-articleExcerpt">{article.excerpt}</p>
                  <a href="#" className="news-readMore">
                    Đọc thêm
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}

            {/* Pagination */}
            <div className="news-pagination">
              <button
                className="news-pageBtn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`news-pageBtn ${currentPage === p ? "news-pageBtnActive" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <span className="news-pageDots">...</span>
              <button
                className="news-pageBtn"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="news-sidebar">
            {/* Search */}
            <div className="news-sideWidget">
              <h4 className="news-widgetTitle">Tìm kiếm</h4>
              <div className="news-searchBox">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="news-searchIcon">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm bài viết..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="news-searchInput"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="news-sideWidget">
              <h4 className="news-widgetTitle news-widgetTitleBlue">Danh Mục</h4>
              <ul className="news-categoryList">
                {[
                  { label: "Thông Báo", count: 12 },
                  { label: "Phụng Vụ & Suy Niệm", count: 8 },
                  { label: "Giới Trẻ", count: 5 },
                  { label: "Caritas (Bác Ái)", count: 3 },
                ].map((cat, i) => (
                  <li key={i}>
                    <a href="#" className="news-categoryItem">
                      <span>{cat.label}</span>
                      <span className="news-categoryCount">{cat.count}</span>
                    </a>
                    {i < 3 && <div className="news-categoryDivider" />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Featured */}
            <div className="news-sideWidget">
              <h4 className="news-widgetTitle news-widgetTitleGold">Tin Nổi Bật</h4>
              <div className="news-featuredList">
                {featuredNews.map((item) => (
                  <a key={item.id} href="#" className="news-featuredItem">
                    <div
                      className="news-featuredThumb"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div>
                      <span className="news-featuredTag">{item.tag}</span>
                      <h5 className="news-featuredTitle">{item.title}</h5>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="news-newsletter">
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
                />
                <button className="news-newsletterBtn">Đăng ký ngay</button>
              </div>
            </div>
          </aside>
        </div>
      </main>


    </div>
  );
}
