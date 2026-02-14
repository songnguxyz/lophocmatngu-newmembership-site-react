// ✅ AbilitySelectionHandler.jsx - sửa lỗi cast cho allEnemies, allAllies, randomX
import { useEffect } from "react";
import { resolveTargets } from "../useAbility/resolveTargets";
import { validateCardAction } from "../useAbility/validateCardAction";

export default function AbilitySelectionHandler({
  selectedCard,
  selectedAbility,
  selectedTargetId,
  myCards,
  opponentCards,
  roomData,
  role,
  opponentRole,
  handleUseAbility,
  setSelectedCardId,
  setSelectedTargetCardId,
  setSelectedAbility,
  availableAbilitiesMap, // ✅ đổi từ availableAbilitiesMapRef thành availableAbilitiesMap
}) {
  useEffect(() => {
    if (
      !selectedCard ||
      !selectedAbility ||
      selectedCard.ownedCardId !== roomData?.currentActorId
    )
      return;
    if (selectedAbility?.skillCategory === "passive") return;

    const canAct = validateCardAction({
      ability: selectedAbility,
      myCard: selectedCard,
    });

    if (!canAct) return;

    // ✅ Khi đã chọn target bất kỳ → resolve + cast
    if (selectedTargetId) {
      const targets = resolveTargets({
        ability: selectedAbility,
        myCard: selectedCard,
        myCards,
        opponentCards,
        selectedTargetId,
      });

      if (targets.length === 0) return;

      handleUseAbility({
        ability: selectedAbility,
        myCard: selectedCard,
        myCards,
        opponentCards,
        roomData,
        roomId: roomData?.id,
        role,
        opponentRole,
        selectedTargetId,
        setSelectedCardId,
        setSelectedTargetCardId,
        setSelectedAbility,
        availableAbilitiesMap, // ✅ truyền .current thay vì ref
      });

      if ((selectedCard?.actionCount ?? 0) <= 1) setSelectedCardId(null);
      setSelectedAbility(null);
      setSelectedTargetCardId(null);
    }
  }, [selectedCard, selectedAbility, selectedTargetId]);

  return null;
}
