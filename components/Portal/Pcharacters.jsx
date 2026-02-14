// src/components/Portal/PCharacters.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from "./PCharacters.module.css";

const PCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const visibleCharactersCount = 3;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const loadCharacters = async () => {
      setLoading(true);
      setError(null);

      try {
        const approvedQuery = query(
          collection(db, "characters"),
          where("approved", "==", true),
          orderBy("order", "asc")
        );

        const unsubscribeSnapshot = onSnapshot(
          approvedQuery,
          (snapshot) => {
            const charactersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCharacters(charactersData);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error("Lỗi khi lắng nghe snapshot:", err);
          }
        );

        return () => {
          unsubscribeAuth();
          unsubscribeSnapshot();
        };
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error("Lỗi khi tải nhân vật:", e);
      }
    };

    loadCharacters();
  }, []);

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
  };

  const handleNextClick = () => {
    setStartIndex((prevIndex) =>
      Math.min(
        prevIndex + visibleCharactersCount,
        characters.length - visibleCharactersCount
      )
    );
  };

  const handlePrevClick = () => {
    setStartIndex((prevIndex) =>
      Math.max(prevIndex - visibleCharactersCount, 0)
    );
  };

  if (loading) {
    return <div>Đang tải nhân vật...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  const visibleCharacters = characters.slice(
    startIndex,
    startIndex + visibleCharactersCount
  );

  return (
    <div className={styles.pcharactersContainer}>
      {user ? (
        <div className={styles.characterWrapper}>
          <div className={styles.characterListArea}>
            <button
              onClick={handlePrevClick}
              disabled={startIndex === 0}
              className={styles.arrowButton}
            ></button>
            <div className={styles.characterList}>
              {visibleCharacters.map((character) => (
                <div
                  key={character.id}
                  className={`${styles.characterItem} ${
                    selectedCharacter?.id === character.id
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => handleCharacterClick(character)}
                >
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className={styles.characterAvatar}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleNextClick}
              disabled={
                startIndex + visibleCharactersCount >= characters.length
              }
              className={styles.arrowButton}
            ></button>
          </div>
          <div className={styles.characterDetailArea}>
            {selectedCharacter ? (
              <>
                <h3 className={styles.characterName}>
                  {selectedCharacter.name}
                </h3>
                <p className={styles.characterDescription}>
                  {selectedCharacter.shortDescription}
                </p>
              </>
            ) : (
              <p>Chọn một nhân vật để xem mô tả.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Bạn cần đăng nhập để xem nội dung nhân vật.</p>
      )}
    </div>
  );
};

export default PCharacters;
