import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SparkleCanvas from "./SparkleCanvas"; // ✨ import canvas
import styles from "./Gacha.module.css";

const cardEnter = {
  hidden: { opacity: 0, scale: 0.1 },
  visible: {
    opacity: 1,
    scale: 1.1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    scale: 1.3,
    transition: { duration: 0.3 },
  },
};

const cardEnterPurple = {
  hidden: { opacity: 0, scale: 0.2 },
  visible: {
    opacity: 1,
    scale: 1.1,
    transition: { duration: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 1.5,
    transition: { duration: 0.5 },
  },
};

const SectionResult = ({ cards, onRetry,setPhase }) => {
  const [step, setStep] = useState(0);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (step >= cards.length) {
      const delay = setTimeout(() => setShowGrid(true), 500);
      return () => clearTimeout(delay);
    }

    const currentCard = cards[step];
    const img = new Image();
    img.src = currentCard.cardImageUrl;

    img.onload = () => {
      const delay = currentCard.rarity === "purple" ? 1400 : 600;
      setTimeout(() => setStep((s) => s + 1), delay);
    };

    img.onerror = () => {
      setTimeout(() => setStep((s) => s + 1), 300);
    };
  }, [step, cards]);

  const currentCard = cards[step];
  const isPurple = currentCard?.rarity === "purple";

  return (
    <div className={styles.sectionCenter}>
      {!showGrid && currentCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.cardTemplateId || step}
            className={`${styles.card} ${styles[currentCard.rarity]} ${
              isPurple ? styles.purpleGlow : ""
            }`}
            variants={isPurple ? cardEnterPurple : cardEnter}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              maxWidth: 300,
              margin: "0 auto",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isPurple && (
              <>
                <div className={styles.flashBurst}></div>
                <SparkleCanvas />
              </>
            )}

            <div className={styles.cardImageWrapper}>
              <img
                src={currentCard.cardImageUrl}
                className={styles.cardImage}
                alt={currentCard.characterName}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className={styles.cardText}>
              <div className={styles.cardName}>{currentCard.characterName}</div>
              <div className={styles.cardRarity}>
                Độ hiếm: {currentCard.rarity}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {showGrid && (
        <>
          <div className={styles.cardGrid}>
            {cards.map((card, i) => (
              <div
                key={i}
                className={`${styles.card} ${styles[card.rarity]} ${
                  card.rarity === "purple" ? styles.purpleGlow : ""
                }`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  maxWidth: 300,
                }}
              >
                {card.rarity === "purple" && (
                  <>
                    <div className={styles.flashBurst}></div>
                    <SparkleCanvas />
                  </>
                )}

                <div className={styles.cardImageWrapper}>
                  <img
                    src={card.cardImageUrl}
                    className={styles.cardImage}
                    alt={card.characterName}
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className={styles.cardText}>
                  <div className={styles.cardName}>{card.characterName}</div>
                  <div className={styles.cardRarity}>
                    Độ hiếm: {card.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.resultButtons}>
            <button onClick={onRetry}>🔁 Quay Tiếp</button>
            <button onClick={() => setPhase("mycard")}>🧾 Tới Kho Thẻ</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SectionResult;
