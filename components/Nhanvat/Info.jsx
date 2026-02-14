// src/components/Nhanvat/Info.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMars,
  faVenus,
  faFire,
  faTint,
  faWind,
  faMountain,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Info.module.css";

const NhanvatInfo = ({ character, fontFamily }) => {
  const fontFamilyString = Array.isArray(fontFamily)
    ? fontFamily.join(", ")
    : fontFamily;

  const genderIcon = character.gender === "male" ? faMars : faVenus;
  const elementIcons = {
    Fire: faFire,
    Water: faTint,
    Air: faWind,
    Earth: faMountain,
  };

  return (
    <div className={styles.infoBlock}>
      <div className={styles.personalInfo}>
        {character.birthdate && (
          <div
            className={styles.infoItem}
            style={{ fontFamily: fontFamilyString }}
          >
            <strong style={{ fontFamily: fontFamilyString }}>Ngày sinh:</strong>{" "}
            {character.birthdate}
          </div>
        )}
        {character.class && (
          <div
            className={styles.infoItem}
            style={{ fontFamily: fontFamilyString }}
          >
            <strong style={{ fontFamily: fontFamilyString }}>Lớp:</strong>{" "}
            {character.class}
          </div>
        )}
        {character.gender && (
          <div
            className={styles.infoItem}
            style={{ fontFamily: fontFamilyString }}
          >
            <strong style={{ fontFamily: fontFamilyString }}>Giới tính:</strong>{" "}
            <FontAwesomeIcon
              icon={genderIcon}
              className={styles.genderIcon}
              style={{ fontSize: "1.2rem", fontFamily: fontFamilyString }}
            />
          </div>
        )}
        {character.attribute && (
          <div
            className={styles.infoItem}
            style={{
              fontFamily: fontFamilyString,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <strong style={{ fontFamily: fontFamilyString }}>
              Thuộc tính:
            </strong>
            <FontAwesomeIcon
              icon={elementIcons[character.attribute]}
              style={{ color: character.elementColor }}
            />
            <span
              style={{
                textTransform: "capitalize",
                fontFamily: fontFamilyString,
              }}
            >
              {character.attribute}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhanvatInfo;
