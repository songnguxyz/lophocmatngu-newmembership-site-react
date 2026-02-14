import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import ChapterList from "./Chapterlist";
import ComicList from "./Comiclist";
import styles from "./Comics.module.css";

const animProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 },
};

const Comics = () => {
  const tabs = useMemo(
    () => [
      { id: "chapters", label: "Các chương" },
      { id: "all", label: "Tất cả truyện" },
    ],
    []
  );
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const [categories, setCategories] = useState([]);
  const [groupedComics, setGroupedComics] = useState({});
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState({ comics: true, chapters: false });
  const [chapterError, setChapterError] = useState("");

  const [user, setUser] = useState(null);
  const [userPurchases, setUserPurchases] = useState(null);

  // 1. Theo dõi auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 2. Load categories + comics
  useEffect(() => {
    (async () => {
      const catSnap = await getDocs(
        query(collection(db, "categories"), orderBy("order", "asc"))
      );
      setCategories(
        catSnap.docs.map((d) => ({ id: d.id, name: d.data().name }))
      );

      const comicSnap = await getDocs(
        query(collection(db, "truyens"), where("approved", "==", true))
      );
      const data = comicSnap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        slug: d.data().slug, 
        coverImageUrl: d.data().coverImageUrl,
        category: d.data().category,
        order: d.data().order || 0,
      }));
      const grouped = data.reduce((acc, c) => {
        acc[c.category] = acc[c.category] || [];
        acc[c.category].push(c);
        return acc;
      }, {});
      Object.values(grouped).forEach((arr) =>
        arr.sort((a, b) => a.order - b.order)
      );
      setGroupedComics(grouped);

      setLoading((l) => ({ ...l, comics: false }));
    })();
  }, []);

  // 3. Load chapters khi chuyển sang tab "chapters"
  useEffect(() => {
    if (activeTab !== "chapters") return;

    setLoading((l) => ({ ...l, chapters: true }));
    setChapterError("");

   (async () => {
      try {
        const chapSnap = await getDocs(
          query(
            collection(db, "chapters"),
            where("approved", "==", true),
            orderBy("order", "asc")
          )
        );
        console.log("Số chương tìm thấy:", chapSnap.docs.length);
        
        setChapters(
          chapSnap.docs.map((d) => ({
            id: d.id,
            title: d.data().title,
            slug: d.data().slug, 
            order: d.data().order,
            ...d.data(),
          }))
        );
        
      } catch (error) {
       if (error.code === "permission-denied") {
          setChapterError(
       "Bạn không có quyền truy cập. Vui lòng đăng nhập để đọc truyện."
       );
     } else {
       setChapterError("Đã xảy ra lỗi khi tải chương truyện.");
    }
  } finally {
     setLoading((l) => ({ ...l, chapters: false }));
     }
   })();
  }, [activeTab]);

  // 4. Load purchases của user (khi vào tab "chapters" và đã đăng nhập)
  useEffect(() => {
    if (!user || activeTab !== "chapters") return;

    const fetchUserPurchases = async () => {
      try {
        const snap = await getDoc(doc(db, "userPurchases", user.uid));
        if (snap.exists()) {
          setUserPurchases(snap.data());
        } else {
          setUserPurchases({ chapters: {} });
        }
      } catch (err) {
        console.error("Lỗi khi tải userPurchases:", err);
        setUserPurchases({ chapters: {} });
      }
    };

    fetchUserPurchases();
  }, [user, activeTab]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${
              activeTab === t.id ? styles.active : ""
            }`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chapters" ? (
          <motion.div key="chapters" {...animProps} className={styles.content}>
            <ChapterList
              loadingChapters={loading.chapters}
              chaptersList={chapters}
              userPurchasedChapters={userPurchases?.chapters || {}}
              chapterError={chapterError}
            />
          </motion.div>
        ) : (
          <motion.div key="all" {...animProps} className={styles.content}>
            <ComicList categories={categories} groupedComics={groupedComics} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comics;
