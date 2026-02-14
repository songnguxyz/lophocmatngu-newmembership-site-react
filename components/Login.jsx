// src/components/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import "./LoginPage.css";

// Dùng hàm từ authService để login + ghi Firestore
import { signInWithGoogle } from "../services/authService";
import { auth } from "../firebase";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) navigate("/portal", { replace: true });
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      // Gọi service đã bao gồm setDoc lên Firestore
      await signInWithGoogle();
    } catch (err) {
      console.error("Đăng nhập Google thất bại:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Đăng nhập</h1>
        <p className="login-subtitle">
          Vui lòng sử dụng tài khoản Google của bạn
        </p>
        <button onClick={handleGoogleSignIn} className="btn-google">
          <FaGoogle className="google-icon" />
          <span className="google-text">Đăng nhập với Google</span>
        </button>
      </div>
    </div>
  );
}
