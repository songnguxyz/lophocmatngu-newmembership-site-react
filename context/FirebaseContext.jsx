//context/FirebaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { firebaseReady, auth, db, googleProvider } from "../firebase"; // Import thêm auth, db, googleProvider
import { getFunctions, httpsCallable } from "firebase/functions"; // thêm dòng này

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [functions, setFunctions] = useState(null);

  useEffect(() => {
    firebaseReady
      .then(() => {
        console.log("✅ Firebase đã ready trong context!");
        const f = getFunctions(); // lấy functions instance
        setFunctions(f);

        setInitializing(false);
      })
      .catch((error) => {
        console.error("🔥 Lỗi khi khởi tạo firebaseReady:", error);
        setInitializing(false);
      });
  }, []);

  return (
    <FirebaseContext.Provider
      value={{ initializing, auth, db, googleProvider, functions }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
