// MultiImageUploader.jsx
import React, { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../../firebase";

const MultiImageUploader = ({
  folder = "uploads",
  onUploadSuccess,
  clearAfterUpload = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); // Thêm ref

  const handleFiles = (files) => {
    const fileArray = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...fileArray]);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Bạn chưa chọn ảnh nào!");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImages = [];
      for (const img of selectedFiles) {
        const ext = img.file.name.slice(img.file.name.lastIndexOf("."));
        const uniqueName = `${uuidv4()}${ext}`;
        const storageRef = ref(storage, `${folder}/${uniqueName}`);
        await uploadBytes(storageRef, img.file);
        const url = await getDownloadURL(storageRef);
        uploadedImages.push({ url, description: "" });
      }
      onUploadSuccess(uploadedImages);
      if (clearAfterUpload) {
        setSelectedFiles([]);
      }
    } catch (err) {
      console.error("Upload lỗi:", err);
      alert("Có lỗi khi upload ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Sử dụng ref để kích hoạt input
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ccc",
          borderRadius: 8,
          padding: "10px",
          textAlign: "center",
          background: "#fafafa",
          cursor: "pointer",
          marginBottom: 10,
        }}
        onClick={handleClick} // Gọi handleClick khi click vào div
      >
        <input
          ref={fileInputRef} // Gán ref cho input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        <p>Kéo nhiều ảnh vào đây hoặc nhấn để chọn</p>
      </div>

      {selectedFiles.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {selectedFiles.map((img, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={img.preview}
                alt={`Ảnh ${idx}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "transparent",
                  color: "red",
                  border: "none",
                  fontSize: 18,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Đang tải..." : "Upload ảnh đã chọn"}
        </button>
      </div>
    </div>
  );
};

export default MultiImageUploader;
