// ✅ AbilityIcons.jsx - bỏ hover, chỉ xử lý click chọn kỹ năng
import React, { useEffect } from "react";
import { SUBJECT_RECIPES } from "../newSubjectFlag/Recipes";

const findSubjectIcon = (abilityName) => {
  const subject = SUBJECT_RECIPES.find((s) => s.passive?.name === abilityName);
  return subject?.icon || null;
};

export function AbilityIcons({
  card,
  availableAbilities,
  selectedAbility,
  selectedCardId,
  setSelectedCardId,
  setSelectedAbility,
  setSelectedTargetId,
  forceCooldown = false,
  roomData,
  isMine = true,
}) {
  const isStunned = card.statusEffects?.some((e) => e.type === "stun");
  const isSilenced = card.statusEffects?.some((e) => e.type === "silence");
  const abilityCooldowns = card.abilityCooldowns || {};

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>
        {`
          @keyframes pulseOpacity {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .glow-icon {
          width: 48px;
          height: 48px;
          position: relative;
          border-radius: 8px;
          background: #07182E;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .glow-icon::before {
          content: '';
          position: absolute;
          width: 30px;
          height: 130%;
background-image: linear-gradient(180deg, #10b981, #34d399);
          animation: rotateGlow 2.5s linear infinite;
        }

        .glow-icon::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 6px;
          background: #0f172a;
          z-index: 1;
        }

       @keyframes rotateGlow {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
       }
        `}
      </style>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap", // Cho phép xuống dòng
          justifyContent: "flex-start",
          gap: 4,
          maxWidth: 4 * 43 + 4 * 3, // 4 icon + khoảng cách
        }}
      >
        {availableAbilities.map((ab) => {
          const { meta = {}, active = {}, id, skillCategory } = ab;
          const { name, imageUrl } = meta;
          const type = active?.type;

          const isPassive = skillCategory === "passive";
          const silenced = isSilenced && !isPassive && type !== "duel";
          const stunned = isStunned;      
          const outOfAction = (card.actionCount ?? 0) <= 0;
          const remainingCD = abilityCooldowns[name] ?? 0;
          const shouldDimPassive = isPassive && isSilenced;

          const disabled =
            !isMine ||
            isPassive ||
            stunned ||
            silenced ||
            remainingCD > 0 ||
            outOfAction ||
            forceCooldown;

          const isSelected =
            selectedCardId === card.ownedCardId &&
            selectedAbility?.meta?.name === ab.meta?.name;

          const baseSize = isSelected ? 43 : 36;
          const borderWidth = isSelected ? 3 : 2;

          // Nếu passive thì cộng thêm viền đã bỏ (để icon không bị nhỏ hơn)
          const iconSize = isPassive ? baseSize + borderWidth * 2 : baseSize;

          let borderColor = "#888";
          if (isPassive) borderColor = "transparent";
          else if (isSelected) borderColor = "green";
          else if (silenced) borderColor = "red";

          return (
            <div
              key={id}
              onClick={(e) => {
                e.stopPropagation();
                if (isPassive) {
                  setSelectedCardId(card.ownedCardId);
                  setSelectedAbility(ab);
                  setSelectedTargetId(null);
                } else if (!disabled) {
                  setSelectedCardId(card.ownedCardId);
                  setSelectedAbility(ab);
                  setSelectedTargetId(null);
                }
              }}
            >
              {isPassive ? (
                <div
                  className="glow-icon"
                  style={{
                    width: iconSize,
                    height: iconSize,
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Lớp glow chạy quanh */}
                  <div
                    style={{
                      position: "absolute",
                      width: iconSize,
                      height: iconSize,
                      borderRadius: 6,

                      zIndex: 1,
                    }}
                  />
                  {/* Icon passive thu nhỏ và nằm trên glow */}
                  <img
                    src={findSubjectIcon(name) || imageUrl}
                    alt={name}
                    style={{
                      width: iconSize * 0.9, // thu nhỏ để viền sáng lộ ra
                      height: iconSize * 0.9,
                      objectFit: "cover",
                      background: "#07182E",
                      borderRadius: 6,
                      position: "relative",
                      zIndex: 2,
                      filter: shouldDimPassive ? "grayscale(100%)" : "none",
                      opacity: shouldDimPassive ? 0.3 : 1,
                      animation: isPassive
                        ? "pulseOpacity 2s ease-in-out infinite"
                        : "none",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: iconSize,
                    height: iconSize,
                    transition: "all 0.2s ease",
                    border: `${borderWidth}px solid ${borderColor}`,
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    cursor: disabled ? "not-allowed" : "pointer",
                    backgroundColor: "#fff",
                    zIndex: 1,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: disabled ? "grayscale(100%)" : "none",
                      opacity: disabled ? 0.3 : 1,
                    }}
                  />

                  {remainingCD > 0 && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          zIndex: 1,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "bold",
                            textShadow: `
                              -1px -1px 0 #000,
                               1px -1px 0 #000,
                              -1px  1px 0 #000,
                               1px  1px 0 #000
                            `,
                          }}
                        >
                          {remainingCD}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
