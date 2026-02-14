import React from "react";
import { getDebuffIcon } from "./iconMapper";

export default function DebuffEffectDisplay({ debuffs = [] }) {
  // ✅ Gộp debuff theo stat/type
  const mergedDebuffs = debuffs.reduce((acc, debuff) => {
    const key = debuff.stat || debuff.type;
    if (!acc[key]) {
      acc[key] = { ...debuff };
    } else {
      acc[key].value += debuff.value;
      acc[key].duration = Math.max(acc[key].duration, debuff.duration);
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
      {Object.values(mergedDebuffs).map((debuff, idx) => {
        const IconComponent = getDebuffIcon(debuff.stat || debuff.type);
        return (
          <div
            key={idx}
            title={`-${debuff.value ?? ""} ${debuff.stat || debuff.type} (${
              debuff.duration
            })`}
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
            <IconComponent size={14} color="white" />
          </div>
        );
      })}
    </div>
  );
}
