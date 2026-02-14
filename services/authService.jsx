// src/services/authService.js

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Khởi tạo Google provider
const googleProvider = new GoogleAuthProvider();

/**
 * Đăng nhập với Google, sau đó đảm bảo có document users/{uid} trong Firestore:
 * - Nếu lần đầu (doc chưa tồn tại) sẽ tạo mới với xu = 0, createdAt, và các field cơ bản
 * - Ngược lại chỉ cập nhật displayName, email, photoURL (merge)
 */
export const signInWithGoogle = async () => {
  // 1) Mở popup Google login
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // 2) Tham chiếu document users/{uid}
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Lần đầu: tạo mới
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      xu: 0,
      createdAt: new Date(),
    });
  } else {
    // User đã tồn tại: chỉ update các field cơ bản
    await setDoc(
      userRef,
      {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        uid: user.uid || "",
      },
      { merge: true }
    );
  }

  return result;
};

/**
 * Đăng xuất
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
};

/**
 * Đăng ký callback theo dõi thay đổi auth state
 * @param {(user: import('firebase/auth').User|null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe}
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
