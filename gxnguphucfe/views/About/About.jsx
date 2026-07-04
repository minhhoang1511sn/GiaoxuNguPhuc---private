"use client";

import { useState, useEffect } from "react";
import "./About.css";
import { resolveImageUrl } from "@/app/lib/uploadImage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7272";

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

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [clergy, setClergy] = useState([]);
  const [clergyLoading, setClergyLoading] = useState(true);
  const [clergyError, setClergyError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchClergy() {
      setClergyLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/clergy-members`);
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

    async function fetchHistory() {
      setHistoryLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/parish-history`);
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

  return (
    <div className="about-page">

      {/* HERO */}
      <div className="hero">
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

            {/* CLERGY GRID */}
            {clergyLoading ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>Đang tải danh sách…</p>
              </div>
            ) : clergyError ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>{clergyError}</p>
              </div>
            ) : clergy.length === 0 ? (
              <div className="clergyGrid">
                <p style={{ padding: "24px 0" }}>Chưa có thông tin Quý Cha & Tu sĩ đang phục vụ.</p>
              </div>
            ) : (
              <div className="clergyGrid">
                {clergy.map((person) => {
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
                })}
              </div>
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
