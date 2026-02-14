// 📁 src/components/Mutilplaygame/turn/applyTurnEffects.js
import { calculateMaxStamina } from "../abilityType/battleCalculator";

export function applyTurnEffects(cards, currentActorId) {
  return cards.map((card) => {
    if (card.ownedCardId !== currentActorId) return card;

    const oldStamina = card.stamina ?? 24;
    const maxStamina = calculateMaxStamina(card);
    let newStamina = oldStamina;
    const damageEvents = [];

    // ✅ Giảm cooldown
    const cooldowns = card.abilityCooldowns || {};
    const updatedCooldowns = {};
    for (const [key, turnsLeft] of Object.entries(cooldowns)) {
      const remaining = turnsLeft - 1;
      if (remaining > 0) {
        updatedCooldowns[key] = remaining;
      }
    }

    // ✅ Tính poison trước
    const updatedStatus = (card.statusEffects || [])
      .map((e) => {
        if (e.type === "poison") {
          const percent = e.poisonPercent ?? 15;
          const poisonDmg = (maxStamina * percent) / 100;
          const finalPoison = Math.min(poisonDmg, newStamina - 1); // tránh về 0

          if (finalPoison > 0) {
            newStamina -= finalPoison;
            damageEvents.push({ type: "poison", value: finalPoison });
          }
        }
        return { ...e, duration: e.duration - 1 };
      })
      .filter((e) => e.duration > 0);

    // ✅ Tính heal (regen)
    const regenEffect = (card.buffEffects || []).find(
      (b) => b.stat === "regen"
    );
    if (regenEffect && regenEffect.value > 0) {
      const healAmount = (maxStamina * regenEffect.value) / 100;
      const actualHeal = Math.min(healAmount, maxStamina - newStamina);
      if (actualHeal > 0) {
        newStamina += actualHeal;
        damageEvents.push({ type: "heal", value: actualHeal });
      }
    }

    // ✅ Giảm duration buff/debuff
    const updatedBuffs = (card.buffEffects || [])
      .map((e) => ({
        ...e,
        duration: e.duration - 1,
      }))
      .filter((e) => e.duration > 0);

    const updatedDebuffs = (card.debuffEffects || [])
      .map((e) => ({
        ...e,
        duration: e.duration - 1,
      }))
      .filter((e) => e.duration > 0);

    return {
      ...card,
      stamina: newStamina,
      abilityCooldowns: updatedCooldowns,
      statusEffects: updatedStatus,
      buffEffects: updatedBuffs,
      debuffEffects: updatedDebuffs,
      _prevStamina: oldStamina,
      _pendingDamageEvents: damageEvents, // ✅ THÊM DÒNG NÀY
    };
  });
}
