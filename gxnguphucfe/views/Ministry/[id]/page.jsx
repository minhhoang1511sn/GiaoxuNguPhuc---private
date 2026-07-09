"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import "../Ministry.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";
import { API_BASE_URL } from "@/app/lib/apiClient";
import RegistrationModal from "../RegistrationModal";

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function MinistryDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ministry, setMinistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [leader, setLeader] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [allMinistries, setAllMinistries] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMinistry() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${API_BASE_URL}/api/ministries/${id}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMinistry({
            id: data.id,
            name: data.name,
            categoryLabel: data.categoryLabel,
            description: data.description,
            image: resolveImageUrl(data.imageUrl),
            icon: data.icon || "👥",
          });
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchMinistry();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeader() {
      if (!ministry) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/clergy-members`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const found = (data ?? []).find(
            (p) => normalize(p.ministryName) === normalize(ministry.name)
          );
          setLeader(found ?? null);
        }
      } catch {
        // im lặng bỏ qua, không hiển thị lỗi phần trưởng ban
      }
    }

    fetchLeader();
    return () => { cancelled = true; };
  }, [ministry]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ministries`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAllMinistries(data ?? []);
      } catch {
        // dùng cho dropdown chọn đoàn thể khác trong modal đăng ký
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="ministry-page">
        <p style={{ padding: "80px 0", textAlign: "center" }}>Đang tải…</p>
      </div>
    );
  }

  if (notFound || !ministry) {
    return (
      <div className="ministry-page">
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: 12 }}>Không tìm thấy đoàn thể</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            Đoàn thể bạn tìm không tồn tại hoặc đã ngưng hoạt động.
          </p>
          <Link href="/ministry" className="ministry-btn-primary" style={{ display: "inline-block" }}>
            ← Quay lại danh sách đoàn thể
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ministry-page">
      {/* Hero */}
      <div
        className="ministry-hero"
        style={ministry.image ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%), url('${ministry.image}')`,
        } : undefined}
      >
        <div className="ministry-hero-content">
          <span className="ministry-hero-eyebrow">{ministry.categoryLabel}</span>
          <h1 className="ministry-hero-title">
            {ministry.icon} {ministry.name}
          </h1>
          <div className="ministry-hero-btns">
            <button className="ministry-btn-primary" onClick={() => setShowRegistration(true)}>
              Đăng ký tham gia
            </button>
            <button className="ministry-btn-ghost" onClick={() => router.push("/ministry")}>
              ← Xem tất cả đoàn thể
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ministry-grid-wrap">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 0 48px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>
            Giới thiệu
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "#334155", whiteSpace: "pre-line" }}>
            {ministry.description}
          </p>

          {leader && (
            <div
              style={{
                marginTop: 32,
                padding: 20,
                borderRadius: 12,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#1e293b" }}>
                Người phụ trách
              </h3>
              <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
                👤 {leader.position}: <strong>{leader.fullName}</strong>
                {leader.schoolYear ? ` (niên khóa ${leader.schoolYear})` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="ministry-cta-wrap">
        <div className="ministry-cta">
          <div className="ministry-cta-text">
            <h2 className="ministry-cta-title">Bạn muốn tham gia {ministry.name}?</h2>
            <p className="ministry-cta-sub">
              Hãy đăng ký ngay để cùng đồng hành và phục vụ cộng đoàn trong đoàn thể này.
            </p>
          </div>
          <button className="ministry-cta-btn" onClick={() => setShowRegistration(true)}>
            Đăng ký tham gia
          </button>
        </div>
      </div>

      {showRegistration && (
        <RegistrationModal
          ministries={allMinistries.length ? allMinistries : [{ id: ministry.id, name: ministry.name }]}
          defaultMinistryId={ministry.id}
          onClose={() => setShowRegistration(false)}
        />
      )}
    </div>
  );
}