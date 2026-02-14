import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, query, deleteDoc, doc } from "firebase/firestore";
import AbilityList from "./AbilityList.jsx";
import AbilityForm from "./AbilityForm";
import styles from "./AbilityManager.module.css";

const AbilityManager = () => {
  const [characters, setCharacters] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const fetchInitial = async () => {
      const cardDocs = await getDocs(collection(db, "cards"));
      const cards = cardDocs.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((card) => card.characterId);

      // Tạo danh sách unique theo characterId
      const characterMap = {};
      cards.forEach((card) => {
        const cId = card.characterId;
        if (!characterMap[cId]) {
          characterMap[cId] = {
            id: cId,
            name: card.characterName || "Chưa rõ",
            avatarUrl: card.avatarUrl || "",
            gender: card.gender || "Khác",
          };
        }
      });

      setCharacters(Object.values(characterMap));

      const rarities = Array.from(new Set(cards.map((c) => c.rarity)));
      setRarities(rarities);

      // Lấy abilities và flatten nếu có field "ability"
      const abs = await getDocs(query(collection(db, "ability")));
      const abilityList = abs.docs.map((doc) => {
        const raw = doc.data();
        const flat = raw.ability
          ? { ...raw.ability, id: doc.id }
          : { ...raw, id: doc.id };
        return flat;
      });

      setAbilities(abilityList);
    };

    fetchInitial();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa kỹ năng này?")) {
      await deleteDoc(doc(db, "ability", id));
      setAbilities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const openForm = (ability = null) => {
    setSelectedAbility(ability);
    setShowModal(true);
    setNotice("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.topAction}>
        <h3>🧠 Quản lý Kỹ Năng (Ability)</h3>
      </div>

      {notice && <div className={styles.modalNotice}>{notice}</div>}

      <AbilityList
        characters={characters}
        abilities={abilities}
        onEdit={(ab) => {
          openForm({
            ...ab,
            characterId: ab.characterId || ab.meta?.characterId || "",
          });
        }}
        onDelete={handleDelete}
        onCreate={(characterId) => {
          openForm({ characterId });
        }}
      />

      {showModal && (
        <AbilityForm
          characters={characters}
          rarities={rarities}
          ability={selectedAbility}
          onClose={() => setShowModal(false)}
          onSaved={(newAbility, isEdit) => {
            setAbilities((prev) => {
              if (isEdit) {
                return prev.map((a) =>
                  a.id === newAbility.id ? newAbility : a
                );
              } else {
                return [...prev, newAbility];
              }
            });
            const char = characters.find(
              (c) => c.id === newAbility.characterId
            );
            const charName = char?.name || "";
            const label = isEdit ? "Sửa" : "Tạo";
            setNotice(
              `✅ ${label} kỹ năng "${newAbility.name}" cho ${charName} || độ hiếm ${newAbility.unlockRarity} thành công!`
            );
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AbilityManager;
