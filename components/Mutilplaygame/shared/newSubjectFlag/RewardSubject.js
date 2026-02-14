// 📁 src/components/Mutilplaygame/components/RewardSubject.jsx
import React, { useState } from "react";
import { SUBJECT_RECIPES } from "./Recipes";

export function RewardSubject({ composedSubjects }) {
  const [selected, setSelected] = useState(null);

  const selectedSubject = SUBJECT_RECIPES.find((s) => s.name === selected);

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        borderRadius: 8,
        padding: 6,
        fontSize: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: selectedSubject ? 8 : 0,
        }}
      >
        {composedSubjects.map((subjectName) => {
          const subject = SUBJECT_RECIPES.find((s) => s.name === subjectName);
          if (!subject) return null;

          const isSelected = selected === subjectName;

          return (
            <div
              key={subjectName}
              onClick={() => setSelected(isSelected ? null : subjectName)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                backgroundColor: "#f3f4f6",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: "pointer",
                border: isSelected ? "2px solid #facc15" : "1px solid #94a3b8",
              }}
              title={subject.name}
            >
              <img
                src={subject.icon}
                alt={subject.name}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  borderRadius: 6,
                }}
              />
            </div>
          );
        })}
      </div>

      {selectedSubject && (
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "6px 8px",
            borderRadius: 6,
            color: "#e2e8f0",
            fontSize: 12.5,
            lineHeight: 1.4,
            borderTop: "1px solid #334155",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#fef9c3" }}>
            {selectedSubject.name}
          </div>

          {/* ✅ Đọc đúng giá trị từ passive */}
          {selectedSubject.passive?.effect && (
            <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>
              {`+${selectedSubject.passive.effect.value}${
                typeof selectedSubject.passive.effect.value === "number"
                  ? "%"
                  : ""
              } ${selectedSubject.passive.effect.stat}${
                selectedSubject.passive.effect.duration
                  ? ` (${selectedSubject.passive.effect.duration} turn)`
                  : ""
              }${
                selectedSubject.passive.effect.stackable ? " [stackable]" : ""
              }`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
