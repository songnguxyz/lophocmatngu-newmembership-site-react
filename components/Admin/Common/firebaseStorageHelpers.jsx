// src/utils/firebaseStorageHelpers.js
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../firebase";

// Chuyển URL thành đường dẫn nội bộ Firebase
export const getStoragePathFromUrl = (url) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const matches = decodedUrl.match(/\/o\/(.*?)\?/);
    if (matches && matches[1]) {
      return matches[1]; // Ví dụ: "avatars/abc123.png"
    }
    return null;
  } catch (err) {
    console.error("Lỗi khi phân tích URL:", err);
    return null;
  }
};

// Hàm xoá ảnh từ URL
export const deleteImageFromUrl = async (url) => {
  const path = getStoragePathFromUrl(url);
  if (!path) {
    console.warn(
      "Không thể xác định được đường dẫn trong storage từ URL:",
      url
    );
    return;
  }

  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
    console.log("Đã xoá ảnh thành công:", path);
  } catch (error) {
    console.error("Lỗi khi xoá ảnh:", error);
  }
};
