// AbilityList.jsx
import React from "react";
import styles from "./AbilityManager.module.css";

const AbilityList = ({ characters, abilities, onEdit, onDelete, onCreate }) => {
  const groupedByCharacter = characters.map((char) => {
    const charId = (char.id || "").trim().toLowerCase();

    const charAbilities = abilities.filter((a) => {
      const abCharId = (a.characterId || a.meta?.characterId || "")
        .trim()
        .toLowerCase();
      return abCharId === charId;
    });

    return { ...char, abilities: charAbilities };
  });

  return (
    <div className={styles.abilityListContainer}>
      {groupedByCharacter.map((char) => (
        <div key={char.id} className={styles.charBlock}>
          <div className={styles.charInfo}>
            {char.avatarUrl && (
              <img
                src={char.avatarUrl}
                className={styles.charAvatarLarge}
                alt={char.name}
              />
            )}
            <div className={styles.charName}>{char.name}</div>
            <button
              className={styles.submitBtn}
              onClick={() => onCreate(char.id)}
            >
              Tạo kỹ năng
            </button>
          </div>
          <div className={styles.abilityRowList}>
            {char.abilities.map((ab) => (
              <div key={ab.id} className={styles.abilityRowItem}>
                <img
                  src={ab.imageUrl}
                  className={styles.skillIcon}
                  alt={ab.name}
                />
                <div className={styles.abilityDetail}>
                  <strong>{ab.name}</strong>
                </div>
                <div className={styles.abilityDetail}>{ab.unlockRarity}</div>
                <div className={styles.abilityDetail}>{ab.description}</div>
                <button className={styles.btnEdit} onClick={() => onEdit(ab)}>
                  ✏️ Sửa
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() => onDelete(ab.id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbilityList;
