export function AbilityTooltipOverlay({
  ability,
  onClose,
  mergedPassives = [],
  hiddenPassiveKeys = new Set(),
}) {
  if (!ability) return null;

  const isPassive = ability.skillCategory === "passive";
  const abilityType =
    ability.meta?.effect?.type ||
    ability.active?.type ||
    ability.passive?.type ||
    "—";
  const duration = ability.active?.duration ?? 0;
  const cooldown = ability.active?.cooldown ?? 0;

  return (
    <div
      onClick={onClose}
      style={{
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        padding: "2px 2px",
        borderRadius: 8,
        fontSize: 12.5,
        zIndex: 999,
        maxWidth: 200,
        minWidth: 180,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        lineHeight: 1.3,
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: 13.5,
          color: "#f8fafc",
          borderBottom: "1px solid #334155",
          paddingBottom: 2,
          marginBottom: 2,
        }}
      >
        {ability.meta?.name}
      </div>

      <div
        style={{
          fontSize: 10.5,
          color: "#e2e8f0",
          marginBottom: 2,
        }}
      >
        <span style={{ color: "#eab308" }}>{abilityType}</span> —{" "}
        <span
          style={{
            color: isPassive ? "#22c55e" : "#f87171",
            fontWeight: 500,
          }}
        >
          {isPassive ? "Nội tại" : "Chủ động"}
        </span>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#f9fafb",
          marginBottom: 3,
          borderBottom: "1px solid #334155",
          paddingBottom: 3,
        }}
      >
        {ability.meta?.description || "Không có mô tả"}
        {mergedPassives.length > 0 && (
          <div style={{ fontSize: 11.5, marginTop: 4 }}>
            {mergedPassives.map((p, idx) => (
              <div style={{ fontSize: 12, color: "#67e8f9" }}>
                {p.meta?.description || "—"}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isPassive && (
        <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.3 }}>
          <div>Hiệu lực: {duration} lượt</div>
          <div>Tái sử dụng: {cooldown} lượt</div>
        </div>
      )}
      {/* Nếu có passive gộp, hiển thị bên dưới mô tả chính */}
    </div>
  );
}
