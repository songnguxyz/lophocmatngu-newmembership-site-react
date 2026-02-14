import React from "react";

export function ActionGaugeBar({ card }) {
  const gauge = Math.min(100, card.actionGauge || 0);
  return (
    <div
      title={`Action Gauge: ${gauge}`}
      style={{
        background: "#ddd",
        borderRadius: 4,
        height: 6,
        width: "100%",
        marginTop: 2,
        marginBottom: 2,
      }}
    >
      <div
        style={{
          width: `${gauge}%`,
          height: "100%",
          backgroundColor: "#0ea5e9",
        }}
      ></div>
    </div>
  );
}
