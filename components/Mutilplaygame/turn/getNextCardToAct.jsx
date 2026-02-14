export function getNextCardToAct(cards) {
  if (!cards || cards.length === 0) return null;
  const aliveCards = cards.filter((card) => card.stamina > 0);
  if (aliveCards.length === 0) return null;

  aliveCards.sort((a, b) => (b.actionGauge ?? 0) - (a.actionGauge ?? 0));
  return aliveCards[0];
}
