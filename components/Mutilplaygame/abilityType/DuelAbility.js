// 📁 src/components/Mutilplaygame/abilityType/DuelAbility.js
import { calculateDuelDamageWithLog,processBuffEffects,processDebuffEffects,calculateMaxStamina } from "./battleCalculator";
import { getFlagFromCard } from "./getFlagFromCard";

export function handleDuelAbility({
  ability,
  caster,
  target,
  roomData,
  updateRoom,
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
    attacker: processedCaster, // ✅ dùng bản đã apply buff
    defender: processedTarget,
    ability, // ✅ truyền toàn bộ object
  });

  const abilityName = ability.meta?.name || "Kỹ năng Duel";
  const summary = `${caster.characterName} dùng ${abilityName} gây ${damage} sát thương lên ${target.characterName}.`;
  const finalStamina = Math.max((target.stamina || 0) - damage, 0);
  const updatedTarget = {
    ...target,
    stamina: finalStamina,
  };
  const maxStamina = calculateMaxStamina(updatedTarget);

  const updates = [
    {
      id: caster.ownedCardId,
      changes: { duelCount: (caster.duelCount || 0) + 1 },
    },
    {
      id: target.ownedCardId,
      changes: {
        stamina: finalStamina,
        maxStamina, 
      },
    },
  ];

  const triggers = [
    {
      name: "afterNDuels",
      sourceId: caster.ownedCardId,
      targetId: target.ownedCardId,
    },
    {
      name: "onTakeDamage",
      sourceId: target.ownedCardId,
      targetId: caster.ownedCardId,
    },
  ];

  let extraLog = "";

  // ✅ Nếu hạ gục, thêm trigger onKillEnemy
  if (finalStamina <= 0) {
    triggers.push({
      name: "onKillEnemy",
      sourceId: caster.ownedCardId,
      targetId: target.ownedCardId,
    });
  }

  // ✅ Trigger onAllyDefeated CHỈ khi target bị hạ gục (máu về 0) và KHÔNG phải subject
  if (finalStamina <= 0) {
    const targetIsHost = roomData.hostCards.some(
      (c) => c.ownedCardId === target.ownedCardId
    );
    const targetSide = targetIsHost ? "host" : "guest";

    const alliesOfTarget = roomData[targetSide + "Cards"].filter(
      (c) => c.ownedCardId !== target.ownedCardId && (c.stamina ?? 1) > 0 // chỉ đồng minh còn sống mới kích hoạt passive
    );

    for (const ally of alliesOfTarget) {
      triggers.push({
        name: "onAllyDefeated",
        sourceId: ally.ownedCardId,
        targetId: target.ownedCardId,
      });
    }
  }

  // 🏁 Nếu giết card nhân vật → drop flag theo chỉ số
  if (finalStamina <= 0) {
    const flagName = getFlagFromCard(target);
    if (flagName) {
      const newCasterFlags = [...(caster.flags || []), flagName];

      updates.push({
        id: caster.ownedCardId,
        changes: { flags: newCasterFlags },
      });

      const sideFlags = [...(roomData.flags?.[role] || []), flagName];
      const updatedFlags = {
        ...(roomData.flags || {}),
        [role]: sideFlags,
      };

      updateRoom({ flags: updatedFlags });

      extraLog += `🏁 ${caster.characterName} đã giành được cờ ${flagName} từ ${target.characterName}!\n`;
    }
  }

  // ✅ Ghi lại từng đòn đánh (hitLogs đã có từ calculateDuelDamageWithLog)
  const damageEvents = (hitResults || []).map((hit) => ({
    targetId: target.ownedCardId,
    value: hit.value,
    type: hit.type,
  }));

  return {
    updates,
    log: `${summary}\n${detailLog}${extraLog ? "\n" + extraLog : ""}`,
    triggers,
    damage,
    damageEvents, // ✅ thêm dòng này
  };
}
