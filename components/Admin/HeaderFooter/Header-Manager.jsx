// src/Admin/HeaderFooter/Header-Manager.jsx

import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import ImageUploaderCrop from "../Common/ImageUploaderCrop";
import "./HeaderManager.css"; // nếu có css riêng

const HeaderManager = () => {
  const [content, setContent] = useState("");
  const [fbImageUrl, setFbImageUrl] = useState("");
  const [visiblePages, setVisiblePages] = useState([]);
  const [navigationItems, setNavigationItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHeader = async () => {
      const docRef = doc(db, "header", "headerData");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent(data.content || "");
        setFbImageUrl(data.fbImageUrl || "");
        setVisiblePages(data.visiblePages || []);
      }
    };

    const loadNavigation = async () => {
      const navQuery = query(
        collection(db, "navigationItems"),
        orderBy("order", "asc")
      );
      const navSnap = await getDocs(navQuery);
      const navList = navSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNavigationItems(navList);
    };

    loadHeader();
    loadNavigation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(
        doc(db, "header", "headerData"),
        {
          content,
          fbImageUrl,
          visiblePages,
        },
        { merge: true }
      );
      alert("Đã lưu Header!");
    } catch (e) {
      console.error("Error saving header:", e);
      alert("Lỗi lưu Header.");
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (pageUrl) => {
    if (visiblePages.includes(pageUrl)) {
      setVisiblePages(visiblePages.filter((p) => p !== pageUrl));
    } else {
      setVisiblePages([...visiblePages, pageUrl]);
    }
  };

  return (
    <div className="header-manager-container">
      <h2>Quản lý Header</h2>

      <div
        className="header-preview"
        style={{
          backgroundImage: `url(${fbImageUrl})`,
          height: "300px",
          width: "auto",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div className="header-text">{content}</div>
      </div>

      <form onSubmit={handleSubmit} className="header-form">
        <div className="form-group">
          <label>Nội dung Header:</label>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <ImageUploaderCrop
          folder="header"
          onUploadSuccess={(url) => setFbImageUrl(url)}
        />

        <div className="form-group">
          <label>Chọn Trang Áp dụng Header:</label>
          <div className="checkbox-list">
            {navigationItems.map((item) => (
              <label key={item.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={visiblePages.includes(item.url)}
                  onChange={() => togglePage(item.url)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="save-button">
          {loading ? "Đang lưu..." : "Lưu lại"}
        </button>
      </form>
    </div>
  );
};

export default HeaderManager;
