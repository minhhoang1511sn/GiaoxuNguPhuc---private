"use client";

import { useState, useEffect } from "react";
import "./About.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";
import { usePageBanner } from "@/app/lib/usePageBanner";
import { API_BASE_URL } from "@/app/lib/apiClient";


const tabs = [
  { id: "history", label: "Lịch sử", sub: "History" },
  { id: "clergy", label: "Quý Cha, Tu sĩ & Tổ chức", sub: "Clergy & Organization" },
];

// Nhãn hiển thị badge riêng cho Chánh xứ, khớp phong cách cũ (Pastor)
const PASTOR_BADGE_KEYWORDS = ["chánh xứ", "chanh xu"];

function toRoleEn(typeName) {
  switch (typeName) {
    case "LinhMuc": return "Priest";
    case "ThayXu": return "Deacon";
    case "TuSi": return "Religious Sister";
    default: return "Parish Staff";
  }
}

// Type dùng để nhận diện Ban Hành Giáo (giáo dân phụ trách), tách riêng khỏi Quý Cha & Tu sĩ
const BAN_HANH_GIAO_TYPE = "GiaoDan";

// Gom danh sách "đã từng phục vụ" theo niên khóa, giữ nguyên thứ tự đã sắp từ API (niên khóa gần nhất trước)
function groupBySchoolYear(list) {
  const groups = [];
  const indexByYear = new Map();

  for (const person of list) {
    const key = person.schoolYear || "Không rõ niên khóa";
    if (!indexByYear.has(key)) {
      indexByYear.set(key, groups.length);
      groups.push({ year: key, items: [] });
    }
    groups[indexByYear.get(key)].items.push(person);
  }

  return groups;
}

