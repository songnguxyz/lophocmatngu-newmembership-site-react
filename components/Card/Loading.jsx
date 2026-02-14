import React from "react";
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.fullScreen}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>🔮 Triệu hồi thẻ hiếm...</p>
    </div>
  );
};

export default Loading;
