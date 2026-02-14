// src/components/Nhanvat/DanhSach.jsx
import React, { useEffect, useState } from "react";
import { db, firebaseReady } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DanhSach.module.css";
import NhanVatDetails from "./NhanVatDetails";
import GalaxyCanvasBackground from "../Shared/Galaxy";
import { useLocation } from "react-router-dom";

const DanhSach = () => {
  const [characters, setCharacters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // mỗi khi user “navigate” (dù cùng path), key sẽ đổi → ta clear state
    if (location.pathname === "/nhanvat") {
      setSelectedCharacter(null);
    }
  }, [location.key]);

  useEffect(() => {
    const fetchData = async () => {
      await firebaseReady;
      const [charSnap, catSnap] = await Promise.all([
        getDocs(query(collection(db, "characters"), orderBy("order", "asc"))),
        getDocs(
          query(collection(db, "characterscategories"), orderBy("order", "asc"))
        ),
      ]);
      setCharacters(
        charSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setCategories(catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredCharacters = characters
    .filter((c) => c.approved)
    .filter((c) => {
      const okCat = selectedCategory ? c.category === selectedCategory : true;
      const okSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return okCat && okSearch;
    });

  if (loading) {
    return (
      <>
        <GalaxyCanvasBackground />
        <div className={styles.loading}>Đang tải danh sách nhân vật...</div>
      </>
    );
  }

  if (selectedCharacter) {
    return (
      <>
        <GalaxyCanvasBackground />
        <div className={styles.wrapper}>
          <NhanVatDetails
            character={selectedCharacter}
            onBack={() => setSelectedCharacter(null)}
            onSelectCharacter={(char) => setSelectedCharacter(char)}
            characters={filteredCharacters}
            theme={selectedCharacter.theme}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <GalaxyCanvasBackground />
      <div className={styles.listBg}>
        <div className={styles.wrapper}>
          {/* Tabs + Search */}
          <div className={styles.tabsSearchContainer}>
            <ul className={styles.categoryTabs}>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={`${styles.tabItem} ${
                    selectedCategory === cat.id ? styles.activeTab : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </li>
              ))}
              <li
                className={`${styles.tabItem} ${
                  selectedCategory === null ? styles.activeTab : ""
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </li>
            </ul>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Tìm kiếm nhân vật..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid Characters */}
          <div className={styles.characterGrid}>
            <AnimatePresence initial={false}>
              {filteredCharacters.map((char, idx) => (
                <motion.div
                  key={char.id}
                  className={styles.characterCard}
                  onClick={() => setSelectedCharacter(char)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.05,
                    type: "tween",
                  }}
                >
                  <div className={styles.avatarWrapper}>
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className={styles.characterAvatar}
                    />
                  </div>
                  <div className={styles.characterName}>{char.name}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default DanhSach;
