import React, { useState, useEffect } from "react";
import { AbilityIcons } from "../CardRenderer/AbilityIcons";
import { AbilityTooltipOverlay } from "./AbilityTooltipOverlay";

export function AbilityPanel({
  currentCard,
  selectedAbility,
  setSelectedAbility,
  setSelectedTargetId,
  setSelectedCardId,
  roomData,
  myCards,
  availableAbilitiesMap,
}) {
  if (!currentCard || !roomData) return null;

  const abilities = availableAbilitiesMap?.[currentCard.ownedCardId] || [];
  const isMyCard = myCards?.some(
    (c) => c.ownedCardId === currentCard.ownedCardId
  );
  const isCorrectTurn =
    currentCard.ownedCardId === roomData.currentActorId && isMyCard;

  const handleAbilitySelect = (ab) => {
    if (selectedAbility?.meta?.name === ab.meta?.name) {
      setSelectedAbility(null); // click lần 2 để ẩn
    } else {
      setSelectedAbility(ab); // chọn mới
    }
  };

  const passiveTriggersToMerge = ["afterNDuels", "onUseSpecificSkill"];
  const mergedPassiveMap = new Map();

  const hiddenPassiveKeys = new Set();

  // Tìm và gom passive đặc biệt
  (abilities || []).forEach((ab) => {
    if (ab.skillCategory !== "passive") return;

    const triggerType = ab.passive?.trigger?.type;
    if (!passiveTriggersToMerge.includes(triggerType)) return;

    let key = null;
    if (triggerType === "afterNDuels") key = "duel";
    if (triggerType === "onUseSpecificSkill")
      key = ab.passive?.trigger?.skillName;

    if (key) {
      if (!mergedPassiveMap.has(key)) mergedPassiveMap.set(key, []);
      mergedPassiveMap.get(key).push(ab);
      hiddenPassiveKeys.add(ab.meta?.name);
    }
  });

  const filteredAbilities = abilities.filter(
    (ab) => !hiddenPassiveKeys.has(ab.meta?.name)
  );

  return (
    <>
      {isCorrectTurn && (
        <div
          style={{
            alignItems: "flex-start",
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: 4,
            marginTop: 2,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Cụm icon kỹ năng */}
          <AbilityIcons
            card={currentCard}
            availableAbilities={filteredAbilities}
            selectedAbility={selectedAbility}
            selectedCardId={currentCard.ownedCardId}
            setSelectedCardId={setSelectedCardId}
            setSelectedAbility={handleAbilitySelect}
            setSelectedTargetId={setSelectedTargetId}
            roomData={roomData}
            isMine={true}
          />

          {/* Thông tin chi tiết kỹ năng */}
          {selectedAbility && (
            <div style={{ marginTop: 2 }}>
              <AbilityTooltipOverlay
                ability={selectedAbility}
                onClose={() => setSelectedAbility(null)}
                mergedPassives={mergedPassiveMap.get(
                  selectedAbility?.active?.type === "duel"
                    ? "duel"
                    : selectedAbility?.meta?.name
                )}
                hiddenPassiveKeys={hiddenPassiveKeys}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
