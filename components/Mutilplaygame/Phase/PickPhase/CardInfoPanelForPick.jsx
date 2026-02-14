import React, { useState } from "react";
import { InfoTab } from "./InfoTab";
import { AbilityTab } from "./AbilityTab";
import { ItemTab } from "./ItemTab";

const panelStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 13,
  color: "#94a3b8",
  lineHeight: 1.6,
  width: "100%",
  minHeight: 180,
};

export const CardInfoPanelForPick = ({ selectedCard, abilitiesMap }) => {
  const [tab, setTab] = useState("ability"); // ✨ mặc định là "Kỹ năng"

  if (!selectedCard || selectedCard.characterName === "—") {
    return <div style={panelStyle}>Chưa chọn card nào</div>;
  }

  return (
    <div
      style={{ ...panelStyle, padding: 0, overflow: "hidden", fontSize: 13, marginBottom: 2, }}
    >
      {/* Tabs - theo thứ tự mới */}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <button
          onClick={() => setTab("ability")}
          style={getTabStyle(tab === "ability")}
        >
          Kỹ năng
        </button>
        <button
          onClick={() => setTab("item")}
          style={getTabStyle(tab === "item")}
        >
          Trang bị
        </button>
        <button
          onClick={() => setTab("info")}
          style={getTabStyle(tab === "info")}
        >
          Thông tin
        </button>
      </div>

      <div style={{ padding: 8 }}>
        {tab === "info" && <InfoTab selectedCard={selectedCard} />}
        {tab === "ability" && (
          <AbilityTab selectedCard={selectedCard} abilitiesMap={abilitiesMap} />
        )}
        {tab === "item" && <ItemTab selectedCard={selectedCard} />}
      </div>
    </div>
  );
};

const getTabStyle = (active) => ({
  flex: 1,
  padding: "4px 0",
  backgroundColor: active ? "#1e293b" : "#334155",
  border: "none",
  color: "white",
  fontSize: 13,
  fontWeight: "bold",
  cursor: "pointer",
});
