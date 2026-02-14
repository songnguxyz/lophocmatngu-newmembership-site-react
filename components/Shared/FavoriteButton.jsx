// src/components/Shared/FavoriteButton.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./FavoriteButton.module.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const FavoriteButton = ({
  itemId,
  itemType,
  showOnlyIcon = false,
  className = "",
  baseTooltip = "",
}) => {
  const [user] = useAuthState(auth);
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine collection and field based on itemType
  const collectionName =
    itemType === "characters"
      ? "userFollows"
      : itemType === "comics"
      ? "userLikes"
      : itemType === "chapters"
      ? "userBookmarks"
      : null;
  const fieldName =
    itemType === "characters"
      ? "characterId"
      : itemType === "comics"
      ? "truyenId"
      : itemType === "chapters"
      ? "chapterId"
      : null;

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (user && collectionName) {
        const docId = `${user.uid}_${itemId}`;
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        setIsFavorite(docSnap.exists());
      } else {
        setIsFavorite(false);
      }
    };
    checkIfFavorite();
  }, [user, itemId, itemType]);

  const handleFavoriteClick = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập!");
      return;
    }
    if (!collectionName || !fieldName) {
      console.error(`Unsupported itemType: ${itemType}`);
      return;
    }

    const docId = `${user.uid}_${itemId}`;
    const docRef = doc(db, collectionName, docId);

    try {
      if (isFavorite) {
        await deleteDoc(docRef);
        setIsFavorite(false);
      } else {
        await setDoc(docRef, {
          [fieldName]: itemId,
          userId: user.uid,
          addedAt: new Date(),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <button
      className={className}
      onClick={handleFavoriteClick}
      title={baseTooltip}
    >
      <FontAwesomeIcon
        icon={faHeart}
        className={`${styles.favoriteIcon} ${isFavorite ? styles.active : ""}`}
      />
      {!showOnlyIcon && (
        <span className={styles.favoriteLabel}>
          {isFavorite ? "Đã yêu thích" : "Yêu thích"}
        </span>
      )}
    </button>
  );
};

FavoriteButton.propTypes = {
  itemId: PropTypes.string.isRequired,
  itemType: PropTypes.oneOf(["characters", "comics", "chapters"]).isRequired,
  showOnlyIcon: PropTypes.bool,
  className: PropTypes.string,
  baseTooltip: PropTypes.string,
};

export default FavoriteButton;
