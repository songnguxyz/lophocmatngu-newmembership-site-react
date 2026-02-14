// src/components/Mutilplaygame/useAbility/index.js
import { validateCardAction } from "./validateCardAction.js";
import { resolveTargets } from "./resolveTargets";
import { applyAbilityEffect } from "./applyAbilityEffect";
import { postAbilityUpdate } from "./postAbilityUpdate";
import { updateDoc, doc } from "firebase/firestore"; // ← thêm


/**
 * db: Firestore instance
 * setMyCards, setOpponentCards: setter UI
 */
export function useAbility({ db, setMyCards, setOpponentCards, onFloatingDamage }) {
  const handleUseAbility = async ({
    ability,
    myCard,
    myCards,
    opponentCards,
    roomData,
    roomId,
    role,
    opponentRole,
    selectedTargetId,
    setSelectedCardId,
    setSelectedTargetCardId,
    setSelectedAbility,
    availableAbilitiesMap, // ✅ đổi từ Ref → object thường
  }) => {
    if (!ability || !myCard) return;
    if (!validateCardAction({ ability, myCard })) return;

    const actualTargets = resolveTargets({
      ability,
      myCard,
      myCards,
      opponentCards,
      selectedTargetId,
    });
    if (actualTargets.length === 0) {
      alert("Không có mục tiêu hợp lệ để dùng kỹ năng.");
      return;
    }

    // --- TẠO updateRoom để DuelAbility có thể gọi ---
    const updateRoom = (data) => updateDoc(doc(db, "rooms", roomId), data);

    // GỌI applyAbilityEffect với updateRoom
    const { newMyCards, newOpponentCards, logs, lastUsedSkill } =
      await applyAbilityEffect({
        db,
        roomId,
        ability,
        myCard,
        actualTargets,
        roomData,
        role,
        opponentRole,
        updateRoom,
        onFloatingDamage,
        availableAbilitiesMap, // ✅ đổi từ Ref → object thường
      });

    await postAbilityUpdate({
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
      lastUsedSkill, // ✅ thêm dòng này
      availableAbilitiesMap, // ✅ đổi từ Ref → object thường
    });
  };

  return { handleUseAbility };
}
