//shared/StaminaBar.js
import React from "react";
import { calculateMaxStamina } from "../../abilityType/battleCalculator";

export function StaminaBar({ card }) {
  const maxStamina = card.maxStamina ?? calculateMaxStamina(card);
  const current = card.stamina ?? 0;
  const percent = Math.min((current / maxStamina) * 100, 100);

  const barColor =
    current > 16 ? "#22c55e" : current > 8 ? "#facc15" : "#ef4444";

  return (
    <div
      title={`Stamina: ${current}/${maxStamina}`}
      style={{
        background: "#ddd",
        borderRadius: 4,
        height: 8, // tăng chiều cao từ 8 lên 12
        width: "100%",
        marginTop: 2,
        marginBottom: 0,
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          backgroundColor: barColor,
        }}
      ></div>
    </div>
  );
}
