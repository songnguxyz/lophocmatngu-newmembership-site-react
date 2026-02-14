// components/Card/AllCardTemplate.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./Gacha.module.css";

const rarityColors = {
  gray: styles.gray,
  green: styles.green,
  purple: styles.purple,
  gold: styles.gold,
  red: styles.red,
};

const AllCardTemplate = () => {
  const [cards, setCards] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    const snap = await getDocs(collection(db, "cards"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCards(list);

    const uniqueRarities = [...new Set(list.map((card) => card.rarity))];
    setRarities(uniqueRarities);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredCards =
    selectedRarity === "all"
      ? cards
      : cards.filter((card) => card.rarity === selectedRarity);

  if (loading) {
    return (
      <div className={styles.sectionCenter}>
        <p>Đang tải danh sách template thẻ...</p>
      </div>
    );
  }

  return (
    <div className={styles.sectionCenter}>
      <h2>📚 Danh sách toàn bộ thẻ đã tạo</h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <button
          className={`${styles.rollButton}`}
          onClick={() => setSelectedRarity("all")}
        >
          Tất cả ({cards.length})
        </button>
        {rarities.map((rarity) => (
          <button
            key={rarity}
            className={`${styles.rollButton}`}
            onClick={() => setSelectedRarity(rarity)}
          >
            {rarity.toUpperCase()} (
            {cards.filter((c) => c.rarity === rarity).length})
          </button>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`${styles.card} ${
              rarityColors[card.rarity] || styles.gray
            }`}
            style={{ position: "relative", overflow: "visible" }}
          >
            <div className={styles.cardImageWrapper}>
              <img
                src={card.cardImageUrl}
                className={styles.cardImage}
                alt={card.characterName}
              />
            </div>{" "}
            <div className={styles.cardOverlay}>
              <div className={styles.cardText}>
                <div className={styles.cardName}>{card.characterName}</div>
                <div className={styles.cardRarity}>Độ hiếm: {card.rarity}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllCardTemplate;
