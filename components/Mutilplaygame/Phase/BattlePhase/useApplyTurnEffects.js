import { useRef, useEffect } from "react";
import { applyTurnEffects } from "../../turn/applyTurnEffects";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { calculateMaxStamina } from "../../abilityType/battleCalculator";
import { v4 as uuidv4 } from "uuid";

export function useApplyTurnEffects({
  db,
  roomId,
  roomData,
  role,
  opponentRole,
  availableAbilitiesMap,
}) {
  const lastActorRef = useRef(null);

  useEffect(() => {
    const applyEffects = async () => {
      if (
        !roomData?.currentActorId ||
        roomData?.winner ||
        !roomData?.turnNumber
      )
        return;
      const currentActorId = roomData.currentActorId;
      if (lastActorRef.current === currentActorId) return;
      lastActorRef.current = currentActorId;

      // ✅ Load equippedItems từ subcollection
      let equippedItemsMap = {};
      try {
        const equippedItemsSnap = await getDocs(
          collection(db, `rooms/${roomId}/equippedItems`)
        );
        equippedItemsSnap.forEach((doc) => {
          equippedItemsMap[doc.id] = doc.data().equippedItems || {};
        });
      } catch (err) {
        console.error("Lỗi khi load equippedItems:", err);
      }

      const rawMyCards = Array.isArray(roomData[role + "Cards"])
        ? roomData[role + "Cards"].map((c) => ({
            ...c,
            equippedItems: equippedItemsMap[c.ownedCardId] || {},
          }))
        : [];

      const rawOpponentCards = Array.isArray(roomData[opponentRole + "Cards"])
        ? roomData[opponentRole + "Cards"].map((c) => ({
            ...c,
            equippedItems: equippedItemsMap[c.ownedCardId] || {},
          }))
        : [];

      const updateRespawnCounters = (cards) =>
        cards.map((c) => {
          if (c.stamina <= 0 && c.respawnCounter > 0) {
            const newCounter = c.respawnCounter - 1;
            if (newCounter <= 0) {
              return {
                ...c,
                stamina: calculateMaxStamina(c), // ✅ lúc này đã có equippedItems
                respawnCounter: null,
              };
            } else {
              return {
                ...c,
                respawnCounter: newCounter,
              };
            }
          }
          return c;
        });

      const rawMyCardsAfterRespawn = updateRespawnCounters(rawMyCards);
      const rawOpponentCardsAfterRespawn =
        updateRespawnCounters(rawOpponentCards);

      const allCards = [
        ...rawMyCardsAfterRespawn,
        ...rawOpponentCardsAfterRespawn,
      ];
      const updatedAllCards = applyTurnEffects(
        allCards,
        roomData.currentActorId,
        availableAbilitiesMap
      );

      const removePendingDamageEvents = (cards) =>
        cards.map((card) => {
          const { _pendingDamageEvents, ...rest } = card;
          return rest;
        });

      const damageEvents = [];

      for (const card of updatedAllCards) {
        if (card.ownedCardId !== roomData.currentActorId) continue;
        if (!Array.isArray(card._pendingDamageEvents)) continue;

        card._pendingDamageEvents.forEach((ev, index) => {
          damageEvents.push({
            id: uuidv4(),
            targetId: card.ownedCardId,
            type: ev.type,
            value: Math.round(ev.value * 1000) / 1000,
            order: index,
            createdAt: serverTimestamp(),
          });
        });
      }

      const newMyCards = updatedAllCards
        .map((card) => {
          if (card.ownedCardId === roomData.currentActorId) {
            const current = rawMyCardsAfterRespawn.find(
              (c) => c.ownedCardId === card.ownedCardId
            );
            const bonus = current?.bonusActionCount ?? 0;
            return {
              ...card,
              actionCount: 1 + bonus,
              bonusActionCount: 0,
            };
          }
          return card;
        })
        .filter((c) =>
          rawMyCardsAfterRespawn.some((m) => m.ownedCardId === c.ownedCardId)
        );

      const newOpponentCards = updatedAllCards
        .map((card) => {
          if (card.ownedCardId === roomData.currentActorId) {
            const current = rawOpponentCardsAfterRespawn.find(
              (c) => c.ownedCardId === card.ownedCardId
            );
            const bonus = current?.bonusActionCount ?? 0;
            return {
              ...card,
              actionCount: 1 + bonus,
              bonusActionCount: 0,
            };
          }
          return card;
        })
        .filter((c) =>
          rawOpponentCardsAfterRespawn.some(
            (m) => m.ownedCardId === c.ownedCardId
          )
        );

      const cleanedMyCards = removePendingDamageEvents(newMyCards);
      const cleanedOpponentCards = removePendingDamageEvents(newOpponentCards);

      const updateData = {
        [role + "Cards"]: cleanedMyCards,
        [opponentRole + "Cards"]: cleanedOpponentCards,
      };

      const isMyTurn = rawMyCardsAfterRespawn.some(
        (c) => c.ownedCardId === roomData.currentActorId
      );
      const promises = [];

      if (damageEvents.length > 0 && isMyTurn) {
        const damageEventsRef = collection(db, "rooms", roomId, "damageEvents");

        for (const ev of damageEvents) {
          const roundedValue = Math.round(ev.value * 1000) / 1000;
          promises.push(
            addDoc(damageEventsRef, {
              ...ev,
              value: roundedValue,
              createdAt: serverTimestamp(),
            })
          );
        }
      }

      const hasChanges =
        JSON.stringify(roomData[role + "Cards"]) !==
          JSON.stringify(newMyCards) ||
        JSON.stringify(roomData[opponentRole + "Cards"]) !==
          JSON.stringify(newOpponentCards);

      if (hasChanges) {
        updateDoc(doc(db, "rooms", roomId), updateData);
      }

      if (promises.length > 0 && isMyTurn) {
        Promise.all(promises).catch((err) =>
          console.error("Lỗi khi ghi damageEvents:", err)
        );
      }
    };

    applyEffects(); // gọi async
  }, [roomData?.turnNumber]);
}
