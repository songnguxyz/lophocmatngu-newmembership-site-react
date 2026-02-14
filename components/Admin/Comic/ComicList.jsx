// src/components/Admin/ComicList.jsx
import React from "react";

const ComicList = ({
  comics,
  onApprove,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEdit,
  canMove,
}) => {
  const truncateTitle = (title, maxLength) => {
    if (!title) return ""; // nếu title bị null/undefined thì trả về chuỗi rỗng luôn
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "...";
    }
    return title;
  };

  return (
    <div className="character-list">
      {" "}
      {/* Sử dụng class từ CSS cũ */}
      {comics.map((comic) => (
        <div
          key={comic.id}
          className="character-item"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              marginRight: "10px",
              overflow: "hidden",
            }}
          >
            {" "}
            {/* Div 1: Hình */}
            <img
              src={comic.coverImageUrl|| undefined}
              alt={comic.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "200px" }}>
            {" "}
            {/* Div 2: Tên truyện */}
            <span>{truncateTitle(comic.title, 30)}</span>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            {" "}
            {/* Div 3: Dãy button */}
            <button onClick={() => onApprove(comic.id, comic.approved)}>
              {comic.approved ? "Hủy duyệt" : "Duyệt"}
            </button>
            <button onClick={() => onEdit(comic.id)}>Sửa</button>
            {canMove && (
              <>
                <button onClick={() => onMoveUp(comic.id)}>Lên</button>
                <button onClick={() => onMoveDown(comic.id)}>Xuống</button>
              </>
            )}
            <button onClick={() => onDelete(comic.id)}>Xóa</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComicList;
