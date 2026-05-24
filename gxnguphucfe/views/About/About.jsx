"use client";

import { useState } from "react";
import "./About.css";

const tabs = [
  { id: "history", label: "Lịch sử", sub: "History" },
  { id: "vision", label: "Tầm nhìn", sub: "Vision" },
  { id: "clergy", label: "Quý Cha & Tu sĩ", sub: "Clergy" },
  { id: "org", label: "Tổ chức", sub: "Organization" },
  { id: "facilities", label: "Cơ sở vật chất", sub: "Facilities" },
];

const clergy = [
  {
    name: "Lm. Giuse Nguyễn Văn An",
    role: "Chánh Xứ",
    roleEn: "Parish Priest",
    badge: "Pastor",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1s07VdOYtQfjhA1lz2w_q2TnWG8L7zzP280GhQLCHGXBTkoLcnntyfAo-8SoxSN61z_3HvYcTNKtkfhdg9CKG_rsD3EYoqYtYDKlq9sZ7rAVfhxGARjhQGs3i3Hq_sXvfiYqGaCG-OeTohy0B5liVpz7onn0-7Gxc45Yj77f8syzwMilKZn4qzEDhz5THNTA4aGklxBt17gTPVuBPjNWqxsC3lZSDKt1Y5XlfGc5l0jxprYIUUNly8qCGtn0ucVHhNPTeBij5Sic",
    hasPhone: true,
  },
  {
    name: "Lm. Phêrô Trần Văn Bình",
    role: "Phó Xứ",
    roleEn: "Assistant Priest",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuADV1SqirlG8_5gn9Or5H6PfrP53TJMJNEd81_SO_R9ZYfbzC-5ukP1XuqLmWbt83k_OWErONtOIAYCCGvwfFD0qAW1DfHJYpcqe6QnOeJfCVe0-uNaPiDpTKHPnKzq6DLy-R8Ktl8P63VnRKCVWmFM-RwV6qKctfDTEj2By1lsVAFTfClQGpr9s-4yBDxv-b_z_fKATAUFdoG9PTdzr7OoSUaKJp6IPGZP7E0CEMMc8WDwoZ5ohJaqgo8RMrZCtbMk2GpFggWBqnA",
  },
  {
    name: "Thầy Phó Tế Lê Văn Dũng",
    role: "Phó Tế",
    roleEn: "Deacon",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5Sqd30_inDgWloFdIB9BUiIAlat3BsgoM_k_f8lLIkSxYVFKJwyHa2Qjsvkz5zpRd9ZET1HGM0G0ytlHhoXcU-JcylRcgdV_ayn47ZiiIflXZc8xyPVmCViBvsXTSQNKnFf7vkIe51ffHmmXeteUkTM-Ws4NvOlHN36Fv62Qy7d9_2ah7ql8cv94v_E437Zsi0-qq-CvQiNTOD990sT88F3UrMczPJJvAOzhXNt1OzWcMFl3MrNdSEoE4PGsUUNP5oWbK2FFxOrE",
  },
  {
    name: "Sr. Maria Celine",
    role: "Phụ trách Giáo Lý",
    roleEn: "Catechism",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYl0d-fCcLRkzl57g-1Fa_KJTcSD_PLCy8UMkDuT30IO6fmb8PILb32C87SysuQ5cggCNI6CEdbw4su-K5sk7g51E1SsNJwTZKDwSY1wiRr18b36fC5hT2DBZ3m9odVF-a83AmLmQKIjYBmuMk3l4cTqPDT3HlAYve3G9SLd20_3-qRbJOZc_Q8Ph-HmIxgHJzBxYblwgrPjVHFDx7P5CPCqwRfOjBaV90xQ6Y9fDz7Ut4GegQ-5sMjnitiq8_D5NHAiq7bq_hKVU",
  },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("clergy");

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
        <div className="clergyGrid">
          {clergy.map((person) => (
            <div key={person.name} className="clergyCard">
              <div className="cardImgWrap">
                <div
                  className="cardImg"
                  style={{ backgroundImage: `url("${person.image}")` }}
                />
                <div className="cardImgOverlay" />
                {person.badge && (
                  <div className="cardBadge">{person.badge}</div>
                )}
              </div>
              <div className="cardBody">
                <div className="cardName">{person.name}</div>
                <div className="cardRole">{person.role}</div>
                <div className="cardRoleEn">{person.roleEn}</div>
                <div className="cardActions">
                  <button className="cardActionBtn" title="Gửi email">✉</button>
                  {person.hasPhone && (
                    <button className="cardActionBtn" title="Gọi điện">📞</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QUOTE */}
        <div className="quoteBlock">
          <span className="quoteIcon">❝</span>
          <p className="quoteText">
            "The priesthood is the love of the heart of Jesus. When you see a
            priest, think of our Lord Jesus Christ."
          </p>
          <p className="quoteAuthor">— St. John Vianney</p>
        </div>

      </main>
    </div>
  );
}
