import React, { useState, useEffect } from "react";
import styles from "./AvatarPeak.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

export default function AvatarPeak({
  avatarUrl,
  name,
  peak,
  peakBgColor = "transparent",
  peakTextColor = "#fff",
  peakFontFamily = "inherit",
  preloadUrls = [],
}) {
  const [loaded, setLoaded] = useState(false);

  // Khi avatarUrl thay đổi, reset loaded → hiện placeholder
  useEffect(() => {
    setLoaded(false);
  }, [avatarUrl]);

  // Preload các URL khác (như trước)
  useEffect(() => {
    const imgs = [avatarUrl, ...preloadUrls].map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });
    return () => {
      // optional: no cleanup needed for Image()
    };
  }, [avatarUrl, preloadUrls]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarContainer}>
        {!loaded && <div className={styles.skeleton} />}
        <img
          src={avatarUrl || undefined}
          alt={name}
          className={styles.avatar}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          loading="eager"
          fetchPriority="high" // <— đổi ở đây
        />
      </div>
      {loaded && peak && (
        <div
          className={styles.peak}
          style={{
            backgroundColor: peakBgColor,
            color: peakTextColor,
            fontFamily: peakFontFamily, // đảm bảo inline style
          }}
        >
          <FontAwesomeIcon icon={faTrophy} />
          <span
            className={styles.peakText}
            style={{ fontFamily: peakFontFamily }} // thêm ở đây để chắc chắn
          >
            {peak}
          </span>
          <FontAwesomeIcon icon={faTrophy} />
        </div>
      )}
    </div>
  );
}
