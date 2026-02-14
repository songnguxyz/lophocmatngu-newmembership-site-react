import React from "react";

const CharacterList = ({ characters, onApprove, onDelete, onMoveUp, onMoveDown, renderExtraButtons }) => {
  const truncateTitle = (title, maxLength) => {
    return title && title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  return (
    <div className="character-list">
      {characters.map((character) => (
        <div
          key={character.id}
          className="character-item"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #eee",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              marginRight: "10px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={character.avatarUrl}
              alt={character.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ flex: "1", minWidth: "200px" }}>
            <span>{truncateTitle(character.name, 30)}</span>
          </div>

          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {renderExtraButtons && renderExtraButtons(character)}
            <button onClick={() => onApprove(character.id, character.approved)}>
              {character.approved ? "Hủy duyệt" : "Duyệt"}
            </button>
            <button onClick={() => onMoveUp(character.id)}>Lên</button>
            <button onClick={() => onMoveDown(character.id)}>Xuống</button>
            <button onClick={() => onDelete(character.id)}>Xóa</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharacterList;
