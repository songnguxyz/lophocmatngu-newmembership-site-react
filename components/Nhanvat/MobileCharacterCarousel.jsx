/* MobileCharacterCarousel.jsx */
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MobileCharacterCarousel.module.css";

const MobileCharacterCarousel = ({ character, characters, onSelect }) => {
  const currentIndex = characters.findIndex((c) => c.id === character.id);
  const containerRef = useRef(null);

  const [fadeKey, setFadeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Reset animation and loaded flag when character changes
  useEffect(() => {
    setFadeKey((prev) => prev + 1);
    setLoaded(false);
  }, [character.id]);

  const handlePrev = () => {
    const prev = (currentIndex - 1 + characters.length) % characters.length;
    onSelect(characters[prev]);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % characters.length;
    onSelect(characters[next]);
  };

  // Keyboard navigation (desktop fallback)
  useEffect(() => {
    const handleKey = (e) => {
      const modalOpen = document.querySelector("[data-modal-open]");
      if (modalOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex]);

  // Swipe gestures on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX = 0;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      const delta = e.changedTouches[0].clientX - startX;
      if (delta > 50) handlePrev();
      if (delta < -50) handleNext();
    };
    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchend", onTouchEnd);
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentIndex]);

  // Preload neighbor images
  useEffect(() => {
    const next = (currentIndex + 1) % characters.length;
    const prev = (currentIndex - 1 + characters.length) % characters.length;
    [characters[next], characters[prev]].forEach((char) => {
      const img = new Image();
      img.src = char.posterUrl;
    });
  }, [character.id]);

  return (
    <div className={styles.mobileCarouselWrapper} ref={containerRef}>
      {/* Image */}
      {character.posterUrl ? (
        <img
          key={fadeKey}
          src={character.posterUrl || null}
          alt={character.name}
          width="300"
          height="450"
          loading="eager"
          className={`${styles.mobilePoster} ${loaded ? styles.loaded : ""}`}
          onLoad={() => setLoaded(true)}
        />
      ) : null}

      {/* Button row only for mobile, positioned below image */}
      <div className={styles.mobileButtonRow}>
        <button
          className={styles.mobileChevronInline}
          onClick={handlePrev}
          aria-label="Trước"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          className={styles.mobileChevronInline}
          onClick={handleNext}
          aria-label="Tiếp theo"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default MobileCharacterCarousel;
