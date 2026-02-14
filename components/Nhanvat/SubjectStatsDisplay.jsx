import React from "react";
import styles from "./SubjectStatsDisplay.module.css";
import { FaStar } from "react-icons/fa";

/**
 * Hiển thị thống kê môn học dưới dạng sao.
 * Bổ sung prop fontFamily để apply font từ database.
 */
const SubjectStatsDisplay = ({ stats = {}, fontFamily }) => {
  if (!stats || Object.keys(stats).length === 0) return null;

  // Đảm bảo fontFamily là string
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  return (
    <div className={styles.statsBox} style={{ fontFamily: fontFamilyString }}>
      <ul className={styles.statsList}>
        {Object.entries(stats).map(([label, value]) => (
          <li
            className={styles.statRow}
            key={label}
            style={{ fontFamily: fontFamilyString }}
          >
            <div
              className={styles.statLabel}
              style={{ fontFamily: fontFamilyString }}
            >
              {label}
            </div>
            <div className={styles.statStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  className={i < value ? styles.starFilled : styles.starEmpty}
                  style={{ fontFamily: fontFamilyString }}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectStatsDisplay;
