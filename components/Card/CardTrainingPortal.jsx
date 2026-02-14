// CardTrainingPortal.jsx
import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./Gacha.module.css";
import SparkleCanvas from "./SparkleCanvas"; // ✨ import canvas

const EXP_PER_LEVEL = 20;
const DAILY_LIMIT = 9;

const rarityColors = {
  gray: styles.gray,
  green: styles.green,
  purple: styles.purple,
};

const CardTrainingPortal = ({ initialCard, reloadCards, onExit }) => {
  const [card, setCard] = useState(initialCard);
  const [character, setCharacter] = useState(null);
  const [trainAreas, setTrainAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [bonusDetails, setBonusDetails] = useState([]);
  const [levelUp, setLevelUp] = useState(false);
  const [animatingExp, setAnimatingExp] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const characterSnap = await getDoc(
        doc(db, "characters", card.characterId)
      );
      if (characterSnap.exists()) {
        setCharacter(characterSnap.data());
      }
      const areaSnap = await getDocs(collection(db, "trainAreas"));
      const areas = areaSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrainAreas(areas);
    };
    fetchInitialData();
  }, [card]);

  const reloadSingleCard = async (cardId) => {
    const docSnap = await getDoc(doc(db, "ownedCards", cardId));
    if (!docSnap.exists()) return;

    const ownedData = docSnap.data();
    const templateSnap = await getDoc(
      doc(db, "cards", ownedData.cardTemplateId)
    );
    if (!templateSnap.exists()) return;

    const cardData = templateSnap.data();
    const fullCard = {
      ...cardData,
      ...ownedData,
      ownedCardId: docSnap.id,
    };
    setCard(fullCard);
    return fullCard;
  };

  const animateExpBar = (targetExp) => {
    let current = 0;
    const step = () => {
      if (current < targetExp) {
        current += 4;
        if (current > targetExp) current = targetExp;
        setAnimatingExp(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const handleTraining = async () => {
    if (!character || !selectedArea) return;
    const area = selectedArea;
    const todayStr = new Date().toISOString().split("T")[0];
    const trainCount = card.trainHistory?.[todayStr] || 0;

    if (trainCount >= DAILY_LIMIT) {
      setStatusMessage(`⚠️ Đã luyện ${DAILY_LIMIT} lần hôm nay.`);
      return;
    }

    const {
      baseExp,
      statThreshold,
      bonusPerStat,
      subjectThreshold,
      subjectBonusMultiplier,
      priorityStats,
      subject,
      name: areaName,
    } = area;

    const stats = character.stats || {};
    const subjectStats = character.subjectStats || {};

    let totalExpBonus = 0;
    let subjectBonus = 0;
    const bonusReasons = [];

    // ✅ Bonus từ các stat ưu tiên (tối giản)
    for (let stat of priorityStats) {
      const statValue = stats[stat] || 0;
      if (statValue > statThreshold) {
        const surplus = statValue - statThreshold;
        const statBonus = surplus * bonusPerStat;
        totalExpBonus += statBonus;
        bonusReasons.push(
          `${stat}: +${statBonus.toFixed(1)} EXP (${surplus} x ${bonusPerStat})`
        );
      }
    }

    // ✅ Bonus từ môn học yêu thích (tối giản)
    const subjectValue = subjectStats[subject] || 0;
    if (subjectValue > subjectThreshold) {
      const surplus = subjectValue - subjectThreshold;
      subjectBonus = surplus * subjectBonusMultiplier;
      bonusReasons.push(
        `Môn ${subject}: +${subjectBonus.toFixed(
          1
        )} EXP (${surplus} x ${subjectBonusMultiplier})`
      );
    }


    // ✅ Tổng EXP và làm tròn để lưu vào DB
    const rawExp = baseExp + totalExpBonus + subjectBonus;
    const gainedExp = Math.round(rawExp);
    let newExp = card.exp + gainedExp;
    let newLevel = card.level;
    let leveledUp = false;

    while (newExp >= EXP_PER_LEVEL) {
      newExp -= EXP_PER_LEVEL;
      newLevel++;
      leveledUp = true;
    }

    try {
      const todayKey = `trainHistory.${todayStr}`;
      await updateDoc(doc(db, "ownedCards", card.ownedCardId), {
        exp: newExp,
        level: newLevel,
        [todayKey]: increment(1),
        updatedAt: serverTimestamp(),
      });

      const updatedCard = await reloadSingleCard(card.ownedCardId);
      if (reloadCards) await reloadCards();

      setStatusMessage(
        `🎉 ${updatedCard.characterName} nhận ${rawExp.toFixed(
          1
        )} EXP (làm tròn: ${gainedExp}) tại '${areaName}'\nLevel mới: ${newLevel}, EXP còn lại: ${newExp}`
      );
  
      setBonusDetails(bonusReasons);
      setLevelUp(leveledUp);
      animateExpBar(updatedCard.exp);
      setConfirming(false);

      window.dispatchEvent(
        new CustomEvent("card-updated", { detail: updatedCard })
      );
    } catch (err) {
      console.error("❌ Lỗi khi update:", err);
      setStatusMessage("❌ Không thể cập nhật EXP.");
    }
  };
  
  

  const currentLevel = card.level || 1;
  const exp = card.exp || 0;
  const expPercent = ((exp % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100;

  return (
    <div>
      <h2>🏋️‍♂️ Huấn Luyện Thẻ</h2>

      <div
        className={`${styles.card} ${
          rarityColors[card.rarity] || styles.gray
        } ${card.rarity === "purple" ? styles.purpleGlow : ""}`}
        style={{ margin: "0 auto", maxWidth: 300 }}
      >
        {" "}
        {card.rarity === "purple" && (
          <>
            <div className={styles.flashBurst}></div>
            <SparkleCanvas />
          </>
        )}
        <div className={styles.cardImageWrapper}>
          <img
            src={card.cardImageUrl}
            alt={card.characterName}
            className={styles.cardImage}
            loading="eager"
            decoding="async"
          />
        </div>
        <div className={styles.cardText}>
          <div className={styles.cardName}>{card.characterName}</div>
          <div className={styles.cardRarity}>Độ hiếm: {card.rarity}</div>
          <div style={{ fontSize: 13, fontWeight: "bold", marginTop: 4 }}>
            Level {currentLevel} || Exp: {exp}
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
                width: `${
                  animatingExp !== null
                    ? (animatingExp / EXP_PER_LEVEL) * 100
                    : expPercent
                }%`,
                backgroundColor: "#4caf50",
                height: "100%",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Chọn khu vực huấn luyện</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {trainAreas.map((area) => (
            <button
              className={styles.trainButton}
              key={area.id}
              onClick={() => {
                setSelectedArea(area);
                setConfirming(true);
              }}
            >
              <strong>{area.name}</strong>
              <br />({area.subject})
              <br />
              EXP: {area.baseExp}
            </button>
          ))}
        </div>
      </div>

      {confirming && selectedArea && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p>
            <strong>Bạn có chắc chắn muốn tham gia hoạt động ở khu vực:</strong>{" "}
            {selectedArea.name}?
          </p>
          <button
            onClick={handleTraining}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginRight: 12,
            }}
          >
            ✅ Tham gia hoạt động
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ❌ Hủy
          </button>
        </div>
      )}

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
          <pre style={{ whiteSpace: "pre-line", margin: 0 }}>
            {statusMessage}
          </pre>
          {bonusDetails.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {bonusDetails.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          )}
          {levelUp && (
            <div style={{ color: "orange", marginTop: 6 }}>🆙 Level Up!</div>
          )}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button
          onClick={onExit}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ❌ Thoát Huấn Luyện
        </button>
      </div>
    </div>
  );
};

export default CardTrainingPortal;
