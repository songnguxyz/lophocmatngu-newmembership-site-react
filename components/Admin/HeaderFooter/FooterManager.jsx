// src/components/FooterManager.js
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase"; // Import db
import { doc, getDoc, setDoc } from "firebase/firestore";

const FooterManager = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "footer", "footerData"); // Collection 'footer', document 'footerData'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const footerData = docSnap.data();
          setContent(footerData.content || "");
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const footerData = {
        content,
      };

      const docRef = doc(db, "footer", "footerData"); // Collection 'footer', document 'footerData'
      await setDoc(docRef, footerData, { merge: true }); // Tạo hoặc cập nhật document

      alert("Footer đã được cập nhật!");
    } catch (e) {
      setError(e);
      alert(`Đã xảy ra lỗi: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Quản lý Footer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nội dung Footer:</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Lưu"}
        </button>
        {error && <p>Lỗi: {error.message}</p>}
      </form>
    </div>
  );
};

export default FooterManager;
