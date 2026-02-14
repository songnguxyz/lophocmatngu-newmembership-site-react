
export const MAX_TURN_LIMIT = 90;

export function checkVictoryCondition({ roomData, myRole, opponentRole }) {
  const turnNumber = roomData.turnNumber ?? 0;

  const mySubjects = roomData.obtainedSubjects?.[myRole] || [];
  const opponentSubjects = roomData.obtainedSubjects?.[opponentRole] || [];

  const myFlags = roomData.flags?.[myRole] || [];
  const opponentFlags = roomData.flags?.[opponentRole] || [];

  // 🚨 Khi đến lượt giới hạn, áp dụng luật so sánh
  if (turnNumber >= MAX_TURN_LIMIT) {
    if (mySubjects.length > opponentSubjects.length) return myRole;
    if (opponentSubjects.length > mySubjects.length) return opponentRole;

    if (myFlags.length > opponentFlags.length) return myRole;
    if (opponentFlags.length > myFlags.length) return opponentRole;

    // Nếu bằng nhau thì tiếp tục chơi overtime
    return null;
  }

  // 🚨 Overtime sau giới hạn: ai có nhiều flag hơn sẽ thắng
  if (turnNumber > MAX_TURN_LIMIT) {
    if (myFlags.length > opponentFlags.length) return myRole;
    if (opponentFlags.length > myFlags.length) return opponentRole;
  }

  return null;
}
