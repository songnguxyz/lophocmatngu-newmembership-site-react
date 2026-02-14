// src/components/Portal/PComics.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import styles from "./PComics.module.css"; // Tạo một file CSS riêng cho PComics
import { getAuth, onAuthStateChanged } from "firebase/auth";

const PComics = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const loadComics = async () => {
      setLoading(true);
      setError(null);

      try {
        const approvedQuery = query(
          collection(db, "truyens"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(5) // Giới hạn số lượng truyện tranh lấy về là 5
        );

        const unsubscribeSnapshot = onSnapshot(
          approvedQuery,
          (snapshot) => {
            const comicsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setComics(comicsData);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error("Lỗi khi lắng nghe snapshot:", err);
          }
        );

        return () => {
          unsubscribeAuth();
          unsubscribeSnapshot();
        };
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error("Lỗi khi tải truyện tranh:", e);
      }
    };

    loadComics();
  }, []);

  if (loading) {
    return <div>Đang tải truyện tranh...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  return (
    <div className={styles.pcomicsContainer}>
      {user ? (
        <>
          {" "}
          {/* Sử dụng Fragment để nhóm các phần tử */}
          <h2>Truyện mới cập nhật</h2> {/* Thêm tiêu đề ở đây */}
          <ul className={styles.pcomicsList}>
            {comics.map((comic) => (
              <li key={comic.id} className={styles.pcomicsItem}>
                <Link
                  to={`/read-comic/${comic.id}/${1}`}
                  className={styles.comicLink}
                >
                  <img
                    src={comic.coverImageUrl}
                    alt={comic.title}
                    className={styles.comicCover}
                  />
                  <h3 className={styles.comicTitle}>{comic.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Bạn cần đăng nhập để xem nội dung truyện tranh.</p>
      )}
    </div>
  );
};

export default PComics;
