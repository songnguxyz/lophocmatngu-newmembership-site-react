import React from "react";
import { statusIconMapper } from "./iconMapper";

export default function StatusEffectDisplay({ effects }) {
  if (!Array.isArray(effects) || effects.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {effects.map((effect, idx) => {
        const Icon = statusIconMapper[effect.type];
        if (!Icon) return null;

        return (
          <div
            key={idx}
            title={`${effect.type} (${effect.duration})`}
            style={{
              backgroundColor: "red",
              borderRadius: 3,
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 14,
              height: 14,
            }}
          >
            <Icon size={14} color="white" />
          </div>
        );
      })}
    </div>
  );
}
