import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Gacha.module.css";

const SectionUser = ({ xu }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.sectionCenter}>
      <h2>🎯 Xu hiện tại: {xu}</h2>
      <button onClick={() => navigate("/shop")} className={styles.shopButton}>
        Đến Cửa Hàng Xu
      </button>
    </div>
  );
};

export default SectionUser;
