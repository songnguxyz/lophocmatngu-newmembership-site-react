import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase";
import FavoriteButton from "../Shared/FavoriteButton";
import styles from "./ComicInfoSection.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen, faTag } from "@fortawesome/free-solid-svg-icons";

const ComicInfoSection = ({ comic, comicId, userPurchasedChapters = [] }) => {
  const { chapterId: p1, chapterIndex: p2 } = useParams();
  const navigate = useNavigate();
  const currentChapterId = p1 || p2;

  const [chaptersList, setChaptersList] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!comic) return;

    (async () => {
      const ids = Array.isArray(comic.chapters) ? comic.chapters : [];

      try {
        const arr = await Promise.all(
          ids.map(async (cid) => {
            try {
              const s = await getDoc(doc(db, "chapters", cid));
              return s.exists() ? { id: s.id, ...s.data() } : null;
            } catch (err) {
              if (err.code === "permission-denied") {
                console.warn(`Không có quyền truy cập chương: ${cid}`);
                return null;
              } else {
                console.error("Lỗi khi đọc chương:", err);
                return null;
              }
            }
          })
        );

        const validChapters = arr.filter(Boolean);
        setChaptersList(validChapters);

        if (validChapters.length === 0) {
          setLoadError(
            "Không thể tải danh sách chương. Có thể bạn chưa có quyền truy cập."
          );
        }
      } catch (err) {
        console.error("Lỗi tổng khi tải danh sách chương:", err);
        setLoadError("Đã xảy ra lỗi khi tải chương.");
      }
    })();
  }, [comic]);

  const purchasedMap = useMemo(() => {
    if (!Array.isArray(userPurchasedChapters)) return userPurchasedChapters;
    return userPurchasedChapters.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
  }, [userPurchasedChapters]);

  if (!comic) return null;

  const handleChapterClick = (chapter) => {
    const validIds = comic.chapters || [];
    if (validIds.includes(chapter.id)) {
      navigate(`/read-chapter/${chapter.slug}`, {
        state: {
          allowedChapters: comic.chapters,
        },
      });
    } else {
      alert("Chương này không thuộc truyện này.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.infoSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header: Cover + Info */}
        <div className={styles.infoHeaderFull}>
          <img
            src={comic.coverImageUrl}
            alt={comic.title}
            className={styles.coverImageFull}
          />
        </div>

        <div className={styles.details}>
          <h2>{comic.title}</h2>
          <p>Tác giả: {comic.author}</p>
          <hr className={styles.divider} />
          {comic.summary && (
            <div dangerouslySetInnerHTML={{ __html: comic.summary }} />
          )}
          <div className={styles.stats}>
            <span>Đã xem: {comic.views || 0}</span>
            <FavoriteButton itemId={comicId} itemType="comics" />
          </div>
        </div>

        {/* Danh sách chương */}
        <div className={styles.chapterSection}>
          <h3 className={styles.chapterListTitle}>Danh sách chương</h3>
          {!user ? (
            <div className={styles.chapterNotice}>
              Bạn không có quyền xem danh sách chương. Vui lòng{" "}
              <Link to="/login" className={styles.loginLink}>
                <strong>đăng nhập</strong>
              </Link>{" "}
              để xem danh sách chương và đọc truyện.
            </div>
          ) : loadError ? (
            <div className={styles.chapterNotice}>{loadError}</div>
          ) : (
            <ul className={styles.chapterListContainer}>
              {chaptersList.map((ch) => {
                const isPremium = ch.isPremium;
                const purchased = !!purchasedMap[ch.id];

                return (
                  <li
                    key={ch.id}
                    className={styles.chapterItem}
                    onClick={() => handleChapterClick(ch)}
                  >
                    <div className={styles.chapterLink}>
                      {ch.coverUrl && (
                        <img
                          src={ch.coverUrl}
                          alt={ch.title}
                          className={styles.chapterThumbnail}
                        />
                      )}
                      <div className={styles.chapterInfo}>
                        <span className={styles.chapterTitle}>{ch.title}</span>
                        <span className={styles.chapterStatus}>
                          {isPremium ? (
                            purchased ? (
                              <>
                                <FontAwesomeIcon icon={faLockOpen} />{" "}
                                <span>Đã mua</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faLock} />{" "}
                                <span>Premium</span>
                              </>
                            )
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faTag} />{" "}
                              <span>Miễn phí</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComicInfoSection;
