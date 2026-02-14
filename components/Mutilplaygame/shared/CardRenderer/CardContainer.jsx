// ✅ CardContainer.jsx - cập nhật tam giác định hướng + floating damage
import React, { memo } from "react";
import { getTriangleColorByAccuracyCrit } from "./getTriangleColorByAccuracyCrit";

const rarityColors = {
  gray: "#9e9e9e",
  green: "#4caf50",
  purple: "#9c27b0",
  gold: "#ff9800",
  red: "#f44336",
};

const triangleStyleBase = {
  width: 0,
  height: 0,
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderTop: "8px solid transparent",
  position: "absolute",
  top: -6,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2,
};


const CardContainer = ({
  card,
  isSelected,
  isTarget,
  selectedAbility,
  selectedCard,
  handleCardClick,
  isMine,
  role,
  children,
  roomData,
  myDamageList = [],
}) => {
  const isDead = card.stamina <= 0;
  const isStunned = card.statusEffects?.some((e) => e.type === "stun");
  const isCurrentTurn = card.ownedCardId === roomData?.currentActorId;
  const isOpponent = !isMine;

  const isMyTurn = (() => {
    if (!roomData || !roomData.currentActorId || !role) return false;
    const myCards = roomData[role + "Cards"] || [];
    return myCards.some((c) => c?.ownedCardId === roomData.currentActorId);
  })();

  let showTriangle = false;
  let triangleColor = "#f9a8d4";

  if (roomData && isMyTurn && selectedAbility?.active?.area) {
    const area = selectedAbility.active.area;

    if (area === "self" && card.ownedCardId === selectedCard?.ownedCardId) {
      showTriangle = true;
      triangleColor = "#3b82f6";
    }

    if (
      ["oneAlly", "allAllies", "randomAlly"].includes(area) &&
      isMine &&
      card.stamina > 0
    ) {
      showTriangle = true;
      triangleColor = "#3b82f6";
    }

    if (
      ["oneEnemy", "allEnemies", "randomEnemy"].includes(area) &&
      isOpponent &&
      card.stamina > 0
    ) {
      showTriangle = true;
      try {
        triangleColor = getTriangleColorByAccuracyCrit(selectedCard, card);
      } catch {}
    }
  }

  let borderColor = "1px solid #ccc";
  if (!isMine) borderColor = "2px solid #f97316";
  else if (isCurrentTurn) borderColor = "4px solid #22c55e";
  else if (isSelected) borderColor = "3px solid blue";
  else borderColor = "1px solid #999";

  const backgroundColor = isDead
    ? "#eee"
    : isStunned
    ? "#ffe4e6"
    : isMine
    ? isCurrentTurn
      ? "#ffffff"
      : "#f3f4f6"
    : isCurrentTurn
    ? "#ffffff"
    : "#fefce8";

  return (
    <>
      <style>{`
        @keyframes shakeOnly {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }

          @keyframes trianglePulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.25);
  }
}

      `}</style>

      <div
        onClick={() => handleCardClick(card, isMine)}
        style={{
          border: borderColor,
          backgroundColor,
          opacity: isDead ? 0.4 : 1,
          padding: 4,
          cursor: isDead ? "not-allowed" : "pointer",
          width: "clamp(75px, calc((100% - 20px)/6), 135px)",
          height: "175px",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          boxShadow: (() => {
            if (isDead) return "none";
            if (isCurrentTurn && isMine)
              return `0 0 6px ${rarityColors[card.rarity]}`;
            if (isOpponent && isCurrentTurn)
              return "0 0 6px rgba(239, 68, 68, 0.6)";
            return "none";
          })(),
          animation: (() => {
            if (isCurrentTurn && isMine) return "pulse-green 2s infinite";
            if (isOpponent && isCurrentTurn) return "pulse-red 2s infinite";
            return "none";
          })(),
          transform: isSelected || isCurrentTurn ? "scale(1.1)" : "scale(1)",
          zIndex: isSelected || isCurrentTurn ? 5 : 1,
          transition: "transform 0.2s ease",
        }}
      >
        {/* 🔺 Tam giác định hướng */}
        {showTriangle && (
          <div
            style={{
              ...triangleStyleBase,
              borderTopColor: triangleColor,
              animation: "trianglePulse 1s ease-in-out infinite",
              filter: "drop-shadow(0 0 1px white)",
            }}
          />
        )}

        {/* Floating Damage */}
        {myDamageList.map((myDamage, i) => {
          const isCrit = myDamage.type === "crit";
          const isHeal = myDamage.type === "heal";
          const isMiss = myDamage.type === "miss";
          const isPoison = myDamage.type === "poison";

          return (
            <div
              key={myDamage.displayId}
              style={{
                position: "absolute",
                top: `${20 + i * 20}px`, // 👈 lệch từng hit theo i
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <div style={{ animation: "shakeOnly 0.3s ease-out" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: isCrit ? 30 : 24,
                    fontWeight: "bold",
                    color: isHeal
                      ? "limegreen"
                      : isCrit
                      ? "#38bdf8"
                      : isPoison
                      ? "violet"
                      : isMiss
                      ? "#aaa"
                      : "white",
                    textShadow: `
                      2px 2px 3px black,
                      -1px -1px 2px black,
                      1px -1px 2px black,
                      -1px 1px 2px black,
                      1px 1px 2px black
                    `,
                    animation: "floatUp 1.5s ease-out",
                    transform: `translateY(${-i * 20}px)`,
                  }}
                >
                  {isMiss ? (
                    "Trượt"
                  ) : (
                    <>
                      {isPoison && <span style={{ marginRight: 4 }}>☠️</span>}
                      {isCrit && <span style={{ marginRight: 4 }}>💥</span>}
                      {myDamage.value > 0 ? "+" : ""}
                      {Math.abs(myDamage.value).toFixed(2)}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Avatar */}
        <img
          src={card.avatarUrl || card.cardImageUrl}
          alt={card.characterName}
          style={{ width: "100%", borderRadius: 6 }}
        />

        {/* Countdown hồi sinh */}
        {card.respawnCounter > 0 && (
          <div style={{ fontSize: 11, color: "gray", textAlign: "center" }}>
            ⏳ Hồi sinh sau {card.respawnCounter} lượt
          </div>
        )}

        {children}
      </div>
    </>
  );
};

export const CardContainerMemo = memo(CardContainer);
export { CardContainerMemo as CardContainer };
