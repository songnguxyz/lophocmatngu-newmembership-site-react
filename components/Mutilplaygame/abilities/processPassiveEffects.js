import passiveHandlers from "./passiveEffects";
import {
  getStatWithBuff,
  processBuffEffects,processDebuffEffects
} from "../abilityType/battleCalculator";
import { SUBJECT_RECIPES } from "../shared/newSubjectFlag/Recipes";

export async function processPassiveEffects({
  trigger,
  sourceCard,
  targetCard,
  allCards,
  myCards,
  opponentCards,
  roomData,
  updateCard,
  applyLog,
  updateRoom,
  availableAbilitiesMap, // ✅ thêm mới
}) {
  if (!availableAbilitiesMap || typeof availableAbilitiesMap !== "object") {
    console.error(
      "🚨 processPassiveEffects được gọi nhưng thiếu availableAbilitiesMap!",
      {
        availableAbilitiesMap,
        sourceCard,
        trigger,
      }
    );
    console.trace();
    return;
  }
  if (
    sourceCard.statusEffects?.some(
      (e) => e.type === "silence" || e.type === "stun"
    )
  ) {
    return;
  }

  // ✅ Lấy danh sách kỹ năng bị động từ map
  const ownedId = sourceCard.ownedCardId?.trim?.();
  const charId = sourceCard.characterId?.trim?.();
  const map = availableAbilitiesMap || {};
  const hasOwned = !!map[ownedId];
  const hasChar = !!map[charId];

  console.log("🧪 check map", { ownedId, charId, hasOwned, hasChar });

  const allAbilities = map[ownedId] ??[];
  

  // ✅ Thêm các passive từ các môn đã ghép
  const composedSubjects =
    roomData?.composedSubjectsByPlayerId?.[sourceCard.ownedCardId] || [];
  const subjectPassives = SUBJECT_RECIPES.filter((subject) =>
    composedSubjects.includes(subject.name)
  ).map((subject) => subject.passive);

  console.log("📚 composedSubjects:", composedSubjects);
  console.log(
    "🧠 subjectPassives:",
    subjectPassives.map((p) => p?.name || p)
  );

  // Gộp chung vào allAbilities
  const mergedAbilities = [...allAbilities, ...subjectPassives];

  console.log("🧪 mergedAbilities (total):", mergedAbilities.length);
  console.log(
    "📋 Danh sách kỹ năng:",
    mergedAbilities.map((a) => a?.name || a)
  );

  const triggeredAbilities = mergedAbilities.filter((ability) => {
    const isPassive = ability.skillCategory === "passive";
    const passiveTrigger = ability.passive?.trigger?.type;
    const onCooldown = isOnCooldown(sourceCard, ability, roomData);
    const conditionOk = checkTriggerCondition(ability, sourceCard, roomData);

    const match =
      isPassive && passiveTrigger === trigger && conditionOk && !onCooldown;

      if (!isPassive) {
        console.log("❌ Không phải passive:", ability.name);
      } else if (passiveTrigger !== trigger) {
        console.log(
          `❌ Trigger không khớp: ${ability.name} cần ${passiveTrigger}, hiện tại là ${trigger}`
        );
      } else if (!conditionOk) {
        console.log(`❌ Không đạt điều kiện trigger: ${ability.name}`);
      } else if (onCooldown) {
        console.log(`⏳ ${ability.name} đang cooldown`);
      }

    return match;
  });

  for (const ability of triggeredAbilities) {
    const effect = ability.passive.effect;
    const targets = selectTargets({
      effectTarget: effect.target,
      sourceCard,
      targetCard,
      allCards,
      myCards,
      opponentCards,
    });

    console.log("⚙️ Kích hoạt passive:", ability.name);

    const handler = passiveHandlers[effect.type];
    if (handler) {
      await handler({
        ability,
        sourceCard,
        targetCard,
        roomData,
        updateCard,
        applyLog,
      });
      continue;
    }

    switch (effect.type) {
      case "damage":
        for (const target of targets) {
          const dmg = parseInt(effect.value || "0");
          const newStamina = Math.max((target.stamina ?? 24) - dmg, 0);
          updateCard(target.ownedCardId, { stamina: newStamina });
          applyLog(
            `${sourceCard.characterName} gây ${dmg} damage lên ${target.characterName} bằng '${ability.name}'`
          );
        }
        break;

      case "heal": {
        console.log("💚 Bắt đầu xử lý passive heal");

        const healEvents = [];

        for (const target of targets) {
          if ((target.stamina ?? 0) <= 0) {
            console.log(`💀 Bỏ qua ${target.characterName} do đã chết`);
            continue;
          }

          console.log("🧪 Passive heal effect:", effect);
          console.log("🧪 effect.value =", effect?.value);
          console.log("🧮 typeof =", typeof effect?.value);

          const healAmount = parseInt(String(effect?.value ?? "0"), 10);
          console.log("➡️ healAmount =", healAmount);

          const healedStamina = Math.min(
            (target.stamina ?? 0) + healAmount,
            24
          );

          console.log(
            `💊 Heal ${healAmount} cho ${target.characterName} → máu sau hồi: ${healedStamina}`
          );

          updateCard(target.ownedCardId, {
            stamina: healedStamina,
          });

          applyLog(`${sourceCard.characterName} tự hồi ${healAmount} máu.`);

          healEvents.push({
            targetId: target.ownedCardId,
            value: healAmount, // ✅ phải là "value", KHÔNG phải "amount"
            type: "heal",
          });
        }

        // ✅ Ghi lại damageEvents vào roomData
        roomData.damageEvents = (roomData.damageEvents || []).concat(
          healEvents
        );

        break;
      }

      case "statusEffect": {
        for (const target of targets) {
          // 📌 Kháng trạng thái
          const allBuffed = processBuffEffects(allCards, "");
          const buffedTarget = allBuffed.find(
            (c) => c.ownedCardId === target.ownedCardId
          );

          const resistant = getStatWithBuff(buffedTarget, "resistant") || 0;
          const baseChance = 100;
          const chanceAfterResist = Math.max(0, baseChance - resistant);
          const roll = Math.random() * 100;

          if (roll > chanceAfterResist) {
            console.log(
              `[🛡️ RESIST] ${
                target.characterName
              } resistant=${resistant}, chance=${chanceAfterResist.toFixed(
                1
              )}%, roll=${roll.toFixed(1)}`
            );
            applyLog(
              `${target.characterName} đã kháng hiệu ứng ${effect.status}`
            );
            continue; // ❌ bỏ qua áp dụng status
          }

          const statusEffect = {
            type: effect.status,
            duration: parseInt(effect.duration || "1"),
            ...(effect.status === "poison" && {
              poisonPercent: effect.poisonPercent ?? 15,
            }),
            ...(effect.status === "slow" && {
              specialEffect: "actionGauge",
              actionGauge: effect.actionGauge ?? -10,
            }),
          };

          const updatedStatus = [
            ...(target.statusEffects || []).filter(
              (e) => e.type !== effect.status
            ),
            statusEffect,
          ];

          // ✅ Nếu là slow → thêm debuff actionGauge
          const newDebuffEffects =
            effect.status === "slow"
              ? [
                  ...(target.debuffEffects || []).filter(
                    (b) => b.stat !== "actionGauge"
                  ),
                  {
                    stat: "actionGauge",
                    value: Math.abs(effect.actionGauge ?? -10),
                    duration: parseInt(effect.duration || "1"),
                  },
                ]
              : target.debuffEffects;

          updateCard(target.ownedCardId, {
            statusEffects: updatedStatus,
            debuffEffects: newDebuffEffects,
          });

          applyLog(
            `${target.characterName} nhận trạng thái ${effect.status} (${statusEffect.duration} lượt)`
          );
        }
        break;
      }

      case "buff":
        for (const target of targets) {
          const stat = effect.stat || "stamina";
          const value = parseInt(effect.value || "0");
          const duration = effect.infiniteDuration
            ? 9999
            : parseInt(effect.duration || "2");
          const stackable = effect.stackable ?? true;

          const existingBuffs = target.buffEffects || [];
          const sameStat = existingBuffs.find((b) => b.stat === stat);
          const others = existingBuffs.filter((b) => b.stat !== stat);

          let newBuff;

          if (sameStat) {
            newBuff = stackable
              ? {
                  stat,
                  value: sameStat.value + value,
                  duration: Math.max(sameStat.duration, duration),
                }
              : {
                  stat,
                  value: value, // không cộng dồn
                  duration: Math.max(sameStat.duration, duration),
                };
          } else {
            newBuff = { stat, value, duration };
          }

          updateCard(target.ownedCardId, {
            buffEffects: [...others, newBuff],
          });

          console.log(
            `🎯 Buff vào target: ${target.characterName} +${value} ${stat} (${duration} lượt)`
          );

          applyLog(
            `${target.characterName} được buff ${value} ${stat} (${
              duration === 9999 ? "vĩnh viễn" : duration + " lượt"
            }) từ '${ability.name}'`
          );
        }
        break;

      case "debuff":
        console.log("🎯 Passive buff:", ability.name);
        console.log("📌 effect.target =", effect?.target);
        console.log(
          "👥 Danh sách target =",
          targets.map((t) => t.characterName)
        );
        for (const target of targets) {
          const stat = (effect.stat || "stamina").trim();
          const value = parseInt(effect.value || "0");
          const duration = effect.infiniteDuration
            ? 9999
            : parseInt(effect.duration || "2");
          const stackable = effect.stackable ?? true;

          const newDebuff = { stat, value, duration };
          const oldDebuffs = target.debuffEffects || [];
          const finalDebuffs = [...oldDebuffs, newDebuff];

          console.log(
            `🔧 Áp dụng debuff '${stat}' -${value} (${duration} lượt) lên ${target.characterName}`
          );
          console.log("📦 Trước đó debuffEffects =", oldDebuffs);
          console.log("📦 Sau khi thêm =", finalDebuffs);

          updateCard(target.ownedCardId, {
            debuffEffects: finalDebuffs,
          });

          // ✅ Gọi lại process để kiểm tra tổng cộng dồn
          const updatedCards = processDebuffEffects(allCards, null); // Không giảm lượt
          const updatedTarget = updatedCards.find(
            (c) => c.ownedCardId === target.ownedCardId
          );

          console.log("🧠 Tổng debuffs hiện tại =", updatedTarget.debuffs);
          const finalValue = getStatWithBuff(updatedTarget, stat);
          console.log(`🎯 Giá trị sau debuff của '${stat}' = ${finalValue}`);

          applyLog(
            `${target.characterName} bị giảm ${value} ${stat} (${duration} lượt) → còn ${finalValue} ${stat}`
          );
        }
        break;

      case "extraAction": {
        const bonus = parseInt(effect.value || "1");

        const existing = sourceCard.bonusActionCount ?? 0;
        const updated = existing + bonus;

        // Thêm buff effect hiển thị
        const oldBuffs = sourceCard.buffEffects || [];
        const filteredBuffs = oldBuffs.filter((b) => b.stat !== "extraAction");
        const newBuffs = [
          ...filteredBuffs,
          {
            stat: "extraAction",
            value: bonus,
            duration: effect.duration || 2, // mặc định 2 lượt nếu không có
          },
        ];

        updateCard(sourceCard.ownedCardId, {
          bonusActionCount: updated,
          buffEffects: newBuffs,
        });

        applyLog(
          `${sourceCard.characterName} nhận thêm ${bonus} lượt hành động nhờ '${ability.name}'`
        );
        break;
      }

      case "damageReflect": {
        console.log("💥 Bắt đầu xử lý damageReflect");
        console.log("🧿 sourceCard:", sourceCard.characterName);
        console.log("🎯 targetCard:", targetCard?.characterName);

        const percent = parseInt(effect.value || "0");
        const lastDmg = roomData.lastDamageTaken || 0;
        const reflected = Math.floor(lastDmg * (percent / 100));

        console.log(
          "📊 lastDmg:",
          lastDmg,
          "| percent:",
          percent,
          "| reflected:",
          reflected
        );

        if (!targetCard || reflected <= 0) {
          console.log(
            "⛔ Không phản damage do thiếu target hoặc reflected <= 0"
          );
          break;
        }

        const newStamina = Math.max(0, (targetCard.stamina ?? 0) - reflected);

        updateCard(targetCard.ownedCardId, {
          stamina: newStamina,
        });

        applyLog(
          `${sourceCard.characterName} phản lại ${reflected} sát thương cho ${targetCard.characterName} (${percent}%)`
        );
        break;
      }

      case "damageBoost":
        const boosts = {
          ...(sourceCard.temporaryEffects || {}),
          damageBoost:
            (sourceCard.temporaryEffects?.damageBoost || 0) +
            parseInt(effect.value || "0"),
        };
        updateCard(sourceCard.ownedCardId, { temporaryEffects: boosts });
        applyLog(
          `${sourceCard.characterName} tăng sát thương thêm ${effect.value}`
        );
        break;

      default:
        console.warn("⚠️ Chưa xử lý effect type:", effect.type);
    }

    // ✅ Ghi cooldown
    if (ability.active?.cooldown || ability.passive?.effect?.cooldown) {
      const cooldown =
        ability.active?.cooldown || ability.passive.effect.cooldown;
      if (cooldown > 0) {
        const cooldowns = {
          ...(sourceCard.abilityCooldowns || {}),
          [ability.name]: cooldown,
        };
        updateCard(sourceCard.ownedCardId, {
          abilityCooldowns: cooldowns,
        });
      }
    }
  }
}

