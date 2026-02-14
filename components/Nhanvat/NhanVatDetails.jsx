// NhanVatDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./NhanVatDetails.module.css";
import {
  SectionName,
  SectionAvatarPeak,
  SectionAlbum,
  SectionComic,
  SectionInfo,
  SectionRadar,
  SectionSubject,
  SectionCarousel,
  SectionQuote,
  SectionSocial,
  SectionContentTab,
  SectionInventory,
  SectionFriendList,
} from "./SubSections";
import ReorderLayout from "./ReorderLayout";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function NhanVatDetails({
  character,
  characters,
  onBack,
  onSelectCharacter,
  theme = {},
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [friendAvatars, setFriendAvatars] = useState([]);
  const [featuredComicsImages, setFeaturedComicsImages] = useState([]);
  const scrollRef = useRef(null);

  // Theme sections
  const sec1 = theme.sections?.section1?.subs || {};
  const sec2 = theme.sections?.section2?.subs || {};
  const sec3 = theme.sections?.section3?.subs || {};
  const sec4 = theme.sections?.section4?.subs || {};
  const sec5 = theme.sections?.section5?.subs || {};

  // Background
  useEffect(() => {
    document.body.style.backgroundColor = theme.background || "#6d6dbf";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [theme]);

  // Load featured comics
  useEffect(() => {
    async function load() {
      const ids = Array.isArray(character.featuredComics)
        ? character.featuredComics
        : [];

      if (!ids.length) {
        setFeaturedComicsImages([]);
        return;
      }

      const db = getFirestore();
      const results = await Promise.all(
        ids.map(async (cid) => {
          try {
            const snap = await getDoc(doc(db, "chapters", cid));
            if (!snap.exists()) return null;

            const data = snap.data();
            return {
              id: cid,
              title: data.title || "Chương",
              coverImageUrl: data.coverUrl,
              slug: data.slug || null, // chỉ cần slug nếu muốn cho click
            };
          } catch (err) {
            console.warn("Không thể lấy chương:", cid, err);
            return null;
          }
        })
      );

      setFeaturedComicsImages(results.filter(Boolean));
    }

    load();
  }, [character]);

  // Load friends có approved = true
  useEffect(() => {
    async function load() {
      if (!character.friends?.length) return;
      const db = getFirestore();
      const arr = await Promise.all(
        character.friends
          .filter((f) => f.value)
          .map(async (f) => {
            try {
              const ref = doc(db, "characters", f.value);
              const snap = await getDoc(ref);
              if (!snap.exists()) return null;

              const data = snap.data();
              // Chỉ trả về nếu approved === true
              if (data.approved === true) {
                return { id: f.value, ...data };
              } else {
                return null;
              }
            } catch (err) {
              console.error("Lỗi khi load friend", f.value, err);
              return null;
            }
          })
      );
      // Lọc bỏ các null
      setFriendAvatars(arr.filter(Boolean));
    }
    load();
  }, [character]);

  // Preload avatar images
  useEffect(() => {
    if (Array.isArray(featuredComicsImages)) {
      featuredComicsImages.forEach((c) => {
        new Image().src = c.coverImageUrl;
      });
    }
  }, [featuredComicsImages]);

  useEffect(() => {
    // Dùng đúng biến `characters` đã truyền vào
    characters.forEach((c) => {
      const img = new Image();
      img.src = c.avatarUrl;
    });

    // Nếu list dài, chỉ preload ±N quanh currentCharacter:
    // const idx = allCharacters.findIndex(c => c.id === currentCharacter.id);
    // const range = 5;
    // const start = Math.max(0, idx - range);
    // const end = Math.min(allCharacters.length, idx + range + 1);
    // for (let i = start; i < end; i++) {
    //   const img = new Image();
    //   img.src = allCharacters[i].avatarUrl;
    // }
  }, [characters]);

  // Debug font
  useEffect(() => {
    setTimeout(() => {
      // Lấy phần tử có class module đó bằng getElementsByClassName
      const className = styles.sectionQuote; // "NhanVatDetails_sectionQuote__+InHO"
      const els = document.getElementsByClassName(className);
      const el = els[0];
      if (!el) {
        console.warn("Không tìm thấy SectionQuote");
        return;
      }
      console.log("Quote Font-family:", window.getComputedStyle(el).fontFamily);
    }, 0);
  }, [theme]);

  // Build mobile order
  const mobileOrder = [
    <SectionName key="name" character={character} sec2={sec2} />,
    <SectionAvatarPeak
      key="avatarPeak"
      character={character}
      sec1={sec1}
      characters={characters}
    />,
    <SectionCarousel
      key="carousel"
      character={character}
      characters={characters}
      onSelect={onSelectCharacter}
    />,
    <SectionQuote key="quote" character={character} sec4={sec4} />,
    <SectionInfo key="info" character={character} sec2={sec2} />,
    <SectionRadar key="radar" character={character} sec2={sec2} />,
    <SectionSubject key="subject" character={character} sec2={sec2} />,
    <SectionFriendList
      key="friends"
      friends={character.friends}
      friendAvatars={friendAvatars}
      sec5={sec5}
      onSelect={onSelectCharacter}
    />,
    <SectionSocial
      key="social"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      character={character}
      sec4={sec4}
    />,
    <SectionContentTab
      key="content"
      activeTab={activeTab}
      character={character}
      sec4={sec4}
    />,
    <SectionInventory
      key="inventory"
      inventory={character.inventory}
      sec4={sec4}
    />,
    <SectionAlbum key="album" character={character} sec1={sec1} />,
    <SectionComic
      key="comic"
      featuredComicsImages={featuredComicsImages}
      sec1={sec1}
    />,
  ];

  return (
    <div ref={scrollRef} className={styles.fullscreenWrapper}>
      <div className={styles.container}>
        <ReorderLayout mobileOrder={mobileOrder}>
          {/* Desktop layout: 5 sections */}
          <div className={styles.section1}>
            <SectionAvatarPeak
              character={character}
              sec1={sec1}
              characters={characters}
            />
            <SectionAlbum character={character} sec1={sec1} />
            <SectionComic
              featuredComicsImages={featuredComicsImages}
              sec1={sec1}
            />
          </div>
          <div className={styles.section2}>
            <SectionName character={character} sec2={sec2} />
            <SectionInfo character={character} sec2={sec2} />
            <SectionRadar character={character} sec2={sec2} />
            <SectionSubject character={character} sec2={sec2} />
          </div>
          <div className={styles.section3}>
            <SectionCarousel
              character={character}
              characters={characters}
              onSelect={onSelectCharacter}
            />
          </div>
          <div className={styles.section4}>
            <SectionQuote character={character} sec4={sec4} />
            <SectionSocial
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              character={character}
              sec4={sec4}
            />
            <SectionContentTab
              activeTab={activeTab}
              character={character}
              sec4={sec4}
            />
            <SectionInventory inventory={character.inventory} sec4={sec4} />
          </div>
          <div className={styles.section5}>
            <SectionFriendList
              friends={character.friends}
              friendAvatars={friendAvatars}
              sec5={sec5}
              onSelect={onSelectCharacter}
            />
          </div>
        </ReorderLayout>
      </div>

      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={onBack}>
          ← Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
//ngon lanh 13.05.2025//
