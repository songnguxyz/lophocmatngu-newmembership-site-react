// src/components/Nhanvat/FriendList.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import useIsMobile from "../Shared/useIsMobile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FriendList.module.css";

const FriendList = ({
  friends = [], // [{ value, comment, avatarCommentUrl }]
  friendAvatars = [], // [{ id, name, avatarUrl, … }]
  onSelect,
  fontFamily,
  characterName = "",
}) => {
  const [page, setPage] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const isMobile = useIsMobile();
  const wrapperRef = useRef(null);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(friendAvatars.length / ITEMS_PER_PAGE);

  // Normalize fontFamily to string
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  // Slice once
  const current = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return friendAvatars.slice(start, start + ITEMS_PER_PAGE);
  }, [friendAvatars, page]);

  // Preload all comment avatars
  useEffect(() => {
    friends.forEach((f) => {
      if (f.avatarCommentUrl) {
        const img = new Image();
        img.src = f.avatarCommentUrl;
      }
    });
  }, [friends]);

  // Mobile: tap outside to reset
  useEffect(() => {
    if (!isMobile || activeIndex === null) return;
    const handler = (e) => {
      if (!e.target.closest(`.${styles.friendAvatarWrapper}`)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [isMobile, activeIndex]);

  const onCardClick = (i, friend) => {
    if (isMobile) {
      if (activeIndex === i) {
        onSelect?.(friend);
        setActiveIndex(null);
      } else {
        setActiveIndex(i);
      }
    } else {
      onSelect?.(friend);
    }
  };

  return (
    <div
      className={styles.friendListWrapper}
      ref={wrapperRef}
      style={fontFamilyString ? { fontFamily: fontFamilyString } : undefined}
    >
      <div className={styles.friendFooter}>
        <h3
          className={styles.friendTitle}
          style={
            fontFamilyString ? { fontFamily: fontFamilyString } : undefined
          }
        >
          Bạn bè ({friendAvatars.length})
        </h3>
        {totalPages > 1 && (
          <div className={styles.carouselControls}>
            <button
              onClick={() => {
                setPage((p) => (p - 1 + totalPages) % totalPages);
                setActiveIndex(null);
              }}
              className={styles.carouselBtn}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={() => {
                setPage((p) => (p + 1) % totalPages);
                setActiveIndex(null);
              }}
              className={styles.carouselBtn}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.friendRow}>
        {current.map((avatarData, idx) => {
          const cfg = friends.find((f) => f.value === avatarData.id) || {};
          const { comment, avatarCommentUrl } = cfg;
          const isActive = activeIndex === idx;

          return (
            <div
              key={avatarData.id}
              className={styles.friendCard}
              onMouseEnter={() => !isMobile && setActiveIndex(idx)}
              onMouseLeave={() => !isMobile && setActiveIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(idx, avatarData);
              }}
            >
              <div className={styles.friendAvatarWrapper}>
                {/* Gốc */}
                <img
                  src={avatarData.avatarUrl}
                  alt={avatarData.name}
                  className={styles.friendAvatar}
                />
                {/* Comment (chồng lên) */}
                {avatarCommentUrl && (
                  <img
                    src={avatarCommentUrl}
                    alt={`${avatarData.name}-comment`}
                    className={`${styles.friendAvatar} ${
                      styles.commentAvatar
                    } ${isActive ? styles.show : ""}`}
                  />
                )}
              </div>
              <div
                className={styles.friendName}
                style={
                  fontFamilyString
                    ? { fontFamily: fontFamilyString }
                    : undefined
                }
              >
                {avatarData.name}
              </div>

              {isActive && comment && (
                <div className={styles.friendBubble}>
                  <div
                    className={styles.bubbleContent}
                    style={
                      fontFamilyString
                        ? { fontFamily: fontFamilyString }
                        : undefined
                    }
                  >
                    <strong
                      style={
                        fontFamilyString
                          ? { fontFamily: fontFamilyString }
                          : undefined
                      }
                    >
                      {avatarData.name}
                    </strong>
                    : {comment}
                  </div>
                  <div className={styles.bubbleArrow} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(FriendList);
//code đang work bình thường
