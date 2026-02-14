// SubSections.jsx
import React, { useMemo } from "react";
import AvatarPeak from "./AvatarPeak";
import FeaturedComics from "./FeaturedComics";
import AlbumThumbnailCarousel from "./Album";
import NhanvatInfo from "./Info";
import NhanvatStats from "./RadarStats";
import SubjectStatsDisplay from "./SubjectStatsDisplay";
import SocialButtons from "./SocialButtons";
import InventoryCarousel from "./InventoryCarousel";
import FriendList from "./FriendList";
import MobileCharacterCarousel from "./MobileCharacterCarousel";
import styles from "./NhanVatDetails.module.css";
import Description from "./Description";
import { Link } from "react-router-dom"; // đảm bảo có import

// helper để convert hex → "r, g, b"
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function SectionName({ character, sec2 }) {
  return (
    <div
      className={styles.sectionName}
      style={{
        backgroundColor: sec2.sectionName
          ? `rgba(${hexToRgb(sec2.sectionName.bg)}, ${sec2.sectionName.alpha})`
          : "transparent",
        color: sec2.sectionName?.color,
        fontFamily: sec2.sectionName?.fontFamily,
      }}
    >
      <h2
        style={{
          margin: 0,
          padding: 0,
          fontFamily: sec2.sectionName?.fontFamily,
        }}
      >
        {character.name}
      </h2>
    </div>
  );
}

export function SectionAvatarPeak({
    character,
    characters = [],   // mảng tất cả nhân vật, fallback []
    sec1
   }) {

    // 1) Tìm index an toàn (fallback -1 nếu không tìm thấy)
    const index = useMemo(
      () => characters.findIndex((c) => c.id === character.id),
      [characters, character.id]
    );
  
    // 2) Tính preloadUrls, chỉ khi index hợp lệ
    const preloadUrls = useMemo(() => {
      const urls = [];
      if (index > 0) urls.push(characters[index - 1].avatarUrl);
      if (index >= 0 && index < characters.length - 1)
        urls.push(characters[index + 1].avatarUrl);
      return urls;
    }, [characters, index]);
   
     return (
       <AvatarPeak
         avatarUrl={character.avatarUrl}
         name={character.name}
         peak={character.peak}

        preloadUrls={preloadUrls}
         peakBgColor={
           sec1.peak
             ? `rgba(${hexToRgb(sec1.peak.bg)}, ${sec1.peak.alpha})`
             : "transparent"
         }
         peakTextColor={sec1.peak?.color}
         peakFontFamily={sec1.peak?.fontFamily}
       />
     );
   }

export function SectionAlbum({ character, sec1 }) {
  if (!character.album?.length) return null;
  return (
    <div
      className={styles.sectionAlbum}
      style={{
        backgroundColor: sec1.albumCarousel
          ? `rgba(${hexToRgb(sec1.albumCarousel.bg)}, ${
              sec1.albumCarousel.alpha
            })`
          : "transparent",
        color: sec1.albumCarousel?.color,
        fontFamily: sec1.albumCarousel?.fontFamily,
      }}
    >
      <AlbumThumbnailCarousel
        album={character.album}
        fontFamily={sec1.albumCarousel?.fontFamily}
      />
    </div>
  );
}

export function SectionComic({ featuredComicsImages, sec1 }) {
  if (!featuredComicsImages.length) return null;
  return (
    <div
      className={styles.sectionComic}
      style={{
        backgroundColor: sec1.featuredComics
          ? `rgba(${hexToRgb(sec1.featuredComics.bg)}, ${
              sec1.featuredComics.alpha
            })`
          : "transparent",
        color: sec1.featuredComics?.color,
        fontFamily: sec1.featuredComics?.fontFamily,
      }}
    >
      <FeaturedComics
        title="Truyện Tranh"
        comics={featuredComicsImages}
        fontFamily={sec1.featuredComics?.fontFamily}
      />
    </div>
  );
}

export function SectionInfo({ character, sec2 }) {
  return (
    <div
      className={styles.sectionInfo}
      style={{
        backgroundColor: sec2.info
          ? `rgba(${hexToRgb(sec2.info.bg)}, ${sec2.info.alpha})`
          : "transparent",
        color: sec2.info?.color,
        fontFamily: sec2.info?.fontFamily,
      }}
    >
      <NhanvatInfo character={character} />
    </div>
  );
}

