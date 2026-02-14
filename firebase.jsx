// src/firebase.jsx
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app;
let auth;
let db;
let storage;
let googleProvider;

/**
 * Fetch config từ API / fallback dummy nếu lỗi
 */
const fetchFirebaseConfig = async () => {
  const isLocal = window.location.hostname === "localhost";
  const url = isLocal
    ? "https://membership-1c8c5.web.app/api/getFirebasePublicConfig"
    : "/api/getFirebasePublicConfig";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
};

/**
 * Khởi tạo Firebase app
 */
const initFirebase = async () => {
  try {
    if (!getApps().length) {
      const config = await fetchFirebaseConfig();

      if (config) {
        app = initializeApp(config);
        console.log("✅ Đã khởi tạo Firebase với config API");
      } else {
        console.warn("⚡ Dùng config dummy vì không lấy được API");
        app = initializeApp({
          apiKey: "dummy",
          authDomain: "dummy.firebaseapp.com",
          projectId: "dummy",
          storageBucket: "dummy.appspot.com",
          messagingSenderId: "0",
          appId: "0",
        });
      }

      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      googleProvider = new GoogleAuthProvider();
    } else {
      app = getApp();
      auth = getAuth();
      db = getFirestore();
      storage = getStorage();
      googleProvider = new GoogleAuthProvider();
    }
  } catch (err) {
    console.error("🔥 Lỗi khởi tạo Firebase cuối cùng:", err);
    throw err; // để firebaseReady bị reject cho bên ngoài bắt lỗi
  }
};

const firebaseReady = initFirebase(); // Promise sẵn sàng

export {
  firebaseReady,
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getFunctions,
  httpsCallable,
  app,
};
