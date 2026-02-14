import React, { useState } from "react";
import { SUBJECT_RECIPES } from "./Recipes";
import { FLAG_ICONS } from "./flagUtils";
import { FlagExchangePanel } from "./FlagExchangePanel";

function renderSubjectReward(effect) {
  if (!effect) return "Không rõ";

  if (effect.type === "buff") {
    const statNameMap = {
      agiPercent: "Tốc độ (agi%)",
      accuracy: "Độ chính xác",
      critRate: "Tỷ lệ chí mạng",
      critDamage: "Sát thương chí mạng",
      skillAmp: "Sát thương kỹ năng",
      evasion: "Né tránh",
      defend: "Phòng thủ",
      actionGauge: "Tăng thanh hành động",
    };

    const statLabel = statNameMap[effect.stat] || effect.stat;
    const value = effect.value;
    const duration = effect.duration || 0;
    const stackable = effect.stackable ? " (cộng dồn)" : "";

    return `+${value}% ${statLabel} (${duration} lượt)${stackable}`;
  }

  // Các loại hiệu ứng khác (nếu có thêm sau này)
  switch (effect.type) {
    case "statusEffect":
      return `Gây hiệu ứng: ${effect.status}`;
    case "extraAction":
      return `+1 hành động mỗi lượt (${effect.duration || 1} lượt)`;
    case "heal":
      return `Hồi ${effect.value} máu trong ${effect.duration || 1} lượt`;
    case "damageReflect":
      return `Phản ${effect.value}% sát thương`;
    case "damageBoost":
      return `Tăng ${effect.value}% sát thương`;
    default:
      return `Hiệu ứng: ${effect.type}`;
  }
}



export function SubjectModal({
  nextSubjects,
  flags,
  onClose,
  onCompose,
  isMyTurn,
  db,
  roomId,
  roomData,
  role,
  user,
}) {
  const [exchangeTarget, setExchangeTarget] = useState(null);

  const getFlagStatus = (subject) => {
    const flagCount = flags.reduce((acc, f) => {
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    }, {});
    return subject.requiredFlags.map((f, i) => {
      const usedSoFar = subject.requiredFlags
        .slice(0, i)
        .filter((x) => x === f).length;
      const isOwned = (flagCount[f] || 0) > usedSoFar;
      return { flag: f, isOwned };
    });
  };

  const handleExchange = (flag, requiredFlags) => {
    const lockedFlags = requiredFlags.reduce((acc, f) => {
      const existing = acc.find((e) => e.flag === f);
      if (existing) existing.count += 1;
      else acc.push({ flag: f, count: 1 });
      return acc;
    }, []);
    setExchangeTarget({
      desiredFlag: flag,
      lockedFlags,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#1f2937",
          padding: 20,
          borderRadius: 10,
          width: "95vw",
          maxWidth: 700,
          color: "white",
          display: "flex",
          gap: 20,
        }}
      >
        {/* Bên trái: Danh sách môn học */}
        <div style={{ flex: 1 }}>
          {nextSubjects.map((subjectName) => {
            const subject = SUBJECT_RECIPES.find((s) => s.name === subjectName);
            const flagStatus = getFlagStatus(subject);
            const hasAll = flagStatus.every((f) => f.isOwned);

            return (
              <div
                key={subjectName}
                style={{
                  background: hasAll ? "#065f46" : "#374151",
                  border: hasAll ? "2px solid #10b981" : "1px solid #9ca3af",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {subject.name}:
                  <span
                    style={{ fontSize: 12, color: "#f59e0b", marginLeft: 6 }}
                  >
                    {renderSubjectReward(subject.passive.effect)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {/* Icon môn học */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      background: hasAll ? "#064e3b" : "#1f2937",
                      border: hasAll
                        ? "2px solid #10b981"
                        : "2px solid #6b7280",
                    }}
                  >
                    <img
                      src={subject.icon}
                      alt={subject.name}
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Các icon flag */}
                  {flagStatus.map(({ flag, isOwned }, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (!isOwned)
                          handleExchange(flag, subject.requiredFlags);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        backgroundColor: isOwned ? "#064e3b" : "#1f2937",
                        border: isOwned ? "2px solid #10b981" : "2px solid red",
                        cursor: isOwned ? "default" : "pointer",
                      }}
                    >
                      {FLAG_ICONS[flag]}
                    </div>
                  ))}

                  {/* Nút ghép */}
                  <button
                    onClick={() =>
                      onCompose(subject.name, [...subject.requiredFlags])
                    }
                    disabled={!hasAll || !isMyTurn}
                    style={{
                      marginLeft: 6,
                      padding: "4px 6px",
                      fontSize: 12,
                      backgroundColor:
                        hasAll && isMyTurn ? "#2563eb" : "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: hasAll && isMyTurn ? "pointer" : "not-allowed",
                    }}
                  >
                    Ghép
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bên phải: Hòm cờ + Panel đổi cờ */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            Cờ của bạn:
            <button
              onClick={onClose}
              style={{
                float: "right",
                background: "#dc2626",
                border: "none",
                borderRadius: 4,
                color: "white",
                padding: "0 6px",
                cursor: "pointer",
              }}
            >
              x
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(32px, 1fr))",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {Array.from({ length: 14 }).map((_, idx) => {
              const flag = flags[idx];
              const isOwned = Boolean(flag);

              return (
                <div
                  key={idx}
                  style={{
                    width: 36,
                    height: 36,
                    fontSize: 20,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isOwned ? "#1f2937" : "#111827", // nền đậm cho có cờ, nhạt hơn cho ô trống
                    border: isOwned ? "1px solid #39b54a" : "1px solid #4b5563",
                    color: isOwned ? "#facc15" : "#6b7280", // màu icon nếu có
                    opacity: isOwned ? 1 : 0.5,
                  }}
                >
                  {isOwned ? FLAG_ICONS[flag] : null}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 4 }}>
            Có thể đổi 2 cờ bất kỳ, thành 1 cờ còn thiếu
            <br />
            Bấm vào ô cờ còn thiếu để đổi
          </div>

          {exchangeTarget && (
            <FlagExchangePanel
              db={db}
              roomId={roomId}
              roomData={roomData}
              role={role}
              user={user}
              desiredFlag={exchangeTarget.desiredFlag}
              lockedFlags={exchangeTarget.lockedFlags}
              onClose={() => setExchangeTarget(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
