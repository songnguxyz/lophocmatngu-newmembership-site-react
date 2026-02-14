import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const defaultSubjects = {
  "Thể dục": 0,
  "Logic": 0,
  "Khoa học": 0,
  "Xã hội": 0,
  "Sáng tạo": 0,
  "Nghệ thuật": 0,
  "Trưởng thành": 0,
};

const subjectOrder = [
  "Thể dục",
  "Logic",
  "Khoa học",
  "Xã hội",
  "Sáng tạo",
  "Nghệ thuật",
  "Trưởng thành",
];

const MAX_TOTAL = 31;

const NhanvatSubjectStatsEditor = ({ character, onUpdate, onClose }) => {
  const [subjects, setSubjects] = useState(
    character.subjectStats || defaultSubjects
  );

  useEffect(() => {
    setSubjects(character.subjectStats || defaultSubjects);
  }, [character]);

  const totalUsed = Object.values(subjects).reduce((sum, val) => sum + val, 0);
  const remainingPoints = MAX_TOTAL - totalUsed;

  const handleChange = (key, value) => {
    const intVal = Math.max(0, Math.min(5, Number(value)));
    const simulatedTotal = totalUsed - subjects[key] + intVal;

    if (simulatedTotal <= MAX_TOTAL) {
      const updated = { ...subjects, [key]: intVal };
      setSubjects(updated);
      onUpdate?.(updated);
    } else {
      alert("⚠️ Tổng điểm vượt quá giới hạn cho phép (35).");
    }
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "characters", character.id);
      await updateDoc(ref, { subjectStats: subjects });
      alert("✅ Đã lưu chỉ số môn học!");
      onClose?.();
    } catch (err) {
      alert("❌ Lỗi khi lưu: " + err.message);
    }
  };

  const handleInit = async () => {
    const ref = doc(db, "characters", character.id);
    await updateDoc(ref, { subjectStats: defaultSubjects });
    setSubjects(defaultSubjects);
    onUpdate?.(defaultSubjects);
    alert("✅ Đã tạo mới chỉ số môn học.");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>
        Chỉ số môn học –{" "}
        <span style={{ color: "#4f46e5" }}>{character.name}</span>
      </h3>
      <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
        Tổng điểm còn lại:{" "}
        <strong style={{ color: remainingPoints < 0 ? "red" : "black" }}>
          {remainingPoints}
        </strong>{" "}
        / {MAX_TOTAL}
      </p>

      {subjectOrder.map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label
            style={{
              minWidth: 110,
              display: "inline-block",
              fontWeight: "bold",
            }}
          >
            {key}:
          </label>
          <input
            type="number"
            min="0"
            max="5"
            value={subjects[key] || 0}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ width: 50 }}
          />
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleSave}
          style={{
            marginRight: 10,
            padding: "8px 16px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          💾 Lưu
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            background: "#999",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ✖ Hủy
        </button>
        <button
          onClick={handleInit}
          style={{
            marginLeft: 10,
            padding: "8px 16px",
            background: "#333",
            color: "white",
            border: "1px dashed #ccc",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ➕ Tạo mặc định
        </button>
      </div>
    </div>
  );
};

export default NhanvatSubjectStatsEditor;
