import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faAddressBook,
  faImages,
  faSuitcaseRolling,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./SocialButtons.module.css";
import FavoriteButton from "../Shared/FavoriteButton";

const buttons = [
  { tab: "info", icon: faUser, label: "Đặc điểm" },
  { tab: "friends", icon: faAddressBook, label: "Thông tin" },
  //{ tab: "album", icon: faImages, label: "Ảnh" },
 // { tab: "item", icon: faSuitcaseRolling, label: "Đồ đạc" },
  { tab: "stats", icon: faChartSimple, label: "Yêu/ghét" },
];

const SocialButtons = ({
  activeTab,
  onTabChange,
  iconOnly = false,
  character,
}) => {
  return (
    <div className={styles.socialButtons}>
      {buttons.map(({ tab, icon, label }, index) => (
        <div
          key={tab}
          className={`${styles.buttonWrapper} ${
            index === 0 ? styles.leftEdge : ""
          }`}
          data-tooltip={label}
        >
          <button
            className={`${styles.button} ${
              !iconOnly ? styles.textButton : ""
            } ${activeTab === tab ? styles.active : ""}`}
            onClick={() => onTabChange(tab)}
          >
            <FontAwesomeIcon icon={icon} />
            {!iconOnly && <span>{label}</span>}
          </button>
        </div>
      ))}

      <div
        className={styles.buttonWrapper}
        data-tooltip="Thêm nhân vật này vào yêu thích"
      >
        <FavoriteButton
          itemId={character.id}
          itemType="characters"
          showOnlyIcon={iconOnly}
          className={styles.favoriteButton}
        />
      </div>
    </div>
  );
};

export default SocialButtons;
