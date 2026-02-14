// src/components/Comics/ChapterList.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen, faTag } from "@fortawesome/free-solid-svg-icons";
import styles from "./ChapterList.module.css";

const ChapterList = ({
  loadingChapters,
  chaptersList,
  userPurchasedChapters = {},
  chapterError = "",
}) => {
  const [sortOrder, setSortOrder] = useState("asc"); // asc: cũ→mới, desc: mới→cũ

  const sortedList = useMemo(() => {
    return sortOrder === "asc" ? chaptersList : [...chaptersList].reverse();
  }, [chaptersList, sortOrder]);

  if (loadingChapters) {
    return <div className={styles.loading}>Đang tải chương...</div>;
  }
  if (chapterError) {
    return <div className={styles.noComics}>{chapterError}</div>;
  }
  if (!chaptersList.length) {
    return <div className={styles.noComics}>Chưa có chương nào.</div>;
  }

  const latest = chaptersList[chaptersList.length - 1];

  return (
    <div className={styles.chapterListView}>
      <div className={styles.chapterListContainer}>
        {/* LEFT: Danh sách chương */}
        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <div>
              <span className={styles.listHeaderTitle}>Các chương truyện</span>{" "}
              <span className={styles.listHeaderCount}>
                ({chaptersList.length} chương)
              </span>
            </div>
            <button
              className={styles.sortButton}
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "asc" ? "Cũ → Mới" : "Mới → Cũ"}
            </button>
          </div>

          <ul className={styles.listContainer}>
            {sortedList.map((ch) => {
              const purchased = !!userPurchasedChapters?.[ch.id]; // ✅ cập nhật logic check mua
              return (
                <li key={ch.id} className={styles.listItem}>
                  <Link
                    to={`/read-chapter/${ch.slug}`}
                    className={styles.listLink}
                  >
                    <span className={styles.listTitle}>{ch.title}</span>
                    <span className={styles.listStatus}>
                      {ch.isPremium ? (
                        purchased ? (
                          <>
                            <FontAwesomeIcon icon={faLockOpen} />
                            <span className={styles.purchasedText}>Đã mua</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLock} />
                            <span className={styles.premiumText}>Premium</span>
                          </>
                        )
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTag} />
                          <span className={styles.freeText}>Miễn phí</span>
                        </>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT: Badge+Title trên, card chỉ cover dưới */}
        <div className={styles.latestWrapper}>
          <div className={styles.latestSection}>
            <div className={styles.latestBadge}>Mới nhất</div>
            <Link
              to={`/read-chapter/${latest.slug}`}
              className={styles.latestLink}
            >
              <h3 className={styles.latestTitle}>{latest.title}</h3>
            </Link>
          </div>
          <div className={styles.latestCard}>
            <Link
              to={`/read-chapter/${latest.slug}`}
              className={styles.latestLink}
            >
              {latest.coverUrl ? (
                <img
                  src={latest.coverUrl}
                  alt={latest.title}
                  className={styles.latestImage}
                />
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterList;
