// abilityType/battleCalculator.js
import { SUBJECT_RECIPES } from "../shared/newSubjectFlag/Recipes";

export function getItemBonus(card, statKey) {
  if (!card.equippedItems) return 0;

  let bonus = 0;
  for (const slot in card.equippedItems) {
    const item = card.equippedItems[slot];

    if (item?.statBonus && item?.status !== "disable") {
      if (item.statBonus[statKey]) {
        bonus += item.statBonus[statKey];
      }
    }
  }
  return bonus;
}

export function getStatWithBuff(card, key) {
  const base = card.stats?.[key] || 0;
  const buff = card.buffs?.[key] || 0;
  const debuff = card.debuffs?.[key] || 0;
  
  const itemBonus = getItemBonus(card, key);

  return base + itemBonus + buff - debuff;
}

/**
 * Tính stamina tối đa dựa theo sức mạnh.
 */
export function calculateMaxStamina(card) {
  const strength = getStatWithBuff(card, "Sức mạnh");
  const itemBonus = getStatWithBuff(card, "MaxStamina"); // ✅ cộng thêm từ item
return 35 + strength * 2 + itemBonus;
}

/**
 * Xử lý debuff mỗi lượt.
 */
export function processDebuffEffects(cards, currentActorId) {
  return cards.map((card) => {
    const debuffMap = {};
    const mergedDebuffs = {};

    for (const debuff of card.debuffEffects || []) {
      const isInfinite = debuff.duration === 9999;
      let nextDuration = debuff.duration;

      if (!isInfinite && card.ownedCardId === currentActorId) {
        nextDuration -= 1;
      }

      if (nextDuration >= 1 || isInfinite) {
        const key = debuff.stat;

        if (!mergedDebuffs[key]) {
          mergedDebuffs[key] = {
            stat: key,
            value: debuff.value,
            duration: nextDuration,
          };
        } else {
          mergedDebuffs[key].value += debuff.value;
          mergedDebuffs[key].duration = Math.min(
            mergedDebuffs[key].duration,
            nextDuration
          );
        }

        debuffMap[key] = (debuffMap[key] || 0) + debuff.value;
      }
    }

    return {
      ...card,
      debuffEffects: Object.values(mergedDebuffs),
      debuffs: debuffMap,
    };
  });
}

/**
 * Xử lý buff mỗi lượt.
 */
export function processBuffEffects(cards, currentActorId) {
  return cards.map((card) => {
    const buffMap = {};
    const mergedBuffs = {};

    for (const buff of card.buffEffects || []) {
      const isInfinite = buff.duration === 9999;
      let nextDuration = buff.duration;

      if (!isInfinite && card.ownedCardId === currentActorId) {
        nextDuration -= 1;
      }

      if (nextDuration >= 1 || isInfinite) {
        const key = buff.stat;

        if (!mergedBuffs[key]) {
          mergedBuffs[key] = {
            stat: key,
            value: buff.value,
            duration: nextDuration,
          };
        } else {
          mergedBuffs[key].value += buff.value;
          mergedBuffs[key].duration = Math.min(
            mergedBuffs[key].duration,
            nextDuration
          );
        }

        buffMap[key] = (buffMap[key] || 0) + buff.value;
      }
    }

    return {
      ...card,
      buffEffects: Object.values(mergedBuffs),
      buffs: buffMap,
    };
  });
}

/**
 * Chỉ số Nhanh nhẹn quyết định tốc độ hồi action gauge.
 */
export function recalculateCurrentSpeed(card) {
  const BASE_SPEED = 15;
  const agi = getStatWithBuff(card, "Nhanh nhẹn") || 0;
  const agiPercent = getStatWithBuff(card, "agiPercent") || 0;

  const baseSpeed = BASE_SPEED + agi / 3; // Mỗi 3 agi = +1 speed
  const speed = baseSpeed * (1 + agiPercent / 100);

  return Math.max(speed, 1); // Ngăn âm / đứng turn
}



/**
 * Tính damage từ skill Duel, bao gồm log chi tiết.
 */
