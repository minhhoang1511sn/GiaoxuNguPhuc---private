"use client";

import { useState } from "react";
import "./Ministry.css";

const ministries = [
  {
    id: 1,
    name: "Ca Đoàn Têrêsa",
    category: "liturgy",
    categoryLabel: "Phụng vụ",
    description: "Hát khen ngợi Chúa, phục vụ thánh nhạc trong các thánh lễ trọng thể và ngày Chúa Nhật.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2e4Ok7Qtlg0IU7DCwoyV4FdJKELiOgpUBeuyMovprZ1N0YvP70XGzkucmr5OMifVXLc-_5B6K7iPMMwYQVCzZWVFeO7xN3VyDkCoy5p15BePqlGDZvd_rf7mJQEomN1eEKmbQUgDtSMh3pjlxApxi-K8cySK0okCkJzBvCjj4NZZpf8UjmXZXyjHAXoa_AOw1v6IDP4ycdfqU_Z3Ni0HC5EQa5drGSWpYrjEMhVAYqKS6yc4Gy3a-7OUjUFHhEkxBxPkmOFQ0vEA",
    icon: "🎵",
  },
  {
    id: 2,
    name: "Giới Trẻ Đa Minh",
    category: "youth",
    categoryLabel: "Giới trẻ",
    description: "Xây dựng tình bạn và đức tin năng động cho người trẻ qua các buổi sinh hoạt và trại hè.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBc62ZNwlk5Iss6gKHYw-6p_2NK9mJLrQiiaptyWaPJ-J0pT3BywplpfZMLO20yS8fOIqe7PC6_HyUI9DXVVYrO8avSoJIVo5_2kwZWe-s3zD7_4H4hKAhU7s13VO15xOG3RovcJ3kuJZiDCghplboWj4xI5cWx1UGKUlYM803Acd-MFJwW_9lieScXxSDUycDRB7xM1qZ24EbMGb_i27HTyh0QvgbngO6AlrXGXEcdOwLw7Aevd73ywivibGAoGDm6dwhvVZDhlOw",
    icon: "👥",
  },
  {
    id: 3,
    name: "Ban Caritas",
    category: "charity",
    categoryLabel: "Xã hội & Bác ái",
    description: "Chia sẻ yêu thương, giúp đỡ người nghèo, bệnh nhân và những hoàn cảnh khó khăn trong giáo xứ.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBWLZKtE1wt216h7Rkk1os17IEI1ytCeJ-xrPwMezWNyEF6MizZlj_PjuuvwSwmoSUeuMW4aTsBQKqaiGOnNQ6pVsp0djWIwX22-jSGuN_Z8IdzwKpoXbgPAXwJThCNXqktEH2Lz8Twdim4gD3eqIllUnub4mNFGKW4-C4CxOsoe1hKVz8AC_Ei_wemyc8TWc_nzjBaPpC0__2DAk0DZq7PIK4jztqLiSkVIjq8FtnzerUbakJ3IebLvz1FI-McOC04iTCFQH3nK0",
    icon: "❤️",
  },
  {
    id: 4,
    name: "Giáo Lý Viên",
    category: "education",
    categoryLabel: "Giáo dục",
    description: "Ươm mầm và nuôi dưỡng đức tin cho thế hệ tương lai thông qua các lớp giáo lý Chúa Nhật.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrY33OBN0FdqEwOg9MIAixlk09PCWXPKXZBNc6wy1c89n5Wc986WHk_e0ZnLFXw-nB8OkBxIq9xuTp1lNVu7Zr2uSFaiMiiQIznccSmHbFvb4csP7JJHekUo_hlr1KIVco91WyDk6O8ujPjZIwONucjc5WqIFfyP0ImVVmSe_-Bo_jCQmrHcs5DnQk_9Oi_sXdbymd6aeOpNBVe3nERlRups59-mztzB6SSgdHiLJAdoAwTx9DpbFsturm6R0zKQODA9N3j_uXhrI",
    icon: "📖",
  },
  {
    id: 5,
    name: "Hội Các Bà Mẹ",
    category: "charity",
    categoryLabel: "Xã hội & Gia đình",
    description: "Cầu nguyện và hỗ trợ các gia đình trong giáo xứ, noi gương các thánh nữ.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3i6wA-lWFPEvKZEBWecNuKP44Jw-Xdhytzh5xo-VWr8b401wP1NQGUneUzwaMSVfjpmiIWWezR4FhrxvfGwXnSZkd2UiBfTaE0XEFSTTpUc-5EZzfdrkwaTW2Yd18Yhoaw8cUH1lsJLdLfp0sBNCcqCjbNUC0NdDeA4WNmnLV5pQGLkj38VFE7LAL6GjOVb3RSzqW9teZzcZnt_G1dKmPC7AN4yoY5QnF1v9_CXCnioklUamZSe7cKx0Qt23EmLJHRWyRf3SaW-k",
    icon: "🙏",
  },
  {
    id: 6,
    name: "Legio Mariae",
    category: "liturgy",
    categoryLabel: "Phụng vụ",
    description: "Đạo binh Đức Mẹ, hoạt động tông đồ giáo dân, thăm viếng và cầu nguyện cho người đau yếu.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPAbkGBiBuc6mQVQ5iqFV9HA0xbtCODwV3cn6zuiH_ajaDJ_xU5ehfLlxr6oqZcnlDZYY4kpz-J882VOCPVii_xyOf82zL1Onb2kbD2prrY-fnEowqi5aq8DPW2wWcr2qPwGvWWkK82SMC42TBjdSAA_yWUFtulBFnoYmy0AxU7MIhresrIWdD_Wmc9ojxP2FVfUVRhCoxFLBaIy8X2iFkQhTOvLh2llcqnkpYW6bTAjUx-Vco-B3VARdEeUN8w9xWYElLJ5T4Ank",
    icon: "⛪",
  },
  {
    id: 7,
    name: "Ban Lễ Sinh",
    category: "liturgy",
    categoryLabel: "Phụng vụ",
    description: "Phục vụ bàn thờ Chúa trong các thánh lễ, rèn luyện đức tính kỷ luật và đạo đức.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRqa4vxmT52fy4o-lvzRCDxPo_O6_OW26TDW15VAW10Fyjo6Mb-f9ik6KaOtfIXaiKqZJUqsmDFxyg4XZqWJTNf_QEukWxFQuogUIxA79dOOJiQe9ZopHOzx7rTrzYKiCOcPn1qUasTStscj2B5xkgzD0BUanJWMFWLYlHy0CoS-rLOOSZQRdzsB6uY9DKUUGnm1ru3_hPM4qg2yM5fI8CgDceMW-NxkoiKfIk25Sh8sdlYS_A7BWHOYCteg-8A2PZR00EnpuAq2c",
    icon: "✝️",
  },
  {
    id: 8,
    name: "Ban Khánh Tiết",
    category: "charity",
    categoryLabel: "Hậu cần",
    description: "Trang trí nhà thờ, cắm hoa và chuẩn bị không gian trang nghiêm cho các ngày lễ lớn.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3IfkniewXXwwMroGZ2MF9iyeousdrdwN8-RIEK8RqwJ-YZ2DyAyl4_HKAzUoHHduo9u5w65efHb0gcrMw4FArql_FIWWuG1G6MlShOFQyM5YPQ7n4bMSILn9Qmr45QbPrCL-Uth9QvtUorSIrwKZCwHjHpjN9BYhfowbgUMgJeKMI6E0Ic7qBa2sPEbFb8FRRvUQADVAhwa6bIk0s2NIrJFDoTwpvjMEX4FPK17i4zfs9yP83Gf6d44jm9w059J6Yttr3Hh8YtWg",
    icon: "🌸",
  },
];

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "liturgy", label: "Phụng vụ" },
  { id: "charity", label: "Xã hội & Bác ái" },
  { id: "education", label: "Giáo dục" },
  { id: "youth", label: "Giới trẻ" },
];

