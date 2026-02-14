// ✅ Refactor applyAbilityEffect để gom tất cả update, bao gồm passive, về đúng state cuối (sử dụng schema mới)

import { handleDuelAbility } from "../abilityType/DuelAbility";
import { handleDamageAbility } from "../abilities/DamageAbility";
import { handleBuffAbility } from "../abilities/BuffAbility";
import { handleDebuffAbility } from "../abilities/DebuffAbility";
import { processPassiveEffects } from "../abilities/processPassiveEffects";
import {
  processBuffEffects,
  processDebuffEffects,
  recalculateCurrentSpeed,
} from "../abilityType/battleCalculator";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // THÊM DÒNG NÀY Ở TRÊN CÙNG


export async function applyAbilityEffect({
  db,
  roomId,
  ability,
  myCard,
  actualTargets,
  roomData,
  role,
  opponentRole,
  updateRoom,
  currentActorId,
  availableAbilitiesMap,
}) {
  let newMyCards = [...roomData[role + "Cards"]];
  let newOpponentCards = [...roomData[opponentRole + "Cards"]];
  const logs = [];
  let collectedDamageEvents = []; // ✅ Gom toàn bộ damageEvents từ tất cả target

  newMyCards = processBuffEffects(newMyCards, currentActorId);
  newMyCards = processDebuffEffects(newMyCards, currentActorId);
  newOpponentCards = processBuffEffects(newOpponentCards, currentActorId);
  newOpponentCards = processDebuffEffects(newOpponentCards, currentActorId);
  // Sau khi gọi processBuffEffects và processDebuffEffects:
  newMyCards = newMyCards.map((c) => ({
    ...c,
    currentSpeed: recalculateCurrentSpeed(c),
  }));
  newOpponentCards = newOpponentCards.map((c) => ({
    ...c,
    currentSpeed: recalculateCurrentSpeed(c),
  }));

  const skillName = ability?.meta?.name;
  const skillType = ability?.active?.type;
  const skillCooldown = ability?.active?.cooldown ?? 0;

  roomData.lastUsedSkill = skillName;

  // 2. Duyệt từng target
  for (const target of actualTargets) {
    if (!target?.ownedCardId) continue;

    switch (skillType) {
      case "duel": {
        const caster = myCard;        const {
          updates,
          log: duelLog,
          triggers,
          damage,
          damageEvents,
        } = handleDuelAbility({
          ability,
          caster,
          target,
          roomData,
          updateRoom,
          role,
        });

        const updatedDuelCount = (caster.duelCount || 0) + 1;
        caster.duelCount = updatedDuelCount;
        newMyCards = newMyCards.map((c) =>
          c.ownedCardId === caster.ownedCardId
            ? { ...c, duelCount: updatedDuelCount }
            : c
        );

        roomData.lastDamageTaken = damage || 0;

        // ✅ Ghi damageEvents vào roomData để client hiển thị
        if (damageEvents?.length > 0) {
          collectedDamageEvents.push(...damageEvents);
        }

        updates.forEach(({ id, changes }) => {
          newMyCards = newMyCards.map((c) =>
            c.ownedCardId === id ? { ...c, ...changes } : c
          );
          newOpponentCards = newOpponentCards.map((c) =>
            c.ownedCardId === id ? { ...c, ...changes } : c
          );
        });

        logs.push(duelLog);

        const damagedTarget = [...newMyCards, ...newOpponentCards].find(
          (c) => c.ownedCardId === target.ownedCardId
        );

        if (damagedTarget) {
          const isDamagedTargetHost = roomData.hostCards.some(
            (c) => c.ownedCardId === damagedTarget.ownedCardId
          );

          const passiveMyCards = isDamagedTargetHost
            ? [...roomData.hostCards]
            : [...roomData.guestCards];
          const passiveOpponentCards = isDamagedTargetHost
            ? [...roomData.guestCards]
            : [...roomData.hostCards];

          const updateCard = (id, changes) => {
            newMyCards = newMyCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
            newOpponentCards = newOpponentCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
          };

          await processPassiveEffects({
            trigger: "staminaLow",
            sourceCard: damagedTarget,
            targetCard: myCard,
            allCards: [...newMyCards, ...newOpponentCards],
            myCards: passiveMyCards,
            opponentCards: passiveOpponentCards,
            roomData,
            updateCard,
            applyLog: (log) => logs.push(log),
            updateRoom,
            availableAbilitiesMap,
          });
        }

        const allUpdatedCards = [...newMyCards, ...newOpponentCards];

        for (const { name, sourceId, targetId } of triggers) {
          const sourceCard = allUpdatedCards.find(
            (c) => c.ownedCardId === sourceId
          );
          const targetCard = allUpdatedCards.find(
            (c) => c.ownedCardId === targetId
          );
          if (!sourceCard || !targetCard) continue;

          const updateCard = (id, changes) => {
            newMyCards = newMyCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
            newOpponentCards = newOpponentCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
          };

          await processPassiveEffects({
            trigger: name,
            sourceCard,
            targetCard,
            allCards: allUpdatedCards,
            opponentCards: role === "host" ? newOpponentCards : newMyCards,
            roomData,
            updateCard,
            applyLog: (l) => logs.push(l),
            availableAbilitiesMap,
          });
        }

        break;
      }

      case "damage": {
        // ✅ Lấy đúng bản mới nhất của caster từ roomData
        const caster = myCard;
        // ✅ Gọi handleDamageAbility mới có hỗ trợ damageEvents, triggers, updatedFlags
        const {
          updates,
          log,
          triggers = [],
          damageEvents = [],
          updatedFlags,
        } = handleDamageAbility({
          ability,
          caster,
          target,
          roomData,
          updateRoom,
          role,
        });

        // ✅ Ghi log kết quả
        logs.push(log);

        // ✅ Cập nhật card theo updates từ handleDamageAbility
        updates.forEach(({ id, changes }) => {
          newMyCards = newMyCards.map((c) =>
            c.ownedCardId === id ? { ...c, ...changes } : c
          );
          newOpponentCards = newOpponentCards.map((c) =>
            c.ownedCardId === id ? { ...c, ...changes } : c
          );
        });

        // ✅ Cập nhật floating damage nếu có
        if (damageEvents.length > 0) {
          collectedDamageEvents.push(...damageEvents);
        }

        // ✅ Nếu có giành cờ (flag), thì cập nhật lên room
        if (updatedFlags) {
          await updateRoom({ flags: updatedFlags });
        }

        // ✅ Xử lý passive trigger nếu có
        const allCards = [...newMyCards, ...newOpponentCards];

        for (const { name, sourceId, targetId } of triggers) {
          const sourceCard = allCards.find((c) => c.ownedCardId === sourceId);
          const targetCard = allCards.find((c) => c.ownedCardId === targetId);
          if (!sourceCard || !targetCard) continue;

          const updateCard = (id, changes) => {
            newMyCards = newMyCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
            newOpponentCards = newOpponentCards.map((c) =>
              c.ownedCardId === id ? { ...c, ...changes } : c
            );
          };

          await processPassiveEffects({
            trigger: name,
            sourceCard,
            targetCard,
            allCards,
            myCards: newMyCards,
            opponentCards: newOpponentCards,
            roomData,
            updateCard,
            applyLog: (l) => logs.push(l),
            updateRoom,
            availableAbilitiesMap,
          });
        }
        break;
      }

      //      case "heal": {
      //        const {
      //          updatedCards,
      //          log,
      //          damageEvents = [],
      //        } = await handleHealAbility({
      //          ability,
      //          myCard,
      //          targetCard: target,
      //          roomData,
      //          role,
      //        });
      //        newMyCards = updatedCards;
      //        logs.push(log);
      //        if (damageEvents.length > 0) {
      //          collectedDamageEvents.push(...damageEvents);
      //        }
      //        break;
      //      }

      case "buff": {
        const {
          updatedCards,
          log,
          damageEvents = [],
        } = await handleBuffAbility({
          ability,
          myCard,
          targetCard: target,
          roomData,
          role,
        });
        newMyCards = updatedCards;
        logs.push(log);

        if (damageEvents.length > 0) {
          collectedDamageEvents.push(...damageEvents);
        }

        break;
      }

      case "debuff": {
        const { updatedCards, log } = await handleDebuffAbility({
          ability,
          myCard,
          targetCard: target,
          roomData,
          role,
          opponentRole,
        });
        newOpponentCards = updatedCards;
        logs.push(log);
        break;
      }
    }
  }

  const markDeadCards = (cards) =>
    cards.map((c) => {
      if (c.stamina <= 0 && !c.respawnCounter) {
        return {
          ...c,
          respawnCounter: 12,
          buffEffects: (c.buffEffects || []).filter((b) => b.duration >= 99),
          debuffEffects: [],
          statusEffects: [],
          buffs: {},
          debuffs: {},
        };
      }
      return c;
    });

  newMyCards = markDeadCards(newMyCards);
  newOpponentCards = markDeadCards(newOpponentCards);

  // 👇 GỌI passive onUseSpecificSkill ở đây
  const updateCard = (id, changes) => {
    newMyCards = newMyCards.map((c) =>
      c.ownedCardId === id ? { ...c, ...changes } : c
    );
    newOpponentCards = newOpponentCards.map((c) =>
      c.ownedCardId === id ? { ...c, ...changes } : c
    );
  };

  await processPassiveEffects({
    trigger: "onUseSpecificSkill",
    sourceCard: myCard,
    targetCard: null,
    allCards: [...newMyCards, ...newOpponentCards],
    myCards: newMyCards,
    opponentCards: newOpponentCards,
    roomData,
    updateCard,
    applyLog: (log) => logs.push(log),
    updateRoom,
    availableAbilitiesMap,
  });

  if (collectedDamageEvents.length === 0 && roomId) {
    const dummyEvent = {
      id: uuidv4(),
      targetId: myCard.ownedCardId, // hoặc targetId nào đó
      type: "none",
      value: 0,
      order: 0,
      createdAt: serverTimestamp(),
    };
    const damageEventsRef = collection(db, "rooms", roomId, "damageEvents");
    await addDoc(damageEventsRef, dummyEvent);
  }

  if (collectedDamageEvents.length > 0 && roomId) {
    const damageEventsRef = collection(db, "rooms", roomId, "damageEvents");

    await Promise.all(
      collectedDamageEvents.map((event) =>
        addDoc(damageEventsRef, {
          ...event,
          id: uuidv4(), // ✅ THÊM DÒNG NÀY để tránh trùng nhau
          createdAt: serverTimestamp(),
        })
      )
    );
  }

  return { newMyCards, newOpponentCards, logs, lastUsedSkill: skillName };
}
