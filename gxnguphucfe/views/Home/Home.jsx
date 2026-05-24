  'use client';
  import { useEffect, useState } from 'react';
  import './Home.css';

  export default function Home() {
    const slides = [
      '/images/slider1.JPG',
      '/images/slider2.JPG',
      '/images/slider3.JPG',
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrent(c => (c + 1) % slides.length);
      }, 3000);
      return () => clearInterval(timer);
    }, []);

    return (
      <>
      <section className="hero-wrapper">
    {/* SLIDER */}
    {slides.map((src, i) => (
      <div
        key={i}
        className="hero-slide"
        style={{
          backgroundImage: `url(${src})`,
          opacity: i === current ? 1 : 0,
        }}
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

      <h1 className="hero-title">Giáo xứ Ngũ Phúc</h1>

      <p className="hero-subtitle">
        "Hiệp thông – Phục vụ – Loan báo Tin Mừng"
      </p>

      <div className="hero-actions">
        <a className="btn-primary">
          <i className="bi bi-newspaper" />
          Tin tức mới nhất
        </a>
        <a className="btn-secondary">
          <i className="bi bi-clock" />
          Lịch lễ hôm nay
        </a>
      </div>
    </div>

    {/* QUICK ACTIONS */}
    <div className="quick-actions-overlay">
      <div className="quick-actions-wrapper">
        <div className="quick-grid">
        <div className="quick-action-item">
          <div className="quick-icon bg-blue">
            <i className="bi bi-book-half"></i>
          </div>
          <span>Sách ngày</span>
        </div>

        <div className="quick-action-item">
          <div className="quick-icon bg-green">
            <i className="bi bi-calendar3"></i>
          </div>
          <span>Lịch lễ</span>
        </div>

        <div className="quick-action-item">
          <div className="quick-icon bg-yellow">
            <i className="bi bi-pen"></i>
          </div>
          <span>Đăng ký</span>
        </div>

        <div className="quick-action-item">
          <div className="quick-icon bg-red">
            <i className="bi bi-play-btn"></i>
          </div>
          <span>Trực tuyến</span>
        </div>
      </div>
    </div>
  </div>

        </section>

        {/* LỊCH LỄ SECTION */}
        <section style={{ backgroundColor: '#f8f9fa', padding: '150px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '50px' }}>
              <h2
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: '8px',
                }}
              >
                Lịch lễ
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Cũng dự lễ Thánh Thể</p>
                <a
                  href="#"
                  style={{
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '16px',
                  }}
                >
                  Xem chi tiết →
                </a>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
              }}
            >
              {/* Ngày thường Card */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '35px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#dbeafe',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                    }}
                  >
                    <svg
                      style={{ width: '20px', height: '20px', color: '#2563eb', display: 'block' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
                      Ngày thường
                    </h3>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      fontSize: '13px',
                      fontWeight: '500',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Thứ 2 - Thứ 7
                  </span>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '20px',
                      borderBottom: '1px solid #f3f4f6',
                      marginBottom: '20px',
                      gap: '15px',
                    }}
                  >
                    <span style={{ color: '#666', fontWeight: '500', fontSize: '16px' }}>
                      Lễ sáng
                    </span>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      4:30 AM
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '15px',
                    }}
                  >
                    <span style={{ color: '#666', fontWeight: '500', fontSize: '16px' }}>
                      Lễ chiều
                    </span>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      5:30 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Chủ nhật Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  borderRadius: '16px',
                  padding: '35px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #fcd34d',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#fed7aa',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                    }}
                  >
                    <svg
                      style={{ width: '20px', height: '20px', color: '#ea580c', display: 'block' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
                      Chúa nhật
                    </h3>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#fbbf24',
                      color: '#92400e',
                      fontSize: '13px',
                      fontWeight: '500',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ngày Chúa
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '20px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      }}
                    >
                      Sáng
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      4:30 AM
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      }}
                    >
                      Thiếu nhi
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      7:30 AM
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      }}
                    >
                      Chiều
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      5:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
              }}
            >
              {/* Thông báo Giáo xứ */}
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}
                >
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      style={{ width: '24px', height: '24px', color: '#d97706', display: 'block' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
                    Thông báo Giáo xứ
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '3px solid #fbbf24',
                    borderLeft: '6px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '25px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            display: 'inline-block',
                          }}
                        ></span>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: 0,
                          }}
                        >
                          Quyên góp đặc biệt Chủ nhật này
                        </h3>
                      </div>
                      <p style={{ fontSize: '15px', color: '#666', margin: 0, paddingLeft: '16px' }}>
                        Sẽ có quyên góp lần hai để hỗ trợ quỹ từ thiện giáo phận cho nạn nhân lũ lụt.
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            display: 'inline-block',
                          }}
                        ></span>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: 0,
                          }}
                        >
                          Chuẩn bị Lễ Thánh Giuse
                        </h3>
                      </div>
                      <p style={{ fontSize: '15px', color: '#666', margin: 0, paddingLeft: '16px' }}>
                        Cầu nguyện tam nhật bắt đầu từ thứ Tư này lúc 5:00 chiều trước lễ.
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            display: 'inline-block',
                          }}
                        ></span>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: 0,
                          }}
                        >
                          Đăng ký lớp Giáo lý
                        </h3>
                      </div>
                      <p style={{ fontSize: '15px', color: '#666', margin: 0, paddingLeft: '16px' }}>
                        Đăng ký năm học mới đã mở tại văn phòng Giáo xứ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sự kiện sắp tới */}
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}
                >
                  <div
                    style={{
                      backgroundColor: '#dbeafe',
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      style={{ width: '24px', height: '24px', color: '#2563eb', display: 'block' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>
                    Sự kiện sắp tới
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      ></div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#3b82f6',
                            fontWeight: '600',
                            marginBottom: '6px',
                          }}
                        >
                          25 THÁNG 10, 2023
                        </div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: '0 0 4px 0',
                          }}
                        >
                          Lễ Bổn mạng Giáo xứ
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                          Lễ & Tiệc Cộng đoàn
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9ca3af',
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      ></div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            fontWeight: '600',
                            marginBottom: '6px',
                          }}
                        >
                          01 THÁNG 11, 2023
                        </div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: '0 0 4px 0',
                          }}
                        >
                          Lễ Các Thánh
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Ngày Lễ trọng</p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#9ca3af',
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      ></div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            fontWeight: '600',
                            marginBottom: '6px',
                          }}
                        >
                          02 THÁNG 11, 2023
                        </div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            margin: '0 0 4px 0',
                          }}
                        >
                          Lễ Các Đẳng Linh hồn
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                          Viếng nghĩa trang & Cầu nguyện
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href="#"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      padding: '12px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      marginTop: '5px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Xem lịch đầy đủ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#f8f9fa', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '50px',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    marginBottom: '8px',
                  }}
                >
                  Tin tức mới
                </h2>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                  Cập nhật từ cộng đoàn và các ban ngành
                </p>
              </div>
              <a
                href="#"
                style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '16px',
                }}
              >
                Xem tất cả →
              </a>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
              }}
            >
              {/* Card 1 - Cộng đoàn */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    Cộng đoàn
                  </span>
                </div>
                <div style={{ padding: '25px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '12px',
                      color: '#666',
                    }}
                  >
                    <svg
                      style={{ width: '16px', height: '16px' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>20 Tháng 10, 2023</span>
                  </div>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    Kết quả Lễ hội Thu hoạch
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#666',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                    }}
                  >
                    Lễ hội thu hoạch hằng năm thành công tốt đẹp nhờ sự tận tâm của các tình nguyện
                    viên...
                  </p>
                  <a
                    href="#"
                    style={{
                      color: '#0066cc',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Đọc thêm →
                  </a>
                </div>
              </div>

              {/* Card 2 - Từ thiện */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                    Từ thiện
                  </span>
                </div>
                <div style={{ padding: '25px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '12px',
                      color: '#666',
                    }}
                  >
                    <svg
                      style={{ width: '16px', height: '16px' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>18 Tháng 10, 2023</span>
                  </div>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    Đoàn Thanh niên quyên góp từ thiện
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#666',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                    }}
                  >
                    Ban Thanh niên đã quyên góp được hơn 500kg thực phẩm cho trại cứu tế địa phương...
                  </p>
                  <a
                    href="#"
                    style={{
                      color: '#0066cc',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Đọc thêm →
                  </a>
                </div>
              </div>

              {/* Card 3 - Phụng vụ */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                    Phụng vụ
                  </span>
                </div>
                <div style={{ padding: '25px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '12px',
                      color: '#666',
                    }}
                  >
                    <svg
                      style={{ width: '16px', height: '16px' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>15 Tháng 10, 2023</span>
                  </div>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    Lịch phụng vụ mới
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#666',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                    }}
                  >
                    Từ tháng sau, sẽ có điều chỉnh nhỏ về thời gian xung tội trong tuần...
                  </p>
                  <a
                    href="#"
                    style={{
                      color: '#0066cc',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Đọc thêm →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
