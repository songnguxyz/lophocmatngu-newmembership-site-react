import React from "react";
import { MAX_TURN_LIMIT } from "../../shared/victoryUtils";

export function PlayerStatusBar({
  myFlagCount,
  opponentFlagCount,
  mySubjectCount,
  opponentSubjectCount,
  currentTurnNumber,
  countdown,
  roomData,
  onExit,
}) {
  const inExtraRound = currentTurnNumber >= MAX_TURN_LIMIT + 1;
  const extraRoundNumber = currentTurnNumber - MAX_TURN_LIMIT;

  const middleText = roomData?.winner
    ? roomData.winner === "draw"
      ? "🤝 Hòa!"
      : `🎉 ${roomData.winnerName || "Thắng!"}`
    : `⏳ ${countdown}s · ${
        inExtraRound
          ? `🧨 Hiệp phụ ${extraRoundNumber}`
          : `Hiệp ${currentTurnNumber}/${MAX_TURN_LIMIT}`
      }`;

  return (
    <div
      style={{
        backgroundColor: "transparent",
        borderRadius: 8,
        padding: 8,
        width: "100%",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 12,
        boxSizing: "border-box",
      }}
    >
      {/* Dòng 1: Tôi - Địch */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        {/* Tôi */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#16a34a",
            color: "white",
            padding: "4px 6px",
            borderRadius: 6,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 11,
          }}
        >
          Tôi 🎓{mySubjectCount} 🏁{myFlagCount}
        </div>

        {/* Địch */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#dc2626",
            color: "white",
            padding: "4px 6px",
            borderRadius: 6,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 11,
          }}
        >
          Địch 🎓{opponentSubjectCount} 🏁{opponentFlagCount}
        </div>
      </div>

      {/* Dòng 2: Thông tin lượt/hiệp */}
      <div
        style={{
          marginTop: 6,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 500,
          color: "#111827",
          width: "100%",
          whiteSpace: "nowrap",
        }}
      >
        {middleText}
      </div>

      {/* Nút Thoát nếu có kết quả */}
      {roomData?.winner && (
        <button
          onClick={onExit}
          style={{
            marginTop: 6,
            padding: "4px 8px",
            fontSize: 11,
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Thoát
        </button>
      )}
    </div>
  );
}
