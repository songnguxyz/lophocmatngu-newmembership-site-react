import { calculateMaxStamina } from "../abilityType/battleCalculator";

export async function handleBuffAbility({
  ability,
  myCard,
  targetCard,
  roomData,
  role,
}) {
  if (!targetCard || !targetCard.ownedCardId) {
    return { updatedCards: [], log: "" };
  }

  const {
    area,
    value,
    duration,
    stat,
    specialEffect,
    cooldown = 0,
  } = ability.active || {};
  const skillName = ability.meta?.name || "Buff";

  // ✅ HEAL theo phần trăm
  if (specialEffect === "heal") {
    const maxStamina = calculateMaxStamina(targetCard);
    const oldStamina = targetCard.stamina ?? maxStamina;
    const percent = ability.active?.healPercent ?? 0;
    const healed = Math.floor((maxStamina * percent) / 100);
    const newStamina = Math.min(oldStamina + healed, maxStamina);

    const updatedCards = roomData[role + "Cards"].map((card) => {
      const isTarget = card.ownedCardId === targetCard.ownedCardId;
      const isCaster = card.ownedCardId === myCard.ownedCardId;
      return {
        ...card,
        ...(isTarget ? { stamina: newStamina } : {}),
        ...(isCaster && {
          abilityCooldowns: {
            ...(card.abilityCooldowns || {}),
            [skillName]: cooldown,
          },
        }),
      };
    });

    return {
      updatedCards,
      log: `${myCard.characterName} hồi ${percent}% (${healed}) thể lực cho ${targetCard.characterName}`,
      damageEvents: [
        { targetId: targetCard.ownedCardId, value: healed, type: "heal" },
      ],
    };
  }

  // ✅ CLEANSE
  if (specialEffect === "cleanse") {
    const targetIds =
      area === "allAllies"
        ? roomData[role + "Cards"].map((c) => c.ownedCardId)
        : [targetCard.ownedCardId];

    const updatedCards = roomData[role + "Cards"].map((card) => {
      const isTarget = targetIds.includes(card.ownedCardId);
      const isCaster = card.ownedCardId === myCard.ownedCardId;

      return {
        ...card,
        statusEffects: isTarget
          ? (card.statusEffects || []).filter(
              (e) =>
                !["stun", "poison", "silence", "slow", "blind"].includes(e.type)
            )
          : card.statusEffects,
        debuffEffects: isTarget ? [] : card.debuffEffects,
        ...(isCaster && {
          abilityCooldowns: {
            ...(card.abilityCooldowns || {}),
            [skillName]: cooldown,
          },
        }),
      };
    });

    return {
      updatedCards,
      log:
        area === "allAllies"
          ? `${myCard.characterName} đã thanh tẩy toàn bộ debuff cho đồng minh`
          : `${myCard.characterName} thanh tẩy debuff cho ${targetCard.characterName}`,
    };
  }

  // ✅ BUFF STAT thường (dựa vào `stat`)
  if (stat && !specialEffect) {
    const buffValue = value ?? 1;
    const buffDuration = duration || 2;

    const updatedCards = roomData[role + "Cards"].map((card) => {
      const isTarget =
        area === "allAllies" || area === "randomAlly"
          ? true
          : card.ownedCardId === targetCard.ownedCardId;
      const isCaster = card.ownedCardId === myCard.ownedCardId;

      const existingBuffs = card.buffEffects || [];
      const filtered = existingBuffs.filter((b) => b.stat !== stat);

      return {
        ...card,
        ...(isTarget && {
          buffEffects: [
            ...filtered,
            { stat, value: buffValue, duration: buffDuration },
          ],
        }),
        ...(isCaster && {
          abilityCooldowns: {
            ...(card.abilityCooldowns || {}),
            [skillName]: cooldown,
          },
        }),
      };
    });

    return {
      updatedCards,
      log: `${myCard.characterName} tăng ${buffValue} ${stat} cho ${targetCard.characterName}`,
    };
  }

  // ✅ BUFF SPECIAL EFFECT
  const specialStatMap = {
    extraAction: { stat: "extraAction", key: "extraActionCount" },
    bonusHits: { stat: "bonusHits", key: "bonusHits" },
    regen: { stat: "regen", key: "regenPercent" },
    critRate: { stat: "critRate", key: "critRateBonus" },
    critDamage: { stat: "critDamage", key: "critDamageBonus" },
    resistant: { stat: "resistant", key: "resistant" },
    actionGauge: { stat: "actionGauge", key: "actionGauge" },
  };

  const specialEffectConfig = specialStatMap[specialEffect];
  if (specialEffectConfig) {
    const { stat: effectKey, key: valueKey } = specialEffectConfig;
    const buffValue = ability.active?.[valueKey] ?? 1;
    const buffDuration = duration || 2;

    const updatedCards = roomData[role + "Cards"].map((card) => {
      const isTarget =
        area === "allAllies" || area === "randomAlly"
          ? true
          : card.ownedCardId === targetCard.ownedCardId;
      const isCaster = card.ownedCardId === myCard.ownedCardId;

      const existingBuffs = card.buffEffects || [];
      const filtered = existingBuffs.filter((b) => b.stat !== effectKey);

      const updated = {
        ...card,
        ...(isTarget && {
          buffEffects: [
            ...filtered,
            { stat: effectKey, value: buffValue, duration: buffDuration },
          ],
        }),
        ...(isCaster && {
          abilityCooldowns: {
            ...(card.abilityCooldowns || {}),
            [skillName]: cooldown,
          },
        }),
      };

      if (isTarget && effectKey === "extraAction") {
        updated.bonusActionCount = (card.bonusActionCount ?? 0) + buffValue;
      }
      return updated;
    });

    return {
      updatedCards,
      log: `${myCard.characterName} dùng ${skillName} (${effectKey} +${buffValue}) lên ${targetCard.characterName}`,
    };
  }

  return { updatedCards: [], log: `${skillName} không có hiệu lực.` };
}