export function SectionRadar({ character, sec2 }) {
  const color = sec2.radarStats?.color || "#ffffff";
  const fontFamily = sec2.radarStats?.fontFamily || "inherit";

  // Debug: in console bạn có thể in ra để kiểm tra
  console.log("Radar fontFamily:", fontFamily);

  return (
    <div
      className={styles.sectionRadarStat}
      style={{
        backgroundColor: sec2.radarStats?.bg
          ? `rgba(${hexToRgb(sec2.radarStats.bg)}, ${sec2.radarStats.alpha})`
          : "transparent",
        color: color,
        fontFamily: fontFamily, // dùng biến đã tính
      }}
    >
      <NhanvatStats
        stats={character.stats}
        color={color}
        fontFamily={fontFamily}
      />
    </div>
  );
}

export function SectionSubject({ character, sec2 }) {
  return (
    <div
      className={styles.sectionSubjectStat}
      style={{
        backgroundColor: sec2.subjectStats
          ? `rgba(${hexToRgb(sec2.subjectStats.bg)}, ${
              sec2.subjectStats.alpha
            })`
          : "transparent",
        color: sec2.subjectStats?.color,
        fontFamily: sec2.subjectStats?.fontFamily,
      }}
    >
      <SubjectStatsDisplay
        stats={character.subjectStats}
        fontFamily={sec2.subjectStats?.fontFamily}
      />
    </div>
  );
}

export function SectionCarousel({ character, characters, onSelect }) {
  return (
    <div className={styles.section3}>
      <MobileCharacterCarousel
        character={character}
        characters={characters}
        onSelect={onSelect}
      />
    </div>
  );
}

export function SectionQuote({ character, sec4 }) {
  return (
    <div
      className={styles.sectionQuote}
      style={{
        "--bg": sec4.quote
          ? `rgba(${hexToRgb(sec4.quote.bg)}, ${sec4.quote.alpha})`
          : "transparent",
        backgroundColor: "var(--bg)",
        color: sec4.quote?.color,
        fontFamily: sec4.quote?.fontFamily,
      }}
    >
      <strong style={{ fontFamily: sec4.quote?.fontFamily }}>
        "{character.quote}"
      </strong>
    </div>
  );
}

export function SectionSocial({ activeTab, setActiveTab, character, sec4 }) {
  return (
    <div
      className={styles.sectionSocialButton}
      style={{
        backgroundColor: sec4.socialButtons
          ? `rgba(${hexToRgb(sec4.socialButtons.bg)}, ${
              sec4.socialButtons.alpha
            })`
          : "transparent",
        color: sec4.socialButtons?.color,
        fontFamily: sec4.socialButtons?.fontFamily,
      }}
    >
      <SocialButtons
        activeTab={activeTab}
        onTabChange={setActiveTab}
        iconOnly
        character={character}
      />
    </div>
  );
}

export function SectionContentTab({ activeTab, character, sec4 }) {
  const fontFamily = sec4.tabContent?.fontFamily;

  // Hàm helper render nội dung tùy theo tab
  const renderContent = () => {
    if (activeTab === "info") {
      return (
        <Description
          character={character}
          fontFamily={sec4.tabContent?.fontFamily}
          mode="short"
        />
      );
    }
    if (activeTab === "friends") {
      return (
        <Description
          character={character}
          fontFamily={sec4.tabContent?.fontFamily}
          mode="full"
        />
      );
    }
    // Các tab khác (album, item, stats, quote,…)
    return (
      <div style={{ padding: "1rem", fontStyle: "italic" }}>
        Phần này đang cập nhật
      </div>
    );
  };

  return (
    <div
      className={styles.sectionContentTab}
      style={{
        backgroundColor: sec4.tabContent
          ? `rgba(${hexToRgb(sec4.tabContent.bg)}, ${sec4.tabContent.alpha})`
          : "transparent",
        color: sec4.tabContent?.color,
        fontFamily,
      }}
    >
      {renderContent()}
    </div>
  );
}

export function SectionInventory({ inventory, sec4 }) {
  if (!inventory?.length) return null;
  return (
    <div
      className={styles.sectionInventory}
      style={{
        backgroundColor: sec4.inventory
          ? `rgba(${hexToRgb(sec4.inventory.bg)}, ${sec4.inventory.alpha})`
          : "transparent",
        color: sec4.inventory?.color,
        fontFamily: sec4.inventory?.fontFamily,
      }}
    >
      <InventoryCarousel inventory={inventory} />
    </div>
  );
}

export function SectionFriendList({ friends, friendAvatars, sec5, onSelect }) {
  return (
    <div
      className={styles.section5}
      style={{
        backgroundColor: sec5.friends
          ? `rgba(${hexToRgb(sec5.friends.bg)}, ${sec5.friends.alpha})`
          : "transparent",
        color: sec5.friends?.color,
        fontFamily: sec5.friends?.fontFamily,
      }}
    >
      <FriendList
        friends={friends}
        friendAvatars={friendAvatars}
        onSelect={onSelect}
        fontFamily={sec5.friends?.fontFamily}
      />
    </div>
  );
}