// Cooldown check
function isOnCooldown(card, ability) {
  const cooldownLeft = card.abilityCooldowns?.[ability.name];
  return (cooldownLeft ?? 0) > 0;
}

// Điều kiện trigger
function checkTriggerCondition(ability, card, roomData) {
  const trigger = ability.passive?.trigger;
  if (!trigger) return false;

  if (trigger.chance < 100) {
    const roll = Math.random() * 100;
    if (roll > trigger.chance) {
      console.log(
        `🎲 Không kích hoạt (${trigger.chance}%) → tung ra ${roll.toFixed(1)}`
      );
      return false;
    }
  }

  switch (trigger.type) {
    case "onTakeDamage":
    case "onTurnStart":
    case "onTurnEnd":
    case "onSkillUse":
    case "onKillEnemy":
    case "onAllyUseSkill":
    case "onAllyDefeated":
    case "onAllyTakeDamage":
    case "onEnemyUseSkill":
    case "onComposeSubject":
      return true;

    case "staminaLow":
      return (card.stamina ?? 0) <= trigger.value;

    case "afterNDuels":
      return (card.duelCount ?? 0) >= trigger.value;

    case "onUseSpecificSkill":
      return roomData.lastUsedSkill === trigger.skillName;

    case "onEnemyCountBelowX":
      return (roomData.enemyCount ?? 0) < trigger.value;

    default:
      return false;
  }
}

// Target selection
function selectTargets({
  effectTarget,
  sourceCard,
  targetCard,
  allCards,
  myCards,
  opponentCards,
}) {
  myCards = myCards || [];
  opponentCards = opponentCards || [];
  
  console.log("📦 selectTargets:", {
    effectTarget,
    sourceCard: sourceCard.characterName,
    myCards: myCards.map((c) => c.characterName),
    opponentCards: opponentCards.map((c) => c.characterName),
  });

  switch (effectTarget) {
    case "self":
      return [sourceCard];
    case "oneEnemy":
      return targetCard ? [targetCard] : [opponentCards[0]].filter(Boolean);
    case "allEnemies":
      return opponentCards.filter((c) => (c.stamina ?? 0) > 0);
    case "oneAlly":
      return allCards
        .filter((c) => c.ownedCardId !== sourceCard.ownedCardId)
        .slice(0, 1);
    case "allAllies":
      return myCards.filter((c) => (c.stamina ?? 0) > 0);
    default:
      return [];
  }
}
