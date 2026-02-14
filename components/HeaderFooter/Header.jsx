import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import NavigationBar from "./NavigationBar";
import styles from "./Header.module.css";

const fallbackImage =
  "https://via.placeholder.com/1200x400?text=Header+Not+Found";

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(true);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const docRef = doc(db, "header", "headerData");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHeaderData(docSnap.data());
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadHeaderData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <div>Loading Header...</div>;
  if (error) return <div>Error loading header: {error.message}</div>;
  if (!headerData) return null;

  const {
    fbImageUrl = "",
    content = "",
    backgroundSize = "cover",
    backgroundPosition = "center center",
    headerHeight = "300px",
    backgroundRepeat = "no-repeat",
    visiblePages = [],
    customCSS = "",
    opacity = 1,
  } = headerData;

  const currentPath = location.pathname;
  const shouldShowHeaderImage =
    visiblePages.length === 0 || visiblePages.includes(currentPath);

  const finalImageUrl = imageLoaded ? fbImageUrl : fallbackImage;

  // 🚀 Nếu không cần hiển thị header ➔ Chỉ render NavigationBar thôi
  if (!shouldShowHeaderImage) {
    return (
      <header className={`${styles.header} ${scrolled ? styles.shrink : ""}`}>
        <NavigationBar />
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.shrink : ""}`}>
      <NavigationBar />
      <div className={styles.headerWrapper}>
        <div
          className={styles.headerImage}
          style={{
            backgroundImage: `url('${finalImageUrl}')`,
            backgroundSize,
            backgroundPosition,
            backgroundRepeat,
            height: headerHeight,
            opacity,
            ...parseCustomCSS(customCSS),
          }}
        >
          {content && <div className={styles.headerContent}>{content}</div>}
        </div>
      </div>

      {/* Hidden image loader to catch errors */}
      <img
        src={fbImageUrl}
        alt="Header preload"
        style={{ display: "none" }}
        onError={() => setImageLoaded(false)}
        onLoad={() => setImageLoaded(true)}
      />
    </header>
  );
};

const parseCustomCSS = (cssString) => {
  try {
    const styleObject = {};
    cssString.split(";").forEach((rule) => {
      const [property, value] = rule.split(":").map((str) => str.trim());
      if (property && value) {
        styleObject[property] = value;
      }
    });
    return styleObject;
  } catch (error) {
    console.error("Error parsing custom CSS:", error);
    return {};
  }
};

export default Header;
