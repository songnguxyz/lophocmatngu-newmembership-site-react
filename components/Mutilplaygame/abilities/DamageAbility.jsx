// 📁 src/components/Mutilplaygame/abilities/DamageAbility.jsx
import { calculateDuelDamageWithLog,processBuffEffects,processDebuffEffects } from "../abilityType/battleCalculator";
import { getFlagFromCard } from "../abilityType/getFlagFromCard";

export function handleDamageAbility({
  ability,
  caster,
  target,
  roomData,
  role,
}) {
  const processedCaster = processDebuffEffects(processBuffEffects([caster]))[0];
  const processedTarget = processDebuffEffects(processBuffEffects([target]))[0];
  const {
    damage,
    log: detailLog,
    hitLogs,
    hitResults,
  } = calculateDuelDamageWithLog({
    attacker: processedCaster,
    defender: processedTarget,
    ability,
  });

  const abilityName = ability.meta?.name || "Kỹ năng Tấn công";
  const summary = `${caster.characterName} dùng ${abilityName} gây ${damage} sát thương lên ${target.characterName}.`;
  const finalStamina = Math.max((target.stamina || 0) - damage, 0);

  const updates = [
    {
      id: target.ownedCardId,
      changes: { stamina: finalStamina },
    },
  ];

  const triggers = [
    {
      name: "onTakeDamage",
      sourceId: target.ownedCardId,
      targetId: caster.ownedCardId,
    },
  ];

  let extraLog = "";
  let flagName = null;
  let newCasterFlags = [];
  let sideFlags = [];
  let updatedFlags = null;

  // 🏁 Nếu giết card nhân vật → drop flag theo tỉ lệ stats
  if (finalStamina <= 0) {
    flagName = getFlagFromCard(target);
    if (flagName) {
      newCasterFlags = [...(caster.flags || []), flagName];

      updates.push({
        id: caster.ownedCardId,
        changes: { flags: newCasterFlags },
      });

      sideFlags = [...(roomData.flags?.[role] || []), flagName];
      updatedFlags = {
        ...(roomData.flags || {}),
        [role]: sideFlags,
      };

      extraLog += `\n🏁 ${caster.characterName} đã giành được cờ ${flagName} từ ${target.characterName}!`;
    }
  }

  const damageEvents = (hitResults || []).map((hit) => ({
    targetId: target.ownedCardId,
    value: hit.value,
    type: hit.type,
  }));

  return {
    updates,
    updatedFlags, // 🔁 trả ra để update 1 lần ngoài
    log: `${summary}\n${detailLog}${extraLog}`,
    triggers,
    damage,
    damageEvents,
  };
}
