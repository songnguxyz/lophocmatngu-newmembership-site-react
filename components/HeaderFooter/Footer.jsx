// src/components/Footer.js
import React, { useState, useEffect } from "react";
import "./Footer.module.css";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVersion, setDataVersion] = useState(0); // Thêm state để theo dõi sự thay đổi

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "footer", "footerData");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFooterData(docSnap.data());
          console.log("Footer data fetched:", docSnap.data());
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataVersion]); // Sử dụng dataVersion làm dependency

  if (loading) {
    return <div>Loading Footer...</div>;
  }

  if (error) {
    console.error("Error fetching footer:", error);
    return <div>Error loading footer.</div>;
  }

  const content =
    footerData?.content ||
    `© ${new Date().getFullYear()} Your Website. All rights reserved.`;

  console.log("Footer rendered with content:", content);

  return (
    <footer className="footer">
      <p>{content}</p>
    </footer>
  );
};

export default Footer;
