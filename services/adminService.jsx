// src/services/adminService.js
import { getFunctions, httpsCallable } from "../firebase";

const checkAdminRole = async () => {
  try {
    const functions = getFunctions();
    const adminOnly = httpsCallable(functions, "adminOnly");

    const result = await adminOnly(); // Không cần gửi token thủ công
    return result.data.isAdmin === true;
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền admin:", error);
    return false;
  }
};

export { checkAdminRole };
