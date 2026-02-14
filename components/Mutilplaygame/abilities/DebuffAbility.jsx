import {
  getStatWithBuff,
  processBuffEffects,
} from "../abilityType/battleCalculator";

export async function handleDebuffAbility({
  ability,
  myCard,
  targetCard,
  roomData,
  role,
  opponentRole,
}) {
  if (!targetCard || !targetCard.ownedCardId) {
    return { updatedCards: [], updatedMyCards: [], log: "" };
  }

  const {
    stat = "stamina",
    value = 0,
    duration = 2,
    area = "oneEnemy",
    cooldown = 0,
    status,
  } = ability.active || {};

  const skillName = ability.meta?.name ?? "unknown";
  let targetLogValue = value;
  let targetTotalDuration = duration;

  // 📌 Nếu là status effect (ví dụ silence, stun, poison)
  if (status) {
    // 🛡️ Kháng hiệu ứng trạng thái
    const allBuffedTargets = processBuffEffects(
      roomData[opponentRole + "Cards"],
      ""
    );
    const buffedTarget = allBuffedTargets.find(
      (c) => c.ownedCardId === targetCard.ownedCardId
    );

    const resistant = getStatWithBuff(buffedTarget, "resistant") || 0;
    const baseChance = 100;
    const chanceAfterResist = Math.max(0, baseChance - resistant);
    const roll = Math.random() * 100;

    if (roll > chanceAfterResist) {
      console.log(
        `[🎯 RESIST CHECK] ${
          targetCard.characterName
        } resistant=${resistant}, chance=${chanceAfterResist.toFixed(
          1
        )}%, roll=${roll.toFixed(1)}`
      );

      const updatedMyCards = roomData[role + "Cards"].map((card) =>
        card.ownedCardId === myCard.ownedCardId
          ? {
              ...card,
              abilityCooldowns: {
                ...(card.abilityCooldowns || {}),
                [skillName]: cooldown,
              },
            }
          : card
      );

      const log = `${targetCard.characterName} đã kháng hiệu ứng ${status} từ ${myCard.characterName}`;

      return {
        updatedCards: roomData[opponentRole + "Cards"],
        updatedMyCards,
        log,
      };
    }

    const updatedTargetCards = roomData[opponentRole + "Cards"].map((card) => {
      const isTarget = card.ownedCardId === targetCard.ownedCardId;
      if (!isTarget) return card;

      const newStatus = {
        type: status,
        duration,
        ...(status === "poison" && {
          poisonPercent: ability.active?.poisonPercent ?? 15,
        }),
      };

      // ✅ THÊM đoạn này: nếu slow có specialEffect → thêm debuff actionGauge
      const newDebuffEffects =
        status === "slow"
          ? [
              ...(card.debuffEffects || []).filter(
                (b) => b.stat !== "actionGauge"
              ),
              {
                stat: "actionGauge",
                value: Math.abs(ability.active?.actionGauge ?? -10),
                duration,
              },
            ]
          : card.debuffEffects;

      return {
        ...card,
        statusEffects: [
          ...(card.statusEffects || []).filter((e) => e.type !== status),
          newStatus,
        ],
        debuffEffects: newDebuffEffects,
      };
    });

    const updatedMyCards = roomData[role + "Cards"].map((card) =>
      card.ownedCardId === myCard.ownedCardId
        ? {
            ...card,
            abilityCooldowns: {
              ...(card.abilityCooldowns || {}),
              [skillName]: cooldown,
            },
          }
        : card
    );

    const log = `${myCard.characterName} gây hiệu ứng ${status} (${duration} lượt) cho ${targetCard.characterName}`;

    return {
      updatedCards: updatedTargetCards,
      updatedMyCards,
      log,
    };
  }

  // 📌 Nếu là debuff chỉ số
  const updatedCards = roomData[opponentRole + "Cards"].map((card) => {
    const isTarget =
      area === "allEnemies" || area === "randomEnemy"
        ? true
        : card.ownedCardId === targetCard.ownedCardId;

    if (!isTarget) return card;

    const existing = (card.debuffEffects || []).find((b) => b.stat === stat);
    const remaining = (card.debuffEffects || []).filter((b) => b.stat !== stat);

    const mergedEffect = existing
      ? {
          stat,
          value: existing.value + value,
          duration: Math.max(existing.duration, duration),
        }
      : {
          stat,
          value,
          duration,
        };

    if (card.ownedCardId === targetCard.ownedCardId) {
      targetLogValue = mergedEffect.value;
      targetTotalDuration = mergedEffect.duration;
    }

    return {
      ...card,
      debuffEffects: [...remaining, mergedEffect],
    };
  });

  const updatedMyCards = roomData[role + "Cards"].map((card) =>
    card.ownedCardId === myCard.ownedCardId
      ? {
          ...card,
          abilityCooldowns: {
            ...(card.abilityCooldowns || {}),
            [skillName]: cooldown,
          },
        }
      : card
  );

  const log = `${myCard.characterName} làm giảm ${targetLogValue} ${stat} của ${targetCard.characterName} (${targetTotalDuration} lượt)`;

  return {
    updatedCards,
    updatedMyCards,
    log,
  };
}
