// src/components/FeaturedComics/FeaturedComics.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import styles from "./FeaturedComics.module.css";
import Tooltip from "../Shared/Tooltip";

const FeaturedComics = ({
  title,
  comics,
  resetPage,
  onPageReseted,
  fontFamily,
}) => {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(comics.length / perPage) || 1;

  useEffect(() => {
    if (resetPage) {
      setPage(0);
      onPageReseted();
    }
  }, [resetPage, onPageReseted]);

  useEffect(() => {
    setPage(0);
  }, [comics]);

  const prev = () => page > 0 && setPage((p) => p - 1);
  const next = () => page < totalPages - 1 && setPage((p) => p + 1);

  const current = comics.slice(page * perPage, page * perPage + perPage);

  if (!comics.length) {
    return (
      <div className={styles.emptyMessage}>
        Không có truyện nổi bật nào để hiển thị.
      </div>
    );
  }

  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  const headerStyle = fontFamilyString
    ? { fontFamily: fontFamilyString }
    : undefined;
  const titleStyle = headerStyle;

  return (
    <div className={styles.container} style={headerStyle}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.sectionHeading} style={titleStyle}>
            {title} ({comics.length})
          </h3>
          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={prev}
              disabled={page === 0}
              style={titleStyle}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={styles.navBtn}
              onClick={next}
              disabled={page >= totalPages - 1}
              style={titleStyle}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}

      <div className={styles.carousel}>
        {current.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={styles.card}
            style={headerStyle}
          >
            <Tooltip content={item.title || ""}>
              {item.slug ? (
                <Link to={`/read-chapter/${item.slug}`}>
                  <img
                    src={item.coverImageUrl || null}
                    alt={item.title}
                    className={styles.image}
                    style={titleStyle}
                  />
                </Link>
              ) : (
                <div className={styles.placeholder}>
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className={styles.image}
                    style={titleStyle}
                  />
                  <div className={styles.lockOverlay}>Chưa có chương</div>
                </div>
              )}
            </Tooltip>
          </div>
        ))}
      </div>

      {!title && (
        <div className={styles.navBottom} style={headerStyle}>
          <button
            className={styles.navBtn}
            onClick={prev}
            disabled={page === 0}
            style={titleStyle}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className={styles.pageIndicator} style={titleStyle}>
            {page + 1} / {totalPages}
          </span>
          <button
            className={styles.navBtn}
            onClick={next}
            disabled={page >= totalPages - 1}
            style={titleStyle}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedComics;
