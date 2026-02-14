import React from "react";
import { getBuffIcon } from "./iconMapper";

export default function BuffEffectDisplay({ buffs = [] }) {
  // ✅ Gộp các buff theo `stat`
  const mergedBuffs = buffs.reduce((acc, buff) => {
    const stat = buff.stat;
    if (!acc[stat]) {
      acc[stat] = { ...buff };
    } else {
      acc[stat].value += buff.value;
      acc[stat].duration = Math.max(acc[stat].duration, buff.duration);
    }
    return acc;
  }, {});

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {Object.values(mergedBuffs).map((buff, idx) => {
        const IconComponent = getBuffIcon(buff.stat);
        return (
          <div
            key={idx}
            title={`+${buff.value} ${buff.stat} (${buff.duration})`}
            style={{
              backgroundColor: "blue",
              borderRadius: 3,
              padding: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 14,
              height: 14,
            }}
          >
            <IconComponent size={14} color="white" />
          </div>
        );
      })}
    </div>
  );
}
