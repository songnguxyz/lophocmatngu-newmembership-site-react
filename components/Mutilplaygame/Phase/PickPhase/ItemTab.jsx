import React, { useState } from "react";

const SLOT_ORDER = ["weapon", "helmet", "amulet", "gloves", "armor", "boots"];
const SLOT_LABELS = {
  weapon: "Vũ khí",
  helmet: "Mũ",
  amulet: "Vòng",
  gloves: "Găng",
  armor: "Giáp",
  boots: "Giày",
};

export const ItemTab = ({ selectedCard }) => {
  const [selectedItemSlot, setSelectedItemSlot] = useState(null);
  const equippedItems = selectedCard?.equippedItems ?? {};
  const selectedItem = equippedItems[selectedItemSlot];

  return (
    <>
      {/* Tiêu đề nhân vật */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            marginTop: 2,
            fontWeight: "bold",
            fontSize: 14,
            color: "#f8fafc",
          }}
        >
          {selectedCard?.characterName}
        </div>
        <div style={{ fontSize: 12, color: "#eab308" }}>
          {selectedCard?.gameClass || selectedCard?.class || "Unknown class"}
        </div>
      </div>

      {/* Lưới item */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
          marginBottom: 6,
        }}
      >
        {SLOT_ORDER.map((slot) => {
          const item = equippedItems[slot];
          const isSelected = selectedItemSlot === slot;

          return (
            <div
              key={slot}
              onClick={() =>
                item ? setSelectedItemSlot(slot) : setSelectedItemSlot(null)
              }
              title={item?.name || SLOT_LABELS[slot]}
              style={{
                width: "50px",
                aspectRatio: "1",
                borderRadius: 6,
                backgroundColor: "#1e293b",
                border: isSelected ? "2px solid #4ade80" : "1px solid #475569",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: item ? "pointer" : "default",
              }}
            >
              {item?.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    textAlign: "center",
                    padding: 4,
                  }}
                >
                  {SLOT_LABELS[slot]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chi tiết item */}
      {selectedItem && (
        <div style={{ fontSize: 13, color: "#f1f5f9", lineHeight: 1.6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <strong>{selectedItem.name}</strong>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#38bdf8",
              }}
            >
              {SLOT_LABELS[selectedItem.slot] || selectedItem.slot}
            </span>
          </div>

          {selectedItem.description && (
            <div style={{ marginBottom: 4, fontSize: 12, color: "#94a3b8" }}>
              {selectedItem.description}
            </div>
          )}

          {selectedItem.statBonus && (
            <div style={{ fontSize: 12, color: "#22d3ee" }}>
              {Object.entries(selectedItem.statBonus).map(([key, value]) => (
                <div key={key}>
                  +{value} {key}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
