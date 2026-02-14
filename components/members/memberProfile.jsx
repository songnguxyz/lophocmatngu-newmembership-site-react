import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./MemberProfile.module.css";
import NhanVatDetails from "../Nhanvat/NhanVatDetails";
import MyCard from "../Card/MyCard";
import { Link } from "react-router-dom";
import Tooltip from "../Shared/Tooltip";

const TABS = {
  cards: "Thẻ nhân vật",
  characters: "Nhân vật yêu thích",
  comics: "Truyện đã yêu thích",
};

const MemberProfile = () => {
  const [user] = useAuthState(auth);
  const [xu, setXu] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [favoriteComics, setFavoriteComics] = useState([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState([]);
  const [favoriteChapters, setFavoriteChapters] = useState([]);

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentTab, setCurrentTab] = useState("cards"); // mặc định hiển thị "Thẻ"

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setXu(userSnap.data().xu || 0);
        else {
          await setDoc(userRef, { xu: 0 });
          setXu(0);
        }

        const comicsQ = query(
          collection(db, "userLikes"),
          where("userId", "==", user.uid)
        );
        const comicsSnap = await getDocs(comicsQ);
        const comicIds = comicsSnap.docs.map((d) => d.data().truyenId);
        const comicsData = await Promise.all(
          comicIds.map(async (id) => {
            const snap = await getDoc(doc(db, "truyens", id));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setFavoriteComics(comicsData.filter(Boolean));

        const charsQ = query(
          collection(db, "userFollows"),
          where("userId", "==", user.uid)
        );
        const charsSnap = await getDocs(charsQ);
        const charIds = charsSnap.docs.map((d) => d.data().characterId);
        const charsData = await Promise.all(
          charIds.map(async (id) => {
            const snap = await getDoc(doc(db, "characters", id));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setFavoriteCharacters(charsData.filter(Boolean));

        const chapsQ = query(
          collection(db, "userBookmarks"),
          where("userId", "==", user.uid)
        );
        const chapsSnap = await getDocs(chapsQ);
        const chapIds = chapsSnap.docs.map((d) => d.data().chapterId);
        const chapsData = await Promise.all(
          chapIds.map(async (id) => {
            const snap = await getDoc(doc(db, "chapters", id));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
          })
        );
        setFavoriteChapters(chapsData.filter(Boolean));
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) return <div>Đang tải thông tin cá nhân...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;
  if (!user) return <div>Bạn chưa đăng nhập.</div>;

  const avatarURL = user.photoURL || "/default-avatar.png";

  return (
    <div className={styles.memberProfileContainer}>
      <div className={styles.profileHeader}>
        <img
          src={avatarURL}
          alt={user.displayName || "Avatar"}
          className={styles.profileImage}
          referrerPolicy="no-referrer"
        />
        <div>
          <h2>{user.displayName}</h2>
          <p>Số xu hiện có: {xu}</p>
        </div>
      </div>

      {/* TAB menu */}
      <div className={styles.tabMenu}>
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            className={`${styles.tabButton} ${
              currentTab === key ? styles.activeTab : ""
            }`}
            onClick={() => setCurrentTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB content */}
      <div className={styles.tabContent}>
        {currentTab === "cards" && <MyCard />}
        {currentTab === "characters" && (
          <>
            <h3>Nhân vật yêu thích:</h3>
            {selectedCharacter ? (
              <NhanVatDetails
                character={selectedCharacter}
                characters={favoriteCharacters}
                onBack={() => setSelectedCharacter(null)}
                onSelectCharacter={(ch) => setSelectedCharacter(ch)}
              />
            ) : favoriteCharacters.length > 0 ? (
              <ul className={styles.characterList}>
                {favoriteCharacters.map((ch) => (
                  <li key={ch.id} className={styles.characterItem}>
                    <div
                      className={styles.characterLink}
                      onClick={() => setSelectedCharacter(ch)}
                    >
                      <img
                        src={ch.avatarUrl}
                        alt={ch.name}
                        className={styles.characterAvatar}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Bạn chưa yêu thích nhân vật nào.</p>
            )}
          </>
        )}
        {currentTab === "comics" && (
          <>
            <h3>Truyện đã yêu thích:</h3>
            {favoriteComics.length > 0 ? (
              <ul className={styles.comicList}>
                {favoriteComics.map((comic) => (
                  <li key={comic.id} className={styles.comicItem}>
                    <Tooltip content={comic.title}>
                      <Link
                        to={`/read-comic/${comic.id}/1`}
                        className={styles.comicCard}
                      >
                        <img
                          src={comic.coverImageUrl}
                          alt={comic.title}
                          className={styles.comicCover}
                        />
                      </Link>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Bạn chưa yêu thích truyện nào.</p>
            )}
            <h4>Chương đã đánh dấu:</h4>
            {favoriteChapters.length > 0 ? (
              <ul className={styles.chapterList}>
                {favoriteChapters.map((chap) => (
                  <li key={chap.id} className={styles.chapterItem}>
                    <Tooltip content={chap.title}>
                      <Link
                        to={`/read-chapter/${chap.id}`}
                        className={styles.chapterCard}
                      >
                        <img
                          src={chap.imageUrls?.[0]}
                          alt={chap.title}
                          className={styles.chapterCover}
                        />
                      </Link>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Bạn chưa đánh dấu chương nào.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
