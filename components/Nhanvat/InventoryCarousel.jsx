// File: src/components/Nhanvat/InventoryCarousel.jsx
import React, { useState, useEffect } from "react";
import useIsMobile from "../Shared/useIsMobile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./InventoryCarousel.module.css";

const InventoryCarousel = ({ inventory = [], fontFamily, }) => {
  const [page, setPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isMobile = useIsMobile();

  // ————— Tap ngoài để đóng tooltip trên mobile —————
  useEffect(() => {
    if (!isMobile || hoveredIndex === null) return;
    const handler = (e) => {
      if (!e.target.closest(`.${styles.friendCard}`)) {
        setHoveredIndex(null);
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [isMobile, hoveredIndex]);
  // ——————————————————————————————————————————————

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const currentItems = inventory.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePrev = () =>
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  const handleNext = () => setPage((prev) => (prev + 1) % totalPages);

  const handleCardClick = (idx) => {
    if (isMobile) {
      setHoveredIndex(idx);
    }
  };
  // Normalize fontFamily to string
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  return (
    <div
      className={styles.friendListWrapper}
      style={fontFamilyString ? { fontFamily: fontFamilyString } : undefined}
    >
      <div className={styles.friendFooter}>
        <h3
          className={styles.friendTitle}
          style={
            fontFamilyString ? { fontFamily: fontFamilyString } : undefined
          }
        >
          Đồ đạc ({inventory.length})
        </h3>
        {totalPages > 1 && (
          <div className={styles.carouselControls}>
            <button onClick={handlePrev} className={styles.carouselBtn}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button onClick={handleNext} className={styles.carouselBtn}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.friendRow}>
        {currentItems.map((item, idx) => (
          <div
            key={idx}
            className={styles.friendCard}
            onMouseEnter={() => !isMobile && setHoveredIndex(idx)}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            onClick={() => handleCardClick(idx)}
          >
            <div className={styles.friendAvatarWrapper}>
              <img
                src={item.url}
                alt={item.name || `Item ${idx}`}
                className={styles.friendAvatar}
              />
            </div>

            {hoveredIndex === idx && item.description && (
              <div className={styles.friendBubble}>
                <div className={styles.bubbleContent}>{item.description}</div>
                <div className={styles.bubbleArrow} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryCarousel;
