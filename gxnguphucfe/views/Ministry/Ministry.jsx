"use client";

import { useState, useEffect } from "react";
import "./Ministry.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";
import { usePageBanner } from "@/app/lib/usePageBanner";
import { publicFor } from "@/app/lib/apiClient";
import Link from "next/link";
import RegistrationModal from "./RegistrationModal";

const apiMinistries = publicFor("/api/ministries");
const apiClergy = publicFor("/api/clergy-members");

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

const DEFAULT_CATEGORY_LABELS = {
  liturgy: "Phụng vụ",
  youth: "Giới trẻ",
  charity: "Xã hội & Bác ái",
  education: "Giáo dục",
};

// So khớp không phân biệt hoa/thường, bỏ dấu để linh hoạt hơn khi tên nhập ở
// trang quản trị không khớp 100% với tên hiển thị tĩnh phía trên.
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function MinistryPage() {
  const { bannerUrl } = usePageBanner("ministries");
  const [activeTab, setActiveTab] = useState("all");
  const [leaders, setLeaders] = useState([]);

  const [ministries, setMinistries] = useState([]);
  const [ministriesLoading, setMinistriesLoading] = useState(true);
  const [ministriesError, setMinistriesError] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  useEffect(() => {
    let cancelled = false;

    async function fetchMinistries() {
      setMinistriesLoading(true);
      try {
        const data = await apiMinistries();
        if (!cancelled) {
          setMinistries(
            (data ?? []).map((m) => ({
              id: m.id,
              name: m.name,
              category: (m.categoryName || "").toLowerCase(),
              categoryLabel: m.categoryLabel || DEFAULT_CATEGORY_LABELS[(m.categoryName || "").toLowerCase()] || m.categoryName,
              description: m.description,
              image: resolveImageUrl(m.imageUrl),
              icon: m.icon || "👥",
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setMinistriesError("Không tải được danh sách đoàn thể.");
      } finally {
        if (!cancelled) setMinistriesLoading(false);
      }
    }

    fetchMinistries();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaders() {
      try {
        const data = await apiClergy();
        if (!cancelled) setLeaders((data ?? []).filter((p) => p.ministryName));
      } catch {
        // Không hiển thị lỗi ở trang công khai — chỉ đơn giản không có thông tin trưởng ban
      }
    }

    fetchLeaders();
    return () => { cancelled = true; };
  }, []);

  const findLeader = (ministryName) =>
    leaders.find((p) => normalize(p.ministryName) === normalize(ministryName));

  const filtered = activeTab === "all"
    ? ministries
    : ministries.filter((m) => m.category === activeTab);

  return (
    <div className="ministry-page">

      {/* Hero */}
      <div
        className="ministry-hero"
        style={bannerUrl ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url('${bannerUrl}')`,
        } : undefined}
      >
        <div className="ministry-hero-content">
          <span className="ministry-hero-eyebrow">Cộng đoàn Đức tin</span>
          <h1 className="ministry-hero-title">Phục Vụ Trong Yêu Thương</h1>
          <p className="ministry-hero-sub">
            Cùng nhau xây dựng cộng đoàn đức tin vững mạnh qua các hoạt động tông đồ và bác ái. Mỗi người một nén bạc, cùng nhau làm sáng danh Chúa.
          </p>
          <div className="ministry-hero-btns">
            <button className="ministry-btn-primary" onClick={() => setShowRegistration(true)}>
              Tham gia ngay
            </button>
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
        {ministriesLoading ? (
          <p style={{ padding: "24px 0", textAlign: "center" }}>Đang tải danh sách đoàn thể…</p>
        ) : ministriesError ? (
          <p style={{ padding: "24px 0", textAlign: "center" }}>{ministriesError}</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "24px 0", textAlign: "center" }}>Chưa có đoàn thể nào trong nhóm này.</p>
        ) : (
          <div className="ministry-grid">
            {filtered.map((m) => {
              const leader = findLeader(m.name);
              return (
                <div key={m.id} className="ministry-card">
                  <div className="ministry-card-img-wrap">
                    {m.image && (
                      <div
                        className="ministry-card-img"
                        style={{ backgroundImage: `url(${m.image})` }}
                      />
                    )}
                    <div className="ministry-card-icon">{m.icon}</div>
                  </div>
                  <div className="ministry-card-body">
                    <h3 className="ministry-card-name">{m.name}</h3>
                    <span className={`ministry-badge ${categoryClass[m.category] || "badge-blue"}`}>
                      {m.categoryLabel}
                    </span>
                    <p className="ministry-card-desc">{m.description}</p>
                    {leader && (
                      <p className="ministry-card-leader" style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                        👤 {leader.position}: <strong>{leader.fullName}</strong>
                        {leader.schoolYear ? ` (niên khóa ${leader.schoolYear})` : ""}
                      </p>
                    )}
                    <Link href={`/ministry/${m.id}`} className="ministry-card-link">
                      Tìm hiểu thêm
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          <button className="ministry-cta-btn" onClick={() => setShowRegistration(true)}>Đăng ký tham gia 1 cộng đoàn</button>
        </div>
      </div>
      {showRegistration && (
        <RegistrationModal
          ministries={ministries}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  );
}
