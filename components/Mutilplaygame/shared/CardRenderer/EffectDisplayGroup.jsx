import React from "react";
import StatusEffectDisplay from "../../abilities/StatusEffectDisplay";
import BuffEffectDisplay from "../../abilities/BuffEffectDisplay";
import DebuffEffectDisplay from "../../abilities/DebuffEffectDisplay";

export function EffectDisplayGroup({ card, roomData }) {
  const isActiveTurn = card?.ownedCardId === roomData?.currentActorId;

  // ✅ Tự xác định role (host hoặc guest)
  const role = roomData?.hostCards?.some(
    (c) => c.ownedCardId === card.ownedCardId
  )
    ? "host"
    : "guest";

  const composedSubjects = roomData?.obtainedSubjects?.[role] || [];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        maxWidth: "100%",
        rowGap: 2,
      }}
    >
      <StatusEffectDisplay effects={card.statusEffects || []} />
      <DebuffEffectDisplay debuffs={card.debuffEffects || []} />
      <BuffEffectDisplay
        buffs={card.buffEffects}
        composedSubjects={composedSubjects} // ✅ dùng luôn
        isActiveTurn={isActiveTurn}
      />
    </div>
  );
}
