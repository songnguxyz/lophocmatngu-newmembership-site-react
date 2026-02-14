import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../Shared/useIsMobile";
import AlbumImageDetail from "./ImageDetail";
import Tooltip from "../Shared/Tooltip";
import styles from "./Album.module.css";

const AlbumThumbnailCarousel = ({ album = [], fontFamily }) => {
  // State for pagination and modal
  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isMobile = useIsMobile();

  // Reset page to first when album prop changes
  useEffect(() => {
    setPage(0);
  }, [album]);

  const IMAGES_PER_PAGE = 4;
  const totalPages = Math.ceil(album.length / IMAGES_PER_PAGE) || 1;
  const start = page * IMAGES_PER_PAGE;
  const current = album.slice(start, start + IMAGES_PER_PAGE);

  // Prev/Next page handlers
  const prevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };
  const nextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  const prevDisabled = page === 0;
  const nextDisabled = page >= totalPages - 1;

  // Modal open/close
  const openModal = (idx) => setSelectedIndex(start + idx);
  const closeModal = () => setSelectedIndex(null);

  // Keyboard nav inside modal, skip when other modal open
  useEffect(() => {
    const handleKey = (e) => {
      const modalOpen = document.querySelector("[data-modal-open]");
      if (modalOpen) return;
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : album.length - 1));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((i) => (i < album.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [selectedIndex, album]);

  if (!album.length) return null;

  // Normalize fontFamily to string
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  return (
    <>
      {/* HEADER với title + nav */}
      <div className={styles.albumHeader}>
        <h3
          className={styles.albumTitle}
          style={
            fontFamilyString ? { fontFamily: fontFamilyString } : undefined
          }
        >
          Ảnh ({album.length})
        </h3>
        <div className={styles.albumNavButtons}>
          <button
            className={styles.albumNavBtn}
            onClick={prevPage}
            disabled={prevDisabled}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className={styles.albumNavBtn}
            onClick={nextPage}
            disabled={nextDisabled}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Carousel images */}
      <div className={styles.albumThumbnailContainer}>
        {/* Ảnh lớn */}
        {current[0] && (
          <div className={styles.albumBigImage}>
            <Tooltip content={current[0].description || ""}>
              <img
                src={current[0].url}
                alt={current[0].description}
                className={styles.albumImage}
                onClick={() => openModal(0)}
              />
            </Tooltip>
          </div>
        )}

        {/* 3 ảnh nhỏ */}
        <div className={styles.albumThumbRow}>
          {Array.from({ length: 3 }).map((_, i) => {
            const img = current[i + 1];
            return (
              <div key={i} className={styles.albumThumbItem}>
                {img ? (
                  <Tooltip content={img.description || ""}>
                    <img
                      src={img.url}
                      alt={img.description}
                      className={styles.albumImage}
                      onClick={() => openModal(i + 1)}
                    />
                  </Tooltip>
                ) : (
                  <div
                    className={`${styles.albumImage} ${styles.albumPlaceholder}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal popup */}
      {selectedIndex !== null &&
        album[selectedIndex] != null &&
        ReactDOM.createPortal(
          <AlbumImageDetail
            image={album[selectedIndex]}
            album={album}
            selectedImageIndex={selectedIndex}
            setSelectedImageIndex={setSelectedIndex}
            onClose={closeModal}
          />,
          document.body
        )}
    </>
  );
};

export default AlbumThumbnailCarousel;
