// src/components/Admin/Comic/ChapterList.jsx
import React from "react";
import "./ComicManager.css";

const ChapterList = ({
  chapters = [],
  onEdit,
  onDelete,
  onSwap,
  onToggleApprove,
}) => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return <p>Chưa có chương nào.</p>;
  }

  const truncateTitle = (title, maxLength) => {
    if (!title) return "";
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  return (
    <div className="chapter-list">
      {chapters.map((chap, idx) => (
        <div
          key={chap.id}
          className="chapter-item"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              marginRight: "12px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={chap.coverUrl || undefined}
              alt={chap.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "0" }}>
            <span className="chapter-title">
              {truncateTitle(chap.title, 30)}
              {chap.isPremium && <span className="premium"> (Premium)</span>}
            </span>
          </div>
          <div
            className="chapter-controls"
            style={{ display: "flex", gap: "6px", marginLeft: "12px" }}
          >
            <button onClick={() => onEdit(chap)}>Sửa</button>
            <button
              onClick={() => idx > 0 && onSwap(chapters[idx - 1].id, chap.id)}
              disabled={idx === 0}
            >
              Lên
            </button>
            <button
              onClick={() =>
                idx < chapters.length - 1 &&
                onSwap(chap.id, chapters[idx + 1].id)
              }
              disabled={idx === chapters.length - 1}
            >
              Xuống
            </button>
            <button onClick={() => onToggleApprove(chap.id, chap.approved)}>
              {chap.approved ? "Hủy duyệt" : "Duyệt"}
            </button>
            <button onClick={() => onDelete(chap.id)}>Xóa</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterList;
