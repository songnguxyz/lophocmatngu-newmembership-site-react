import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "../../../context/FirebaseContext";
import { getNextCardToAct } from "./getNextCardToAct";
import { recalculateCurrentSpeed } from "../abilityType/battleCalculator";

export default function UpdateRoomTurnStructure({
  myCards,
  opponentCards,
  roomData,
  setRoomData,
}) {
  const { db } = useFirebase();

  useEffect(() => {
    // Chỉ xử lý khi trận chưa bắt đầu
    if (!roomData || roomData.currentActorId || roomData.turnNumber >= 1)
      return;

    // Chờ đủ 5 vs 5
    if (!roomData.hostCards || !roomData.guestCards) return;
    if (roomData.hostCards.length < 5 || roomData.guestCards.length < 5) return;

    const allCards = [...roomData.hostCards, ...roomData.guestCards].map(
      (card) => {
        const stats = card.stats || {};
        const agility = stats["Nhanh nhẹn"] || 0;
        const randomBonus = Math.random() * 10;

        const actionGauge = Math.min(100, agility * 4 + randomBonus);
        const baseSpeed = recalculateCurrentSpeed(card);

        return {
          ...card,
          baseSpeed,
          currentSpeed: baseSpeed,
          actionGauge,
        };
      }
    );

    const currentActor = getNextCardToAct(allCards);
    const currentActorId = currentActor?.ownedCardId || null;

    // Phân lại về host/guest
    const hostCards = allCards.filter((c) =>
      roomData.hostCards.some((s) => s.ownedCardId === c.ownedCardId)
    );
    const guestCards = allCards.filter((c) =>
      roomData.guestCards.some((s) => s.ownedCardId === c.ownedCardId)
    );

    const updateData = {
      hostCards,
      guestCards,
      currentActorId,
      turnNumber: 1,
    };

    // Gửi lên Firestore
    updateDoc(doc(db, "rooms", roomData.id), updateData);
    setRoomData((prev) => ({ ...prev, ...updateData }));
  }, [roomData, db, setRoomData]);

  return null;
}
