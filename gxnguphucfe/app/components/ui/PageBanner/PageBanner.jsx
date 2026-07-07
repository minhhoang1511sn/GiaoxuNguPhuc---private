'use client';

import { useState, useEffect } from 'react';
import styles from './PageBanner.module.css';

const DEFAULT_BG = '/images/default-banner.jpg';

export default function PageBanner({ title, subtitle, bgImage }) {
  const targetUrl = bgImage || DEFAULT_BG;

  // Ảnh nền được preload trước khi hiện ra để tránh hiệu ứng "giật" ảnh to,
  // và tự rơi về ảnh mặc định nếu link ảnh admin nhập bị hỏng.
  const [resolvedUrl, setResolvedUrl] = useState(DEFAULT_BG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    const img = new Image();
    img.src = targetUrl;
    img.onload = () => {
      if (cancelled) return;
      setResolvedUrl(targetUrl);
      setLoaded(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      setResolvedUrl(DEFAULT_BG);
      setLoaded(true);
    };

    return () => { cancelled = true; };
  }, [targetUrl]);

  return (
    <div className={styles.bannerWrapper}>
      <div
        className={`${styles.bg} ${loaded ? styles.bgLoaded : ''}`}
        style={{ backgroundImage: `url('${resolvedUrl}')` }}
      />
      <div className={styles.overlay} />
      <div className={styles.vignette} />

      <div className={styles.content}>
        {subtitle && (
          <div className={styles.subtitleWrapper}>
            <span className={styles.line} />
            <span className={styles.subtitle}>{subtitle.toUpperCase()}</span>
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </div>
  );
}
