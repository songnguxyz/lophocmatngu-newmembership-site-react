// MyCard.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db, firebaseReady } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./Gacha.module.css";
import SparkleCanvas from "./SparkleCanvas";
import CardTrainingPortal from "./CardTrainingPortal";
import CardUpgradePortal from "./CardUpgradePortal"; // ✅ thêm mới

const rarityColors = {
  gray: styles.gray,
  green: styles.green,
  purple: styles.purple,
  gold: styles.gold,
  red: styles.red,
};

const MyCard = () => {
  const [cards, setCards] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [trainingMode, setTrainingMode] = useState(false);
  const [upgradeMode, setUpgradeMode] = useState(false); // ✅ thêm mới
  const [userId, setUserId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const reloadCards = async (userId) => {
    const q = query(
      collection(db, "ownedCards"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    const ownedCards = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const ownedData = docSnap.data();
        const cardRef = doc(db, "cards", ownedData.cardTemplateId);
        const cardSnap = await getDoc(cardRef);
        if (!cardSnap.exists()) return null;

        const cardData = cardSnap.data();
        return {
          ...cardData,
          ...ownedData,
          ownedCardId: docSnap.id,
        };
      })
    );

    const validCards = ownedCards.filter(Boolean);
    setCards(validCards);
    const uniqueRarities = [...new Set(validCards.map((card) => card.rarity))];
    setRarities(uniqueRarities);
  };

  useEffect(() => {
    let unsubscribe;
    firebaseReady.then(() => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        setUserId(user.uid);
        await reloadCards(user.uid);
        setLoading(false);
      });
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    const handleCardUpdated = (e) => {
      const updated = e.detail;
      setCards((prev) =>
        prev.map((c) =>
          c.ownedCardId === updated.ownedCardId ? { ...c, ...updated } : c
        )
      );
      setSelectedCard((prev) =>
        prev?.ownedCardId === updated.ownedCardId
          ? { ...prev, ...updated }
          : prev
      );
    };

    window.addEventListener("card-updated", handleCardUpdated);
    return () => {
      window.removeEventListener("card-updated", handleCardUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.sectionCenter}>
        <p>Đang tải bộ sưu tập thẻ của bạn...</p>
      </div>
    );
  }

  if (upgradeMode && userId && selectedCard) {
    return (
      <div className={styles.sectionCenter}>
        <CardUpgradePortal
          reloadCards={() => reloadCards(userId)}
          initialCard={selectedCard}
          onExit={() => setUpgradeMode(false)}
        />
      </div>
    );
  }

  if (trainingMode && userId && selectedCard) {
    return (
      <div className={styles.sectionCenter}>
        <CardTrainingPortal
          reloadCards={() => reloadCards(userId)}
          initialCard={selectedCard}
          onExit={() => setTrainingMode(false)}
        />
      </div>
    );
  }

  const filteredCards =
    selectedRarity === "all"
      ? cards
      : cards.filter((card) => card.rarity === selectedRarity);

  return (
    <div className={styles.sectionCenter}>
      <h2>🧾 Thẻ của Bạn</h2>

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
        {filteredCards.map((card) => {
          const EXP_PER_LEVEL = 200;
          const totalExp = card.exp || 0;
          const currentLevel = card.level || 1;
          const expInCurrentLevel = totalExp % EXP_PER_LEVEL;
          const expProgressPercent = (expInCurrentLevel / EXP_PER_LEVEL) * 100;

          return (
            <div
              key={card.ownedCardId}
              className={`${styles.card} ${
                rarityColors[card.rarity] || styles.gray
              } ${card.rarity === "purple" ? styles.purpleGlow : ""}`}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={card.cardImageUrl}
                  className={styles.cardImage}
                  alt={card.characterName}
                />
              </div>
              <div className={styles.cardOverlay}>
                <div className={styles.cardText}>
                  <div className={styles.cardName}>{card.characterName}</div>
                  <div className={styles.cardRarity}>
                    Độ hiếm: {card.rarity}
                  </div>

                  <div
                    style={{ fontSize: 13, fontWeight: "bold", marginTop: 4 }}
                  >
                    Level {currentLevel} || Exp: {totalExp}
                  </div>

                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#ccc",
                      height: 8,
                      borderRadius: 4,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${expProgressPercent}%`,
                        backgroundColor: "#4caf50",
                        height: "100%",
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>

                  {/* Nút luyện tập */}
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setTrainingMode(true);
                    }}
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      backgroundColor: "#ffc107",
                      border: "none",
                      borderRadius: 6,
                      color: "#000",
                      cursor: "pointer",
                    }}
                  >
                    🏋️‍♂️ Luyện tập
                  </button>

                  {/* Nút nâng cấp */}
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setUpgradeMode(true);
                    }}
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      backgroundColor: "#28a745",
                      border: "none",
                      borderRadius: 6,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    🚀 Nâng cấp
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCard;
