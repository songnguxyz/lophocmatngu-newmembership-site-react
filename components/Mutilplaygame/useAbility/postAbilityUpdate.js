// ✅ postAbilityUpdate.js - cập nhật để dùng ability.meta.name và ability.active.staminaCost
import { updateDoc, doc } from "firebase/firestore";
import { getNextCardToAct } from "../turn/getNextCardToAct";
import { checkVictoryCondition } from "../shared/victoryUtils";
import { processPassiveEffects } from "../abilities/processPassiveEffects";
import { recalculateCurrentSpeed } from "../abilityType/battleCalculator";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function postAbilityUpdate({
  db,
  roomId,
  role,
  opponentRole,
  ability,
  myCard,
  newMyCards,
  newOpponentCards,
  roomData,
  logs,
  setMyCards,
  setOpponentCards,
  setSelectedCardId,
  setSelectedTargetCardId,
  setSelectedAbility,
  lastUsedSkill,
  availableAbilitiesMap,
}) {
  newMyCards = newMyCards.map((card) => {
    if (card.ownedCardId !== myCard.ownedCardId) return card;

    const cooldown = ability.active?.cooldown ?? 0;
    const skillName = ability.meta?.name;

    return {
      ...card,
      stamina: Math.max(
        (card.stamina ?? 24) - (ability.active?.staminaCost ?? 0),
        0
      ),
      actionCount:
        typeof card.actionCount === "number"
          ? Math.max(card.actionCount - 1, 0)
          : 0,
      // ✅ Ghi cooldown nếu cần
      abilityCooldowns:
        cooldown > 0 && skillName
          ? {
              ...(card.abilityCooldowns || {}),
              [skillName]: cooldown,
            }
          : card.abilityCooldowns,
    };
  });

  const allCards = [...newMyCards, ...newOpponentCards].map((card) => {
    const updatedSpeed = recalculateCurrentSpeed(card); // ✅ tính trước để dùng ngay
    if (card.ownedCardId === myCard.ownedCardId) {
      return { ...card, actionGauge: 0 };
    }
    if (card.stamina <= 0) return card;
    return {
      ...card,
      currentSpeed: updatedSpeed,
      actionGauge:
        (card.actionGauge ?? 0) +
        (card.currentSpeed ?? card.baseSpeed ?? 0) *
          (1 +
            ((card.buffs?.actionGauge ?? 0) -
              (card.debuffs?.actionGauge ?? 0)) /
              100),
    };
  });

  const markDeadCards = (cards) =>
    cards.map((c) => {
      if (c.stamina <= 0 && !c.respawnCounter) {
        return { ...c, respawnCounter: 12 };
      }
      return c;
    });
    const updatedAllCards = markDeadCards(allCards);
//  const updatedAllCards = markDeadCards(allCards).map((c) => ({
//    ...c,
//    currentSpeed: recalculateCurrentSpeed(c), 
//  }));

  const nextCard = getNextCardToAct(updatedAllCards);

  let updatedMyCards = updatedAllCards.filter((c) =>
    roomData[role + "Cards"].some((m) => m.ownedCardId === c.ownedCardId)
  );
  let updatedOpponentCards = updatedAllCards.filter((c) =>
    roomData[opponentRole + "Cards"].some(
      (m) => m.ownedCardId === c.ownedCardId
    )
  );

  const updatedHostCards =
    role === "host" ? updatedMyCards : updatedOpponentCards;
  const updatedGuestCards =
    role === "guest" ? updatedMyCards : updatedOpponentCards;

  setMyCards(updatedMyCards);
  setOpponentCards(updatedOpponentCards);

  function extractFlagsFromCards(cards) {
    return cards.flatMap((c) => c.flags || []);
  }

  const actualMyRole = roomData.hostCards.some(
    (c) => c.ownedCardId === myCard.ownedCardId
  )
    ? "host"
    : "guest";
  const actualOpponentRole = actualMyRole === "host" ? "guest" : "host";

  const currentFlags = extractFlagsFromCards(
    actualMyRole === "host" ? updatedHostCards : updatedGuestCards
  );
  const currentSubjects = roomData.obtainedSubjects?.[actualMyRole] || [];

  const updatedRoomData = {
    ...roomData,
    flags: {
      host: extractFlagsFromCards(updatedHostCards),
      guest: extractFlagsFromCards(updatedGuestCards),
    },
    obtainedSubjects: {
      host: roomData.obtainedSubjects?.host || [],
      guest: roomData.obtainedSubjects?.guest || [],
    },
  };

  const winner = checkVictoryCondition({
    roomData: updatedRoomData,
    myRole: actualMyRole,
    opponentRole: actualOpponentRole,
  });

  const currentCardAfterAct = updatedAllCards.find(
    (c) => c.ownedCardId === myCard.ownedCardId
  );

  {
    const currentCard = currentCardAfterAct;
    if (currentCard) {
      const updateCard = (id, changes) => {
        updatedMyCards = updatedMyCards.map((c) =>
          c.ownedCardId === id ? { ...c, ...changes } : c
        );
        updatedOpponentCards = updatedOpponentCards.map((c) =>
          c.ownedCardId === id ? { ...c, ...changes } : c
        );
      };

      const isCurrentCardMySide = roomData[actualMyRole + "Cards"].some(
        (c) => c.ownedCardId === currentCard.ownedCardId
      );

      const opponentCardsForCurrent = isCurrentCardMySide
        ? updatedOpponentCards
        : updatedMyCards;

      await processPassiveEffects({
        trigger: "onTurnEnd",
        sourceCard: currentCard,
        targetCard: null,
        allCards: [...updatedMyCards, ...updatedOpponentCards],
        myCards: isCurrentCardMySide ? updatedMyCards : updatedOpponentCards,
        opponentCards: opponentCardsForCurrent,
        roomData,
        updateCard,
        applyLog: (log) => logs.push(log),
        availableAbilitiesMap,
      });

      setMyCards(updatedMyCards);
      setOpponentCards(updatedOpponentCards);
    }
  }

  const nextActorId =
    currentCardAfterAct?.actionCount > 0
      ? currentCardAfterAct.ownedCardId
      : nextCard?.ownedCardId || null;

  if (nextActorId) {
    const nextActorCard = [...updatedMyCards, ...updatedOpponentCards].find(
      (c) => c.ownedCardId === nextActorId
    );

    if (nextActorCard) {
      const updateCard = (id, changes) => {
        updatedMyCards = updatedMyCards.map((c) =>
          c.ownedCardId === id ? { ...c, ...changes } : c
        );
        updatedOpponentCards = updatedOpponentCards.map((c) =>
          c.ownedCardId === id ? { ...c, ...changes } : c
        );
      };

      const isNextCardMySide = roomData[actualMyRole + "Cards"].some(
        (c) => c.ownedCardId === nextActorCard.ownedCardId
      );

      const opponentCardsForNext = isNextCardMySide
        ? updatedOpponentCards
        : updatedMyCards;

      // ✅ Thêm log tại đây
      const abilityList = availableAbilitiesMap?.[nextActorCard?.ownedCardId];
      console.log("🔥 onTurnStart - passive map", abilityList);

      await processPassiveEffects({
        trigger: "onTurnStart",
        sourceCard: nextActorCard,
        targetCard: null,
        allCards: [...updatedMyCards, ...updatedOpponentCards],
        myCards: isNextCardMySide ? updatedMyCards : updatedOpponentCards,
        opponentCards: opponentCardsForNext,
        roomData,
        updateCard,
        applyLog: (log) => logs.push(log),
        availableAbilitiesMap,
      });

      setMyCards(updatedMyCards);
      setOpponentCards(updatedOpponentCards);
    }
  }

  updatedRoomData.hostCards =
    actualMyRole === "host" ? updatedMyCards : updatedOpponentCards;
  updatedRoomData.guestCards =
    actualMyRole === "guest" ? updatedMyCards : updatedOpponentCards;
  try {
    const battleLogRef = collection(db, "rooms", roomId, "battleLogs");
    await addDoc(battleLogRef, {
      turnNumber: (roomData?.turnNumber ?? 0) + 1,
      actorId: myCard.ownedCardId,
      actorName: myCard.characterName,
      abilityId: ability?.id ?? null,
      abilityName: ability.meta?.name || "Không rõ",
      staminaCost: ability.active?.staminaCost ?? 0,
      targetIds: logs.map((log) => log?.targetId).filter(Boolean),
      resultText: logs.length > 0 ? logs.join(", ") : null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Lỗi khi ghi battle log:", error);
  }

  await updateDoc(doc(db, "rooms", roomId), {
    currentActorId: nextActorId,
    hostCards: actualMyRole === "host" ? updatedMyCards : updatedOpponentCards,
    guestCards:
      actualMyRole === "guest" ? updatedMyCards : updatedOpponentCards,
    turnNumber: (roomData?.turnNumber ?? 0) + 1,
    lastUsedSkill,
    ...(winner
      ? {
          winner,
          winnerName:
            winner === "draw"
              ? null
              : roomData[winner + "Name"] ||
                (winner === "host" ? "Chủ phòng" : "Khách"),
        }
      : {}),
  });

  setSelectedCardId(null);
  setSelectedTargetCardId(null);
  setSelectedAbility(null);
}
