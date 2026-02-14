// src/components/Admin/Common/ImageUploader.jsx

import React, { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import { v4 as uuidv4 } from "uuid";

const ImageUploader = ({
  folder = "uploads",
  label = "Chọn ảnh",
  defaultImage = "",
  onUploadSuccess,
  width = 120,
  height = 120,
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Hiển thị ảnh xem trước
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const ext = file.name.slice(file.name.lastIndexOf("."));
      const uniqueName = `${uuidv4()}${ext}`;
      const storageRef = ref(storage, `${folder}/${uniqueName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onUploadSuccess && onUploadSuccess(url);
    } catch (err) {
      console.error("❌ Upload lỗi:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    } else {
      console.warn("⚠️ Không tìm thấy inputRef trong ImageUploader");
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: "bold" }}>{label}</label>
      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: 8,
          padding: 10,
          textAlign: "center",
          background: "#fafafa",
          cursor: "pointer",
          marginTop: 8,
        }}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        {isUploading ? (
          <p style={{ color: "orange" }}>Đang tải ảnh...</p>
        ) : preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width,
              height,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          <p>Kéo ảnh vào đây hoặc nhấn để chọn</p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