export default function AboutPage() {
  const { bannerUrl } = usePageBanner("about");
  const [activeTab, setActiveTab] = useState("history");
  const [clergy, setClergy] = useState([]);
  const [clergyLoading, setClergyLoading] = useState(true);
  const [clergyError, setClergyError] = useState("");

  const [pastClergy, setPastClergy] = useState([]);
  const [pastLoading, setPastLoading] = useState(true);
  const [pastError, setPastError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchClergy() {
      setClergyLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/clergy-members`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setClergy(data ?? []);
      } catch (err) {
        if (!cancelled) setClergyError("Không tải được danh sách Quý Cha & Tu sĩ.");
      } finally {
        if (!cancelled) setClergyLoading(false);
      }
    }

    fetchClergy();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPastClergy() {
      setPastLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/clergy-members/past`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPastClergy(data ?? []);
      } catch (err) {
        if (!cancelled) setPastError("Không tải được danh sách quý vị đã từng phục vụ.");
      } finally {
        if (!cancelled) setPastLoading(false);
      }
    }

    fetchPastClergy();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/parish-history`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setHistory(data ?? []);
      } catch (err) {
        if (!cancelled) setHistoryError("Không tải được lược sử giáo xứ.");
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, []);

  // Card dùng chung cho cả người đang phục vụ và người đã từng phục vụ
  function renderClergyCard(person) {
    const isPastor = PASTOR_BADGE_KEYWORDS.some((k) =>
      person.position?.toLowerCase().includes(k)
    );
    return (
      <div key={person.id} className="clergyCard">
        <div className="cardImgWrap">
          <div
            className="cardImg"
            style={person.imageUrl ? { backgroundImage: `url("${resolveImageUrl(person.imageUrl)}")` } : undefined}
          />
          <div className="cardImgOverlay" />
          {isPastor && <div className="cardBadge">Pastor</div>}
        </div>
        <div className="cardBody">
          <div className="cardName">{person.fullName}</div>
          <div className="cardRole">
            {person.position}
            {person.ministryName ? ` · ${person.ministryName}` : ""}
          </div>
          <div className="cardRoleEn">{toRoleEn(person.typeName)}</div>
          {person.schoolYear && (
            <div className={`cardYear ${person.isCurrent ? "" : "cardYearEnded"}`}>
              <span aria-hidden="true">📅</span>
              {person.isCurrent ? `Niên khóa ${person.schoolYear} (đang phục vụ)` : `Niên khóa ${person.schoolYear} (đã phục vụ)`}
            </div>
          )}
          <div className="cardActions">
            {person.email && (
              <a className="cardActionBtn" title="Gửi email" href={`mailto:${person.email}`}>✉</a>
            )}
            {person.phone && (
              <a className="cardActionBtn" title="Gọi điện" href={`tel:${person.phone}`}>📞</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentMainClergy = clergy.filter((p) => p.typeName !== BAN_HANH_GIAO_TYPE);
  const currentBanHanhGiao = clergy.filter((p) => p.typeName === BAN_HANH_GIAO_TYPE);

  const pastMainClergy = pastClergy.filter((p) => p.typeName !== BAN_HANH_GIAO_TYPE);
  const pastBanHanhGiao = pastClergy.filter((p) => p.typeName === BAN_HANH_GIAO_TYPE);
  const pastMainByYear = groupBySchoolYear(pastMainClergy);
  const pastBanHanhGiaoByYear = groupBySchoolYear(pastBanHanhGiao);

  return (
    <div className="about-page">

      {/* HERO */}
      <div
        className="hero"
        style={bannerUrl ? { backgroundImage: `url('${bannerUrl}')` } : undefined}
      >
        <div className="heroContent">
          <div className="heroEyebrow">Welcome to our community</div>
          <h1 className="heroTitle">Về Giáo Xứ</h1>
          <p className="heroSub">About Our Parish</p>
        </div>
      </div>

      {/* MAIN */}
      <main className="main">

        {/* TABS */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tabBtn ${activeTab === tab.id ? "tabBtnActive" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tabSub">{tab.sub}</span>
            </button>
          ))}
        </div>

        {/* HISTORY TIMELINE */}
        {activeTab === "history" && (
          <>
            <div className="sectionIntro">
              <h2>
                Lược sử <em>hình thành &amp; phát triển</em>
              </h2>
              <p>
                Hành trình hình thành và phát triển của Giáo xứ Ngũ Phúc qua các
                giai đoạn.
              </p>
            </div>

            {historyLoading ? (
              <p style={{ padding: "24px 0" }}>Đang tải lược sử…</p>
            ) : historyError ? (
              <p style={{ padding: "24px 0" }}>{historyError}</p>
            ) : history.length === 0 ? (
              <p style={{ padding: "24px 0" }}>Chưa có nội dung lược sử giáo xứ.</p>
            ) : (
              <div className="historyTimeline">
                {history.map((item) => (
                  <div key={item.id} className="historyItem">
                    <div className="historyYear">{item.year}</div>
                    <div className="historyBody">
                      {item.imageUrl && (
                        <div
                          className="historyImg"
                          style={{ backgroundImage: `url("${resolveImageUrl(item.imageUrl)}")` }}
                        />
                      )}
                      <h3 className="historyTitle">{item.title}</h3>
                      <p className="historyText">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CLERGY & ORGANIZATION */}
        {activeTab === "clergy" && (
          <>
            {/* SECTION INTRO */}
            <div className="sectionIntro">
              <h2>
                Quý Cha &amp; Tu sĩ <em>phục vụ</em>
              </h2>
              <p>
                Meet the dedicated clergy and religious sisters who serve the
                spiritual needs of Giáo xứ Ngũ Phúc.
              </p>
            </div>

            {/* CLERGY GRID — Quý Cha & Tu sĩ đang phục vụ */}
            {clergyLoading ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>Đang tải danh sách…</p>
              </div>
            ) : clergyError ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>{clergyError}</p>
              </div>
            ) : currentMainClergy.length === 0 ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>Chưa có thông tin Quý Cha & Tu sĩ đang phục vụ.</p>
              </div>
            ) : (
              <div className="clergyGrid">
                {currentMainClergy.map(renderClergyCard)}
              </div>
            )}

            {/* BAN HÀNH GIÁO — đang phục vụ (khối riêng) */}
            {!clergyLoading && !clergyError && currentBanHanhGiao.length > 0 && (
              <>
                <div className="sectionIntro">
                  <h2>
                    Ban Hành Giáo <em>đang phục vụ</em>
                  </h2>
                  <p>
                    Quý ông bà, anh chị trong Ban Hành Giáo đang đồng hành và phục vụ
                    đời sống giáo xứ Ngũ Phúc.
                  </p>
                </div>
                <div className="clergyGrid">
                  {currentBanHanhGiao.map(renderClergyCard)}
                </div>
              </>
            )}

            {/* ĐÃ TỪNG PHỤC VỤ — nhóm theo niên khóa */}
            {!pastLoading && !pastError && pastClergy.length > 0 && (
              <>
                <div className="sectionIntro">
                  <h2>
                    Quý Cha, Tu sĩ &amp; Ban Hành Giáo <em>đã từng phục vụ</em>
                  </h2>
                  <p>
                    Tri ân quý Cha, quý Thầy, quý Sr và quý vị trong Ban Hành Giáo đã
                    từng đóng góp cho Giáo xứ Ngũ Phúc qua các niên khóa.
                  </p>
                </div>

                {pastMainByYear.map((group) => (
                  <div key={`past-clergy-${group.year}`} style={{ marginBottom: "1.5rem" }}>
                    <h3 className="historyTitle" style={{ marginBottom: "1rem" }}>
                      Niên khóa {group.year}
                    </h3>
                    <div className="clergyGrid">
                      {group.items.map(renderClergyCard)}
                    </div>
                  </div>
                ))}

                {pastBanHanhGiaoByYear.map((group) => (
                  <div key={`past-bhg-${group.year}`} style={{ marginBottom: "1.5rem" }}>
                    <h3 className="historyTitle" style={{ marginBottom: "1rem" }}>
                      Ban Hành Giáo · Niên khóa {group.year}
                    </h3>
                    <div className="clergyGrid">
                      {group.items.map(renderClergyCard)}
                    </div>
                  </div>
                ))}
              </>
            )}
            {pastLoading && (
              <p style={{ padding: "24px 0" }}>Đang tải danh sách đã từng phục vụ…</p>
            )}
            {pastError && (
              <p style={{ padding: "24px 0" }}>{pastError}</p>
            )}

            {/* QUOTE */}
            <div className="quoteBlock">
              <span className="quoteIcon">❝</span>
              <p className="quoteText">
                "The priesthood is the love of the heart of Jesus. When you see a
                priest, think of our Lord Jesus Christ."
              </p>
              <p className="quoteAuthor">— St. John Vianney</p>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
