import React from "react";
import styles from "./Gacha.module.css";

const SectionPacks = ({
  packs,
  selectedPackId,
  setSelectedPackId,
  onRoll,
  error,
}) => {
  return (
    <div className={styles.sectionCenter}>
      <h2>🎰 Chọn Gói Gacha</h2>
      <div className={styles.packList}>
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`${styles.packCard} ${
              selectedPackId === pack.id ? styles.selected : ""
            }`}
            onClick={() => setSelectedPackId(pack.id)}
          >
            <img
              src={pack.imageUrl}
              alt={pack.name}
              className={styles.packImage}
            />
            <div>
              <strong>{pack.name}</strong>
            </div>
            <div>
              {pack.count} lượt - {pack.price} xu
            </div>
          </div>
        ))}
      </div>
      <button onClick={onRoll} className={styles.rollButton}>
        Quay Gacha
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SectionPacks;
