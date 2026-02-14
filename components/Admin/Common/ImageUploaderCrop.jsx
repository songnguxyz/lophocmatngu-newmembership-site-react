import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";
import { storage } from "../../../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ImageUploaderCrop = ({
  folder = "uploads",
  onUploadSuccess,
  label = "Chọn ảnh",
  defaultImage = "",
}) => {
  const [imageSrc, setImageSrc] = useState(defaultImage || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(undefined);

  const [oldImageUrl, setOldImageUrl] = useState(defaultImage || "");

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadImage = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadCropped = async () => {
    try {
      setIsCropping(true);

      // 👉 Nếu có ảnh cũ, xoá trước
      if (oldImageUrl) {
        const decodedPath = decodeURIComponent(
          oldImageUrl.split("/o/")[1].split("?")[0]
        );
        const oldRef = ref(storage, decodedPath);
        await deleteObject(oldRef).catch((err) =>
          console.warn("Không tìm thấy ảnh cũ:", err)
        );
      }

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const uniqueName = `${uuidv4()}.jpg`;
      const storageRef = ref(storage, `${folder}/${uniqueName}`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      onUploadSuccess(downloadURL);
      setImageSrc(null);
      setOldImageUrl(downloadURL);
    } catch (err) {
      console.error("Upload lỗi:", err);
    } finally {
      setIsCropping(false);
    }
  };

  const cancelCrop = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleSelectAspect = (e) => {
    const value = e.target.value;
    if (value === "free") {
      setAspectRatio(undefined);
    } else {
      const [w, h] = value.split(":").map(Number);
      setAspectRatio(w / h);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ fontWeight: "bold" }}>{label}</label>

      {!imageSrc && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
          style={{ marginTop: 10 }}
        />
      )}

      {imageSrc && (
        <>
          {/* Cropper */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "590px",
              backgroundColor: "#000",
              marginTop: 16,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Tùy chỉnh tỷ lệ */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <select onChange={handleSelectAspect} defaultValue="free">
              <option value="free">Tự do</option>
              <option value="7:1">7:1</option>
              <option value="6:1">6:1</option>
              <option value="5:1">5:1</option>
              <option value="4:1">4:1</option>
              <option value="3:1">3:1</option>
            </select>
          </div>

          {/* Các nút thao tác */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <button
              onClick={handleUploadCropped}
              disabled={isCropping}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {isCropping ? "Đang xử lý..." : "✨ Cắt & Upload"}
            </button>
            <button
              onClick={cancelCrop}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ❌ Hủy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUploaderCrop;
