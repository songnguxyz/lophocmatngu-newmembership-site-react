// shared/FlagExchangePanel.jsx
import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { FLAG_ICONS } from "./flagUtils";

export function FlagExchangePanel({
  db,
  roomId,
  roomData,
  role,
  user,
  desiredFlag,
  lockedFlags = [],
  onClose,
}) {
  const [selectedFlags, setSelectedFlags] = useState([]);
  const allFlags = roomData.flags?.[role] || [];

  const getAvailableFlags = () => {
    const flagCounts = {};
    for (const { flag, count } of lockedFlags) {
      flagCounts[flag] = (flagCounts[flag] || 0) + count;
    }

    const usedFlagInstance = {};
    return allFlags.map((flag, index) => {
      const maxLock = flagCounts[flag] || 0;
      const used = usedFlagInstance[flag] || 0;
      const isLocked = used < maxLock;
      usedFlagInstance[flag] = used + 1;
      return { flag, index, isLocked };
    });
  };

  const toggleSelect = (flag, index) => {
    const key = `${flag}-${index}`;
    setSelectedFlags((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < 2
        ? [...prev, key]
        : prev
    );
  };

  const handleExchange = async () => {
    if (selectedFlags.length !== 2) return;
    const selectedValues = selectedFlags.map((k) => k.split("-")[0]);

    const newCards = (roomData[role + "Cards"] || []).map((card) => {
      const cardFlags = [...(card.flags || [])];
      let used = 0;
      const updatedFlags = cardFlags.filter((f) => {
        if (used < 3 && selectedValues.includes(f)) {
          selectedValues.splice(selectedValues.indexOf(f), 1);
          used++;
          return false;
        }
        return true;
      });
      return { ...card, flags: updatedFlags };
    });

    const usedCards = newCards.filter(
      (c) =>
        c.flags.length <
        (roomData[role + "Cards"].find((cc) => cc.ownedCardId === c.ownedCardId)
          ?.flags?.length || 99)
    );
    const randomCard = usedCards[Math.floor(Math.random() * usedCards.length)];
    if (randomCard) {
      randomCard.flags = [...(randomCard.flags || []), desiredFlag];
    }

    const updatedFlags = newCards.flatMap((c) => c.flags || []);

    await updateDoc(doc(db, "rooms", roomId), {
      [`flags.${role}`]: updatedFlags,
      [`${role}Cards`]: newCards,
    });

    await addDoc(collection(db, "rooms", roomId, "battleLogs"), {
      turnNumber: roomData.turnNumber ?? 0,
      actorId: null,
      actorName: roomData[role + "Name"] || "Người chơi",
      abilityId: null,
      abilityName: null,
      staminaCost: 0,
      targetIds: [],
      resultText: `🔁 ${
        roomData[role + "Name"] || "Người chơi"
      } đã đổi 2 cờ để lấy ${desiredFlag}`,
      createdAt: serverTimestamp(),
    });

    onClose(); // sẽ xoá khối panel khỏi UI
  };

  const availableFlags = getAvailableFlags();

  useEffect(() => {
    setSelectedFlags([]);
  }, [desiredFlag]);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#1f2937",
        color: "white",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
        Chọn 2 cờ để đổi lấy{" "}
        <span
          style={{
            border: "2px solid red",
            width: 36,
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            fontSize: 22,
            background: "#111827",
          }}
        >
          {FLAG_ICONS[desiredFlag]}
        </span>
      </div>

      {/* Danh sách flag có thể chọn (ẩn flag bị lock) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {availableFlags.map(({ flag, index, isLocked }) => {
          if (isLocked) return null; // ẩn luôn flag đã lock
          const key = `${flag}-${index}`;
          const isSelected = selectedFlags.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleSelect(flag, index)}
              style={{
                background: isSelected ? "#facc15" : "#374151",
                cursor: "pointer",
                padding: "6px",
                fontSize: 20,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              {FLAG_ICONS[flag]}
            </button>
          );
        })}
      </div>

      {/* Nút hành động */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleExchange}
          disabled={selectedFlags.length !== 2}
          style={{
            padding: "6px 12px",
            fontSize: 14,
            background: selectedFlags.length === 2 ? "#10b981" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: selectedFlags.length === 2 ? "pointer" : "not-allowed",
          }}
        >
          Đổi
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "6px 12px",
            fontSize: 14,
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}
