import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { applyTurnEffects } from "../../turn/applyTurnEffects";
import { getNextCardToAct } from "../../turn/getNextCardToAct";
import { checkVictoryCondition } from "../../shared/victoryUtils";

export async function handleSkipTurn({ db, roomId, roomData, currentCard,role }) {
  if (!currentCard || !roomData) return;
  const isMyTurn = roomData[role + "Cards"]?.some(
    (c) => c.ownedCardId === currentCard.ownedCardId
  );
  if (!isMyTurn) return; // ✅ chỉ phía có lượt thực sự mới ghi
  const turnNumber = (roomData.turnNumber ?? 0) + 1;

  // ✅ 1. Xác định lý do không thể hành động
  const isStunned = currentCard.statusEffects?.some((e) => e.type === "stun");
  const isSilenced = currentCard.statusEffects?.some(
    (e) => e.type === "silence"
  );
  const isDead = currentCard.stamina <= 0;

  let reasonText = "không thể hành động";
  if (isDead) reasonText = "đã bị hạ gục";
  else if (isStunned) reasonText = "bị choáng (Stun)";
  else if (isSilenced) reasonText = "bị câm lặng (Silence)";

  // ✅ 2. Ghi 1 dòng log duy nhất cho skip turn
  await addDoc(collection(db, "rooms", roomId, "battleLogs"), {
    turnNumber,
    actorId: currentCard.ownedCardId,
    actorName: currentCard.characterName,
    abilityId: null,
    abilityName: null,
    staminaCost: 0,
    targetIds: [],
    resultText: `💫 ${currentCard.characterName} ${reasonText} và không thể hành động!`,
    createdAt: serverTimestamp(),
  });

  // ✅ 3. Delay nhẹ để log hiển thị trước
  await new Promise((res) => setTimeout(res, 500));

  // ✅ 4. Áp dụng hiệu ứng theo lượt và reset actionGauge
  let updatedAllCards = applyTurnEffects(
    [...roomData.hostCards, ...roomData.guestCards],
    currentCard.ownedCardId
  );

  updatedAllCards = updatedAllCards.map((c) =>
    c.ownedCardId === currentCard.ownedCardId ? { ...c, actionGauge: 0 } : c
  );

  const nextCard = getNextCardToAct(updatedAllCards);

  const updatedHostCards = updatedAllCards.filter((c) =>
    roomData.hostCards?.some((m) => m.ownedCardId === c.ownedCardId)
  );
  const updatedGuestCards = updatedAllCards.filter((c) =>
    roomData.guestCards?.some((m) => m.ownedCardId === c.ownedCardId)
  );

  const updatedFlags = {
    host: updatedHostCards.flatMap((c) => c.flags || []),
    guest: updatedGuestCards.flatMap((c) => c.flags || []),
  };

  const actualMyRole = roomData.hostCards.some(
    (c) => c.ownedCardId === currentCard.ownedCardId
  )
    ? "host"
    : "guest";
  const actualOpponentRole = actualMyRole === "host" ? "guest" : "host";

  const winner = checkVictoryCondition({
    roomData: {
      ...roomData,
      flags: updatedFlags,
      turnNumber,
    },
    myRole: actualMyRole,
    opponentRole: actualOpponentRole,
  });

  // ✅ 5. Cập nhật Firestore
  await updateDoc(doc(db, "rooms", roomId), {
    hostCards: updatedHostCards,
    guestCards: updatedGuestCards,
    currentActorId: nextCard?.ownedCardId || null,
    turnNumber,
    flags: updatedFlags,
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
}
