// ✅ validateCardAction.js - cập nhật để dùng schema mới
export function validateCardAction({ ability, myCard }) {
  const type = ability?.active?.type ?? "";

  const isSilenced = myCard.statusEffects?.some((e) => e.type === "silence");
  if (isSilenced && type !== "duel") {
    alert(
      `${myCard.characterName} đang bị câm lặng và không thể dùng kỹ năng.`
    );
    return false;
  }

  if (myCard.isStunned) {
    alert(`${myCard.characterName} đang bị choáng và không thể hành động.`);
    return false;
  }

  const actionCount = myCard.actionCount ?? 0;
  if (actionCount <= 0) {
    alert(`${myCard.characterName} không thể hành động thêm trong lượt này.`);
    return false;
  }

  return true;
}
