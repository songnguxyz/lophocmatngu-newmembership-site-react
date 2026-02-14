import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./Gacha.module.css";

const UPGRADE_PATH = ["gray", "green", "purple", "gold", "red"];

const rarityColors = {
  gray: styles.gray,
  green: styles.green,
  purple: styles.purple,
  gold: styles.gold,
  red: styles.red,
};

const CardUpgradePortal = ({ initialCard, onExit, reloadCards }) => {
  const [card, setCard] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const getNextRarity = (current) => {
    const index = UPGRADE_PATH.indexOf(current);
    return UPGRADE_PATH[index + 1] || null;
  };

  const loadFullCard = async (ownedCardId) => {
    const docSnap = await getDoc(doc(db, "ownedCards", ownedCardId));
    if (!docSnap.exists()) return;

    const ownedData = docSnap.data();
    const templateSnap = await getDoc(
      doc(db, "cards", ownedData.cardTemplateId)
    );
    if (!templateSnap.exists()) return;

    const cardData = templateSnap.data();
    setCard({
      ...cardData,
      ...ownedData,
      ownedCardId,
    });
  };

  const fetchSameCards = async (card) => {
    if (!card || !card.userId) return;

    const q = query(
      collection(db, "ownedCards"),
      where("userId", "==", card.userId),
      where("cardTemplateId", "==", card.cardTemplateId)
    );

    const snap = await getDocs(q);
    const result = [];

    for (let docSnap of snap.docs) {
      const owned = docSnap.data();
      result.push({
        ...owned,
        ownedCardId: docSnap.id,
        isMainCard: docSnap.id === card.ownedCardId,
      });
    }

    setMaterials(result);
  };

  const findNextTemplate = async (card) => {
    const nextRarity = getNextRarity(card.rarity);
    if (!nextRarity) return null;

    const all = await getDocs(collection(db, "cards"));
    const match = all.docs.find(
      (doc) =>
        doc.data().characterId === card.characterId &&
        doc.data().rarity === nextRarity
    );
    return match ? { id: match.id, ...match.data() } : null;
  };

  const handleUpgrade = async () => {
    if (!card) return;

    if (card.level < 5) {
      setStatusMessage("❌ Thẻ chính chưa đạt level 5.");
      return;
    }

    if (selectedMaterials.length < 1) {
      setStatusMessage("❌ Cần ít nhất 1 thẻ nguyên liệu để nâng cấp.");
      return;
    }

    const allMaxed = selectedMaterials.every((m) => m.level >= 5);
    if (!allMaxed) {
      setStatusMessage("❌ Mọi thẻ nguyên liệu phải đạt level 5.");
      return;
    }

    const next = await findNextTemplate(card);
    if (!next) {
      setStatusMessage("❌ Không tìm thấy thẻ kế tiếp.");
      return;
    }

    try {
      const batch = writeBatch(db);

      // Cập nhật thẻ chính
      batch.update(doc(db, "ownedCards", card.ownedCardId), {
        cardTemplateId: next.id,
        exp: 0,
        level: 1,
        updatedAt: new Date(),
      });

      // Hủy nguyên liệu
      selectedMaterials.forEach((mat) => {
        batch.update(doc(db, "ownedCards", mat.ownedCardId), {
          userId: null,
          status: "consumed",
          updatedAt: new Date(),
        });
      });

      await batch.commit();

      setStatusMessage("🎉 Nâng cấp thành công!");
      setUpgradeSuccess(true);

      // Load lại dữ liệu thẻ chính
      await loadFullCard(card.ownedCardId);
      await fetchSameCards({
        ...card,
        cardTemplateId: next.id,
        rarity: next.rarity,
      });
      if (reloadCards) reloadCards(card.userId);
      setSelectedMaterials([]);
    } catch (err) {
      console.error("❌ Upgrade failed:", err);
      setStatusMessage("❌ Lỗi khi nâng cấp thẻ.");
    }
  };

  useEffect(() => {
    loadFullCard(initialCard.ownedCardId);
  }, []);

  useEffect(() => {
    if (card) {
      fetchSameCards(card);
    }
  }, [card]);

  if (!card) return <p>Đang tải dữ liệu thẻ...</p>;

  return (
    <div>
      <h2>🔺 Nâng Cấp Thẻ</h2>

      <div
        className={`${styles.card} ${rarityColors[card.rarity] || styles.gray}`}
        style={{ margin: "0 auto", maxWidth: 300 }}
      >
        <div className={styles.cardImageWrapper}>
          <img
            src={card.cardImageUrl}
            alt={card.characterName}
            className={styles.cardImage}
          />
        </div>
        <div className={styles.cardText}>
          <div className={styles.cardName}>{card.characterName}</div>
          <div className={styles.cardRarity}>Độ hiếm: {card.rarity}</div>
          <div>Level: {card.level}</div>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>🔧 Chọn Thẻ Nguyên Liệu</h3>
      <div className={styles.cardGrid}>
        {materials.map((mat) => {
          const canUse = mat.level >= 5 && !mat.isMainCard;
          const isSelected = selectedMaterials.some(
            (s) => s.ownedCardId === mat.ownedCardId
          );

          return (
            <div
              key={mat.ownedCardId}
              className={`${styles.card} ${rarityColors[card.rarity]}`}
              style={{
                opacity: canUse ? 1 : 0.3,
                border: isSelected
                  ? "3px solid yellow"
                  : "2px solid transparent",
                cursor: canUse ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (!canUse) return;
                if (isSelected) {
                  setSelectedMaterials((prev) =>
                    prev.filter((s) => s.ownedCardId !== mat.ownedCardId)
                  );
                } else {
                  setSelectedMaterials((prev) => [...prev, mat]);
                }
              }}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={card.cardImageUrl}
                  className={styles.cardImage}
                  alt={card.characterName}
                />
              </div>
              <div className={styles.cardText}>
                <div>Level {mat.level}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={handleUpgrade}
          className={styles.rollButton}
          style={{ marginRight: 12 }}
        >
          🚀 Nâng Cấp
        </button>
        <button
          onClick={onExit}
          className={styles.rollButton}
          style={{ backgroundColor: "#6c757d" }}
        >
          ❌ Thoát
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: 6,
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default CardUpgradePortal;