const categoryClass = {
  liturgy: "badge-blue",
  youth: "badge-yellow",
  charity: "badge-green",
  education: "badge-purple",
};

export default function MinistryPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? ministries
    : ministries.filter((m) => m.category === activeTab);

  return (
    <div className="ministry-page">

      {/* Hero */}
      <div className="ministry-hero">
        <div className="ministry-hero-content">
          <span className="ministry-hero-eyebrow">Cộng đoàn Đức tin</span>
          <h1 className="ministry-hero-title">Phục Vụ Trong Yêu Thương</h1>
          <p className="ministry-hero-sub">
            Cùng nhau xây dựng cộng đoàn đức tin vững mạnh qua các hoạt động tông đồ và bác ái. Mỗi người một nén bạc, cùng nhau làm sáng danh Chúa.
          </p>
          <div className="ministry-hero-btns">
            <button className="ministry-btn-primary">Tham gia ngay</button>
            <button className="ministry-btn-ghost">Tìm hiểu thêm</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ministry-tabs-wrap">
        <div className="ministry-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ministry-tab ${activeTab === tab.id ? "ministry-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="ministry-grid-wrap">
        <div className="ministry-grid">
          {filtered.map((m) => (
            <div key={m.id} className="ministry-card">
              <div className="ministry-card-img-wrap">
                <div
                  className="ministry-card-img"
                  style={{ backgroundImage: `url(${m.image})` }}
                />
                <div className="ministry-card-icon">{m.icon}</div>
              </div>
              <div className="ministry-card-body">
                <h3 className="ministry-card-name">{m.name}</h3>
                <span className={`ministry-badge ${categoryClass[m.category] || "badge-blue"}`}>
                  {m.categoryLabel}
                </span>
                <p className="ministry-card-desc">{m.description}</p>
                <a href="#" className="ministry-card-link">
                  Tìm hiểu thêm
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="ministry-cta-wrap">
        <div className="ministry-cta">
          <div className="ministry-cta-text">
            <h2 className="ministry-cta-title">Bạn muốn tham gia phục vụ?</h2>
            <p className="ministry-cta-sub">
              Mỗi đóng góp nhỏ đều mang lại ý nghĩa lớn cho cộng đoàn. Hãy đăng ký để trở thành tình nguyện viên và chia sẻ hồng ân Chúa ban.
            </p>
            <div className="ministry-cta-checks">
              {["Kết nối cộng đồng", "Phát triển bản thân", "Sống đức tin"].map((item) => (
                <div key={item} className="ministry-cta-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ministry-check-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <button className="ministry-cta-btn">Đăng ký tình nguyện</button>
        </div>
      </div>

    </div>
  );
}
