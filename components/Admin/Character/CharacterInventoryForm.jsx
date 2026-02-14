import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import MultiImageUploader from "../Common/MultiImageUploader";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import "./CharacterFormModal.css";

const CharacterInventoryForm = ({
  characterId,
  inventory: initialInventory = [],
  onClose,
}) => {
  const [inventory, setInventory] = useState(initialInventory);
  const [newImages, setNewImages] = useState([]);

  const handleUploadSuccess = (uploaded) => {
    setInventory((prev) => [...prev, ...uploaded]);
    setNewImages([]);
  };

  const handleDescChange = (index, newDesc) => {
    const updated = [...inventory];
    updated[index].description = newDesc;
    setInventory(updated);
  };

  const handleDelete = async (img) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    try {
      if (img.url) {
        await deleteImageFromUrl(img.url); // chỉ truyền string
      }
      setInventory((prev) => prev.filter((item) => item.url !== img.url));
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "characters", characterId), {
        inventory,
      });
      alert("✅ Đã lưu danh sách đồ đạc!");
      onClose?.();
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("❌ Có lỗi xảy ra khi lưu.");
    }
  };

  return (
    <div>
      <h3>🎒 Quản lý đồ đạc nhân vật</h3>

      {/* Uploader */}
      <MultiImageUploader
        folder="inventory"
        images={newImages}
        setImages={setNewImages}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Hiển thị danh sách ảnh */}
      <div
        className="image-preview-grid"
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}
      >
        {inventory.map((img, index) => (
          <div
            key={`${index}-${img.url}`}
            className="image-preview-card"
            style={{
              width: 160,
              border: "1px solid #ccc",
              padding: 10,
              borderRadius: 8,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "#fff",
            }}
          >
            <img
              src={img.url}
              alt={`item-${index}`}
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
            <textarea
              placeholder="Mô tả đồ"
              value={img.description || ""}
              onChange={(e) => handleDescChange(index, e.target.value)}
              rows={2}
              style={{
                width: "100%",
                fontSize: "0.8em",
                padding: 6,
                borderRadius: 4,
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
            <button
              onClick={() => handleDelete(img)}
              style={{
                background: "transparent",
                color: "#f00",
                border: "none",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ❌ Xóa
            </button>
          </div>
        ))}
      </div>

      {/* Nút hành động */}
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <button onClick={handleSave}>💾 Lưu</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          ✖️ Đóng
        </button>
      </div>
    </div>
  );
};

export default CharacterInventoryForm;
