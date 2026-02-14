// 📁 src/components/Mutilplaygame/utils/getFlagFromCard.js

export function getFlagFromCard(card) {
  if (!card?.stats) return null;

  const statEntries = Object.entries(card.stats);
  if (statEntries.length === 0) return null;

  const total = statEntries.reduce((sum, [_, val]) => sum + val, 0);
  if (total === 0) return null;

  const weighted = [];
  for (const [stat, val] of statEntries) {
    for (let i = 0; i < val; i++) {
      weighted.push(stat);
    }
  }

  const randomIndex = Math.floor(Math.random() * weighted.length);
  return weighted[randomIndex] || null;
}