export function calculateDuelDamageWithLog({ attacker, defender, ability }) {
  console.log("[DEBUG] Equipped Items of attacker:", attacker.equippedItems);
  let debugLog = "";
  let attackerPower = 0;

  const baseValue = ability.active?.value ?? 0;
  const stat = ability.active?.stat || null;
  const scaleWith = ability.active?.scaleWith || null;

  if (scaleWith === "stat" && stat) {
    const atk = getStatWithBuff(attacker, stat);
    const bonusAtk = getStatWithBuff(attacker, "Atk") || 0;
    attackerPower = atk + bonusAtk;
     debugLog += `Chỉ số ${stat}\n`;
     debugLog += `- ${attacker.characterName}: ${atk} + ATK bonus ${bonusAtk}\n`;
  }

  let hits = ability.active?.hitCount ?? 1;
  const bonusHits = getStatWithBuff(attacker, "bonusHits") || 0;
  hits += bonusHits;
  hits = Math.max(1, hits);

  const critRate = getStatWithBuff(attacker, "critRate") || 0;
  console.log(`[DEBUG] CritRate tổng = ${critRate}`);
  const critDamageBonus = getStatWithBuff(attacker, "critDamage") || 0;

  const prestige = getStatWithBuff(attacker, "Uy tín") || 0;
  const prestigeCrit = (prestige / 3) * 10;

  const critChance = Math.min(prestigeCrit + critRate, 100);
  const critMultiplier = 1.5 + prestige * 0.01 + critDamageBonus / 100;

  const dex = getStatWithBuff(attacker, "Khéo léo");
  const accuracyBonus = getStatWithBuff(attacker, "accuracy") || 0;
  const acc = 0.95 + dex / 150 + accuracyBonus / 100;

  const targetLuck = getStatWithBuff(defender, "May mắn");

  const evasionBonus = getStatWithBuff(defender, "evasion") || 0;
  const evasion = targetLuck / 150 + evasionBonus / 100;
  const hitChance = Math.max(0, acc - evasion);

  const endurance = getStatWithBuff(defender, "Bền bỉ");
  const defend = getStatWithBuff(defender, "defend");
  const defenseFromEndurance = endurance / 150; // thủ từ chỉ số bền bỉ
  const defenseFromDefend = defend / 100; // thủ từ chỉ số defend
  const totalDefensePercent = defenseFromEndurance + defenseFromDefend;
  const defensePercent = Math.min(totalDefensePercent, 0.95);

  debugLog += `🌟 Base ${baseValue}, Hits ${hits}, Crit ${critChance.toFixed(
    0
  )}%, Crit DMG x${critMultiplier.toFixed(2)}, Acc ${(acc * 100).toFixed(
    1
  )}%, Evasion ${(evasion * 100).toFixed(1)}%, Hit ${(hitChance * 100).toFixed(
    1
  )}%, DEF giảm ${defensePercent * 100}%\n`;

  let totalDamage = 0;
  const hitLogs = [];
  const hitResults = [];

  for (let i = 1; i <= hits; i++) {
    const isCrit = Math.random() * 100 < critChance;
    const isMiss = Math.random() > hitChance;
    let thisDamage = 0;

    if (!isMiss) {
      let multiplier = ability.active?.multiplier ?? 0.5;
      const skillAmp = getStatWithBuff(attacker, "skillAmp") || 0;
      multiplier += skillAmp / 100; // ✅ Cộng trực tiếp

      let raw = baseValue + attackerPower * multiplier;
      raw *= isCrit ? critMultiplier : 1;
      const reduced = raw * (1 - defensePercent);
      thisDamage = Math.max(0, reduced);
    }

    totalDamage += thisDamage;

    hitLogs.push(
      `  🔁 Đòn ${i}: ${
        isMiss
          ? "💨 Trượt"
          : `${isCrit ? "💫 Crit! " : ""}${thisDamage.toFixed(2)}`
      }`
    );

    hitResults.push({
      type: isMiss ? "miss" : isCrit ? "crit" : "normal",
      value: thisDamage,
    });
  }

  debugLog += `🔢 Chi tiết:\n${hitLogs.join("\n")}\n`;
  debugLog += `→ Tổng ${totalDamage.toFixed(2)} damage\n`;

  return {
    damage: totalDamage,
    log: debugLog,
    hitLogs,
    hitResults,
  };
}
//calculator đã clean
