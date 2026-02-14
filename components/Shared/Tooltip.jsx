// File: src/components/Shared/Tooltip.jsx

import React, { useState, useRef, useEffect } from "react";
import useIsMobile from "./useIsMobile";
import styles from "./Tooltip.module.css";

const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isMobile || !visible) return;
    const handleTouch = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("touchstart", handleTouch);
    return () => document.removeEventListener("touchstart", handleTouch);
  }, [isMobile, visible]);

  const show = () => {
    if (!isMobile) setVisible(true);
  };
  const hide = () => {
    if (!isMobile) setVisible(false);
  };
  const toggle = (e) => {
    if (isMobile) {
      e.stopPropagation();
      setVisible((v) => !v);
    }
  };

  return (
    <div
      className={styles.tooltipWrapper}
      ref={wrapperRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={toggle}
    >
      {children}
      <div
        className={`${styles.tooltipBubble} ${visible ? styles.active : ""}`}
      >
        {content}
        <span className={styles.bubbleArrow} />
      </div>
    </div>
  );
};

export default Tooltip;
