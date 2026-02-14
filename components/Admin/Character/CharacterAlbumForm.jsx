import React, { useState } from "react";
import { db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import MultiImageUploader from "../Common/MultiImageUploader";
import "./CharacterFormModal.css";

const CharacterAlbumForm = ({
  characterName,
  album = [],
  setAlbum,
  characterId,
  onClose,
}) => {
  const [localAlbum, setLocalAlbum] = useState(album);
  const [newImages, setNewImages] = useState([]);

  const handleUploadSuccess = (uploaded) => {
    setLocalAlbum((prev) => [...prev, ...uploaded]);
    setNewImages([]);
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...localAlbum];
    updated[index].description = value;
    setLocalAlbum(updated);
  };

  const handleRemoveImage = async (imgToRemove) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa ảnh này?");
    if (!confirm) return;

    if (imgToRemove.url) {
      await deleteImageFromUrl(imgToRemove.url);
    }

    setLocalAlbum((prev) => prev.filter((img) => img.url !== imgToRemove.url));
  };

  const handleSaveAlbum = async () => {
    if (!characterId) return;
    const docRef = doc(db, "characters", characterId);
    await updateDoc(docRef, { album: localAlbum });
    setAlbum(localAlbum);
    alert("✅ Đã lưu album ảnh!");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📸 Album ảnh của: {characterName}</h3>

        {/* Upload ảnh mới */}
        <MultiImageUploader
          folder="album"
          images={newImages}
          setImages={setNewImages}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Hiển thị preview ảnh */}
        <div
          className="image-preview-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}
        >
          {localAlbum.map((img, index) => (
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
                alt={`Ảnh ${index}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <textarea
                placeholder="Mô tả ảnh"
                value={img.description || ""}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
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
                onClick={() => handleRemoveImage(img)}
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

        {/* Nút lưu/đóng */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button onClick={handleSaveAlbum}>💾 Lưu Album</button>
          <button onClick={onClose}>✖ Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterAlbumForm;
