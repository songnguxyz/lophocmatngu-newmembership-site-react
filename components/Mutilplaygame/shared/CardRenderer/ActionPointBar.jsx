import React from "react";

export function ActionPointBar({ actionCount = 0 }) {
  if (actionCount <= 0) return null;

  const maxPoints = 5;
  const displayCount = Math.min(actionCount, maxPoints);

  return (
    <div
      title={`Action Points: ${actionCount}`}
      style={{
        display: "flex",
        gap: 0,
        marginTop: 0,
        marginBottom: 2,
        justifyContent: "center",
      }}
    >
      {Array.from({ length: displayCount }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height: 4,
            width: 8,
            backgroundColor: "#facc15", // màu vàng sáng
            border: "1px solid black",
            borderRadius: 2,
            boxShadow: "0 0 1px rgba(0,0,0,0.8)",
          }}
        />
      ))}
    </div>
  );
}
