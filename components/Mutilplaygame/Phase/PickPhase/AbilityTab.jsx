import React, { useState } from "react";

export const AbilityTab = ({ selectedCard, abilitiesMap }) => {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const passiveTriggersToMerge = ["afterNDuels", "onUseSpecificSkill"];
  const mergedPassiveMap = new Map();

  const allAbilities = abilitiesMap?.[selectedCard?.characterId] || [];

  // Tìm tên kỹ năng có active.type === "duel"
  const duelAbility = allAbilities.find(
    (ab) => ab.skillCategory === "active" && ab.active?.type === "duel"
  );
  const duelSkillName = duelAbility?.name || "Duel"; // fallback nếu không tìm thấy

  const visibleAbilities = allAbilities.filter((ab) => {
    if (ab.skillCategory !== "passive") return true;

    const triggerType = ab.passive?.trigger?.type;
    const shouldMerge = passiveTriggersToMerge.includes(triggerType);

    if (shouldMerge) {
      let key = null;
      if (triggerType === "afterNDuels") key = duelSkillName;
      if (triggerType === "onUseSpecificSkill")
        key = ab.passive.trigger.skillName;

      if (key) {
        if (!mergedPassiveMap.has(key)) mergedPassiveMap.set(key, []);
        mergedPassiveMap.get(key).push(ab);
      }

      return false; // ẩn passive này, vì đã gộp vào kỹ năng chính
    }

    return true;
  });
  


  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 14, color: "#f8fafc" }}>
          {selectedCard?.characterName}
        </div>
        <div style={{ fontSize: 12, color: "#eab308" }}>
          {selectedCard?.gameClass || selectedCard?.class || "Unknown class"}
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
      >
        {visibleAbilities.map((ab) => (
          <img
            key={ab.name}
            src={ab.meta?.imageUrl}
            alt={ab.meta?.name}
            title={ab.meta?.name}
            onClick={() => setSelectedAbility(ab)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              objectFit: "cover",
              cursor: "pointer",
              border:
                selectedAbility?.name === ab.name
                  ? "2px solid #4ade80"
                  : "1px solid #94a3b8",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>

      {selectedAbility && (
        <div style={{ fontSize: 13, color: "#f1f5f9", lineHeight: 1.6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <strong>{selectedAbility.meta?.name}</strong>
            <span style={{ fontSize: 12, color: "#eab308" }}>
              {selectedAbility.active?.type ||
                selectedAbility.passive?.type ||
                "—"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color:
                  selectedAbility.skillCategory === "passive"
                    ? "#22c55e"
                    : "#f87171",
              }}
            >
              {selectedAbility.skillCategory === "passive"
                ? "Nội tại"
                : "Chủ động"}
            </span>
          </div>
          <div style={{ marginBottom: 6 }}>
            {selectedAbility.meta?.description || "Không có mô tả"}

            {/* Passive phụ thuộc vào skill này */}
            {mergedPassiveMap.get(selectedAbility.name)?.map((passive, idx) => (
              <div
                key={idx}
                style={{ marginTop: 4, fontSize: 12, color: "#a5f3fc" }}
              >
                {passive.meta?.description || "(Nội tại phụ trợ)"}
              </div>
            ))}
          </div>

          {selectedAbility.skillCategory !== "passive" &&
            selectedAbility.active?.type !== "duel" && (
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Hiệu lực: {selectedAbility.active?.duration || 0} lượt — Tái sử
                dụng: {selectedAbility.active?.cooldown || 0} lượt
              </div>
            )}
        </div>
      )}
    </>
  );
};
