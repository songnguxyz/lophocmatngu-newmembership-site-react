import React from "react";

export default function ForcedActionPanel({
  currentCard,
  onSkip,
  myCards,
  roomData,
  availableAbilitiesMap,
}) {
  if (!currentCard || !roomData || !myCards) return null;

  const isMyTurn = currentCard.ownedCardId === roomData.currentActorId;
  const isMine = myCards.some((c) => c.ownedCardId === currentCard.ownedCardId);
  if (!isMyTurn || !isMine) return null;

  const isStunned = currentCard.statusEffects?.some((e) => e.type === "stun");
  const isSilenced = currentCard.statusEffects?.some(
    (e) => e.type === "silence"
  );
  const isDead = currentCard.stamina <= 0;

  const characterId = currentCard.characterId;
  const abilities = availableAbilitiesMap?.[characterId] || [];

  const hasDuelSkill = abilities.some(
    (ab) => ab.skillCategory === "active" && ab.active?.type === "duel"
  );

  const isBlocked = isDead || isStunned || (isSilenced && !hasDuelSkill);
  const hasAnyStatus =
    isDead || isStunned || isSilenced || currentCard.statusEffects?.length > 0;

  if (!hasAnyStatus) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 10,
        background: "#fef3c7",
        border: "1px solid #facc15",
        borderRadius: 6,
      }}
    >
      <p>
        ⚠️ {currentCard.characterName} đang
        {isDead
          ? " bị hạ gục"
          : isStunned
          ? " bị Stun"
          : isSilenced
          ? " bị Câm lặng (Silence)"
          : " chịu hiệu ứng bất lợi"}
        !
      </p>

      {(isDead || isStunned) && (
        <button
          onClick={onSkip}
          style={{
            marginTop: 8,
            backgroundColor: "#f87171",
            color: "#fff",
            border: "1px solid #dc2626",
            borderRadius: 4,
            padding: "6px 10px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          👉 Qua lượt
        </button>
      )}
    </div>
  );
}
