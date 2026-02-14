import React, { useState } from "react";
import styles from "./ThemeForm.module.css";

const sectionsConfig = [
  {
    key: "section1",
    label: "Section 1",
    subs: [
      { key: "peak", label: "PEAK" },
      { key: "albumCarousel", label: "Album" },
      { key: "featuredComics", label: "TRUYỆN TRANH" },
    ],
  },
  {
    key: "section2",
    label: "Section 2",
    subs: [
      { key: "sectionName", label: "TÊN NHÂN VẬT" },
      { key: "info", label: "Thông tin" },
      { key: "radarStats", label: "Radar chỉ số" },
      { key: "subjectStats", label: "Môn học" },
    ],
  },
  { key: "section3", label: "Section 3", subs: [] },
  {
    key: "section4",
    label: "Section 4",
    subs: [
      { key: "quote", label: "THOẠI CÁ NHÂN" },
      { key: "socialButtons", label: "Social Buttons" },
      { key: "tabContent", label: "Tab thông tin" },
      { key: "inventory", label: "Đồ vật" },
    ],
  },
  {
    key: "section5",
    label: "BẠN BÈ",
    subs: [{ key: "friends", label: "BẠN BÈ" }],
  },
];

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ThemeForm({
  theme = {},
  posterUrl = "",
  onSave,
  onCancel,
}) {
  const [background, setBackground] = useState(theme.background || "#6d6dbf");
  const [sections, setSections] = useState(() => {
    const init = {};
    sectionsConfig.forEach(({ key, subs }) => {
      init[key] = { subs: {} };
      subs.forEach(({ key: sk }) => {
        init[key].subs[sk] = {
          bg: theme.sections?.[key]?.subs?.[sk]?.bg || "#dddddd",
          color: theme.sections?.[key]?.subs?.[sk]?.color || "#000000",
          fontFamily:
            theme.sections?.[key]?.subs?.[sk]?.fontFamily ||
            "Arial, sans-serif",
          alpha: theme.sections?.[key]?.subs?.[sk]?.alpha ?? 1,
        };
      });
    });
    return init;
  });

  const updateConfig = (secKey, field, value, subKey) =>
    setSections((prev) => {
      const next = { ...prev };
      next[secKey].subs[subKey][field] = value;
      return next;
    });

  const handleSave = () => {
    // trả về đúng structure: { background, sections: { section5: { subs: { friends: ... } }, ... } }
    onSave({ background, sections });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>🎨 Chỉnh theme nâng cao</h3>
        <div className={styles.themeBody}>
          {/* PREVIEW */}
          <div className={styles.previewPanel} style={{ background }}>
            <div className={styles.previewContainer}>
              {sectionsConfig.map(({ key, subs }) => (
                <div
                  key={key}
                  className={`${styles.section} ${styles[key]}`}
                  style={{ background: "transparent" }}
                >
                  {key === "section3" && posterUrl && (
                    <img
                      src={posterUrl}
                      alt="Poster"
                      className={styles.previewPoster}
                    />
                  )}
                  {subs.map(({ key: sk, label }) => {
                    const cfg = sections[key].subs[sk];
                    return (
                      <div
                        key={sk}
                        className={styles[`sub-${sk}`]}
                        style={{
                          background: hexToRgba(cfg.bg, cfg.alpha),
                          color: cfg.color,
                          fontFamily: cfg.fontFamily,
                        }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* CONTROLS */}
          <div className={styles.controlsPanel}>
            {/* Nền chung */}
            <fieldset className={styles.controlSection}>
              <legend>Nền chung</legend>
              <div className={styles.controlItem}>
                <label>Nền:</label>
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </div>
            </fieldset>

            {/* Các section */}
            {sectionsConfig.map(({ key, label, subs }) => (
              <fieldset key={key} className={styles.controlSection}>
                <legend>{label}</legend>
                {subs.map(({ key: sk, label: subLabel }) => {
                  const cfg = sections[key].subs[sk];
                  return (
                    <details key={sk} className={styles.controlSubsection}>
                      <summary>{subLabel}</summary>
                      <div className={styles.controlItem}>
                        <label>Màu nền:</label>
                        <input
                          type="color"
                          value={cfg.bg}
                          onChange={(e) =>
                            updateConfig(key, "bg", e.target.value, sk)
                          }
                        />
                      </div>
                      <div className={styles.controlItem}>
                        <label>Opacity:</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={cfg.alpha}
                          onChange={(e) =>
                            updateConfig(key, "alpha", +e.target.value, sk)
                          }
                        />
                      </div>
                      <div className={styles.controlItem}>
                        <label>Màu chữ:</label>
                        <input
                          type="color"
                          value={cfg.color}
                          onChange={(e) =>
                            updateConfig(key, "color", e.target.value, sk)
                          }
                        />
                      </div>
                      <div className={styles.controlItem}>
                        <label>Font:</label>
                        <select
                          value={cfg.fontFamily}
                          onChange={(e) =>
                            updateConfig(key, "fontFamily", e.target.value, sk)
                          }
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="'Times New Roman', serif">
                            Times New Roman
                          </option>
                          <option value="Merriweather, serif">
                            Merriweather
                          </option>
                          <option value="Open Sans, sans-serif">
                            Open Sans
                          </option>
                          <option value="Nunito, sans-serif">Nunito</option>
                          <option value="Patrick Hand, cursive">
                            Patrick Hand
                          </option>
                        </select>
                      </div>
                    </details>
                  );
                })}
              </fieldset>
            ))}

            <div className={styles.buttonGroup}>
              <button onClick={handleSave}>💾 Lưu</button>
              <button onClick={onCancel}>✖ Hủy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//code hoàn chỉnh chưa thử nghiệm đổi gradiel//