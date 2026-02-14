// passiveEffects/debuffAttacker.js

export default function debuffAttackerHandler({
  ability,
  sourceCard,
  targetCard,
  roomData,
  updateCard,
  applyLog,
}) {
  // Debuff attacker = targetCard
  if (!targetCard || !targetCard.ownedCardId) return;

  const stat = ability.stat || "stamina";
  const value = parseInt(ability.passiveEffectValue || "1");
  const duration = parseInt(ability.passiveEffectDuration || "2");

  const existing = (targetCard.debuffEffects || []).find(
    (b) => b.stat === stat
  );
  const others = (targetCard.debuffEffects || []).filter(
    (b) => b.stat !== stat
  );

  const mergedEffect = existing
    ? {
        stat,
        value: existing.value + value,
        duration: Math.max(existing.duration, duration),
      }
    : { stat, value, duration };

  updateCard(targetCard.ownedCardId, {
    debuffEffects: [...others, mergedEffect],
  });

  applyLog(
    `${sourceCard.characterName} kích hoạt '${ability.name}' và gây debuff ${stat} (-${value}) lên ${targetCard.characterName} (${duration} lượt)`
  );
}
