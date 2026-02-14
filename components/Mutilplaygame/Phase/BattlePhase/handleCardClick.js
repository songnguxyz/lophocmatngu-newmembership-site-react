export function handleCardClick({
  card,
  isMine,
  selectedAbility,
  selectedCardId,
  roomData,
  setSelectedCardId,
  setSelectedTargetId,
}) {
  if (!card) return;

  const isDead = card.stamina <= 0;
  if (isDead) return;

  if (!selectedAbility) {
    if (isMine && card.ownedCardId === roomData?.currentActorId) {
      setSelectedCardId(card.ownedCardId);
    } else if (selectedCardId) {
      setSelectedTargetId(card.ownedCardId);
    }
    return;
  }

  const area = selectedAbility?.active?.area;

  if (area === "self" && isMine) {
    setSelectedTargetId(card.ownedCardId);
  } else if (area === "oneAlly" && isMine && selectedCardId) {
    setSelectedTargetId(card.ownedCardId);
  } else if (area === "oneEnemy" && !isMine && selectedCardId) {
    setSelectedTargetId(card.ownedCardId);
  }
  // ✅ THÊM KHỐI NÀY để hỗ trợ AOE / random
  else if (
    ["allEnemies", "allAllies", "randomAlly", "randomEnemy"].includes(area) &&
    selectedCardId
  ) {
    setSelectedTargetId(card.ownedCardId); // bất kỳ card hợp lệ
  }
}
