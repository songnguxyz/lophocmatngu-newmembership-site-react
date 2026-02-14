import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { initializeFieldForCollection } from "../Common/firestoreTools";

const defaultStats = {
  "Sức mạnh": 5,
  "Trí lực": 5,
  "Bền bỉ": 5,
  "May mắn": 5,
  "Nhanh nhẹn": 5,
  "Uy tín": 5,
  "Khéo léo": 5,
};
const statOrder = [
  "Sức mạnh",
  "Trí lực",
  "Bền bỉ",
  "May mắn",
  "Nhanh nhẹn",
  "Uy tín",
  "Khéo léo",
];
const MAX_TOTAL = 40;

const NhanvatStatsEditor = ({ character, onUpdate, onClose }) => {
  const [stats, setStats] = useState(character.stats || defaultStats);

  useEffect(() => {
    setStats(character.stats || defaultStats);
  }, [character]);

  const totalUsed = Object.values(stats).reduce((sum, val) => sum + val, 0);
  const remainingPoints = MAX_TOTAL - totalUsed;

  const handleChange = (key, value) => {
    const intVal = Math.max(0, Math.min(10, Number(value)));
    const simulatedTotal = totalUsed - stats[key] + intVal;

    if (simulatedTotal <= MAX_TOTAL) {
      const updatedStats = { ...stats, [key]: intVal };
      setStats(updatedStats);
      onUpdate?.(updatedStats);
    } else {
      alert("⚠️ Vượt quá giới hạn tổng điểm cho phép!");
    }
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "characters", character.id);
      await updateDoc(ref, { stats });
      alert("✅ Đã lưu chỉ số thành công!");
      onClose?.();
    } catch (err) {
      alert("❌ Lỗi khi lưu: " + err.message);
    }
  };

  const handleInitIfMissing = async () => {
    if (!character.stats) {
      const ref = doc(db, "characters", character.id);
      await updateDoc(ref, { stats: defaultStats });
      setStats(defaultStats);
      onUpdate?.(defaultStats);
      alert("✅ Đã tạo trường stats mặc định cho nhân vật.");
    } else {
      alert("ℹ️ Nhân vật này đã có chỉ số rồi.");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>
        Chỉnh sửa chỉ số{" "}
        <span style={{ color: "#4f46e5" }}>{character.name}</span>
      </h3>
      <p style={{ marginBottom: "12px", fontSize: "0.9rem" }}>
        Tổng điểm còn lại:{" "}
        <strong style={{ color: remainingPoints < 0 ? "red" : "black" }}>
          {remainingPoints}
        </strong>{" "}
        / {MAX_TOTAL}
      </p>

      {statOrder.map((key) => {
        const value = stats[key];
        return (
          <div key={key} style={{ marginBottom: "8px" }}>
            <label
              style={{
                marginRight: "10px",
                minWidth: "90px",
                display: "inline-block",
              }}
            >
              {key}:
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ width: "50px" }}
            />
          </div>
        );
      })}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleSave}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          💾 Lưu
        </button>

        <button
          onClick={onClose}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            background: "#aaa",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ✖ Hủy
        </button>

        <button
          onClick={handleInitIfMissing}
          style={{
            padding: "8px 16px",
            background: "#333",
            color: "white",
            border: "1px dashed #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ➕ Tạo chỉ số mặc định
        </button>
      </div>
    </div>
  );
};

export default NhanvatStatsEditor;
