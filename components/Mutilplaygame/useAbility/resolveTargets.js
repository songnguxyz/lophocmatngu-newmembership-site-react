/**
 * Trả về mảng các đối tượng card được chọn làm target,
 */
export function resolveTargets({
  ability,
  myCard,
  myCards,
  opponentCards,
  selectedTargetId,
}) {
  const area = ability?.active?.area;
  const type = ability?.active?.type;

  let targets = [];

  switch (area) {
    case "self":
      if (myCard?.isStunned) {
        alert(
          `${myCard.characterName} đang bị choáng và không thể tự dùng kỹ năng.`
        );
        return [];
      }
      targets = [myCard];
      break;

    case "oneAlly": {
      const ally = myCards.find((c) => c.ownedCardId === selectedTargetId);
      if (ally?.isStunned) {
        alert(
          `${ally.characterName} đang bị choáng và không thể nhận kỹ năng.`
        );
        return [];
      }
      targets = ally ? [ally] : [];
      break;
    }

    case "oneEnemy": {
      const enemy = opponentCards.find(
        (c) => c.ownedCardId === selectedTargetId
      );
      targets = enemy ? [enemy] : [];
      break;
    }

    case "randomEnemy": {
      const randomEnemies = opponentCards.filter((c) => c.stamina > 0);
      targets =
        randomEnemies.length > 0
          ? [randomEnemies[Math.floor(Math.random() * randomEnemies.length)]]
          : [];
      break;
    }

    case "randomAlly": {
      const randomAllies = myCards.filter((c) => c.stamina > 0);
      targets =
        randomAllies.length > 0
          ? [randomAllies[Math.floor(Math.random() * randomAllies.length)]]
          : [];
      break;
    }

    case "allEnemies":
      targets = opponentCards.filter((c) => c.stamina > 0);
      break;

    case "allAllies":
      targets = myCards.filter((c) => c.stamina > 0);
      break;

    default:
      return [];
  }

  return targets;
}
