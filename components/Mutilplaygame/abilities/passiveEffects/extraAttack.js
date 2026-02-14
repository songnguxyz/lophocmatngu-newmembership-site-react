// passiveEffects/extraAttack.js

export default async function extraAttackHandler({
  ability,
  sourceCard,
  targetCard,
  roomData,
  updateCard,
  applyLog,
}) {
  updateCard(sourceCard.ownedCardId, {
    hasExtraTurn: true,
  });

  applyLog(
    `${sourceCard.characterName} kích hoạt '${ability.name}' và nhận thêm 1 lượt tấn công!`
  );
}
