import React, { useState, useEffect } from "react";

export function DemoPage() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerHeight = isDesktop ? 390 : 390;
  const containerWidth = containerHeight * 2.164;
  const avatarSize = containerHeight * 0.175;
  const selectedCardSize = containerHeight * 0.18;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fef2f2",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "row",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            width: "55%",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            boxSizing: "border-box",
          }}
        >
          {/* 1. Pick Card + Confirm/Cancel */}
          <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
            <div
              style={{
                display: "flex",
                gap: 4,
                flex: 1,
              }}
            >
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: selectedCardSize,
                    height: selectedCardSize,
                    backgroundColor: "#ddd",
                    borderRadius: 4,
                  }}
                ></div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                justifyContent: "space-between",
              }}
            >
              <button
                style={{
                  padding: "6px 8px",
                  fontSize: 12,
                  backgroundColor: "#4ade80",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                ✅ Xác nhận
              </button>
              <button
                style={{
                  padding: "6px 8px",
                  fontSize: 12,
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                ❌ Hủy chọn
              </button>
            </div>
          </div>

          {/* 2. Search + Filter */}
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 4,
              overflowX: "auto",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm..."
              style={{
                padding: "4px 6px",
                fontSize: 12,
                width: "40%",
                minWidth: 80,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            {["Fighter", "Mage", "Tank", "Assassin", "Support"].map((cls) => (
              <button
                key={cls}
                style={{
                  padding: "4px 6px",
                  fontSize: 12,
                  backgroundColor: "#e2e8f0",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* 3. Grid Avatar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 4,
              overflowY: "auto",
              flex: 1,
            }}
          >
            {Array.from({ length: 18 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  backgroundColor: "#cbd5e1",
                  borderRadius: 4,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: "45%",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            boxSizing: "border-box",
          }}
        >
          {/* Button tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {["Kỹ năng", "Trang bị", "Thông tin"].map((tab) => (
              <button
                key={tab}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  fontSize: 12,
                  backgroundColor: "#e5e7eb",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Card Info */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#f1f5f9",
              padding: 6,
              borderRadius: 4,
              fontSize: 13,
              overflowY: "auto",
            }}
          >
            Đây là nội dung giả lập cho tab được chọn. Khi bấm tab, dòng này sẽ
            thay đổi nội dung.
          </div>
        </div>
      </div>
    </div>
  );
}
