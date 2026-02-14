// --- AbilityForm.jsx ---
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  getDocs,
} from "firebase/firestore";
import Modal from "../Common/Modal";
import ImageUploader from "../Common/ImageUploader";
import styles from "./AbilityManager.module.css";
import ActiveSkillForm from "./ActiveSkillForm";
import PassiveSkillForm from "./PassiveSkillForm";

const AbilityForm = ({
  characters = [],
  rarities = [],
  ability,
  onClose,
  onSaved,
}) => {
  const [formState, setFormState] = useState({
    skillCategory: "active",
    meta: {
      characterId: "",
      imageUrl: "",
      name: "",
      description: "",
      unlockRarity: "",
    },
    active: {
      type: "damage",
      area: "oneEnemy",
      scaleWith: "subject",
      stat: "",
      subject: "",
      value: 0,
      status: "",
      cooldown: 0,
      duration: 0,
      cancelBuffType: "none",
    },
    passive: {
      trigger: {
        type: "",
        value: 0,
        chance: 100,
        skillName: "",
      },
      effect: {
        type: "",
        value: 0,
        duration: 0,
        status: "",
        target: "self",
        stat: "",
      },
    },
  });

  const [characterStats, setCharacterStats] = useState([]);

  const getCharacterData = useCallback(async (characterId) => {
    if (!characterId) {
      setCharacterStats([]);
      return;
    }
    try {
      // Tìm card đầu tiên có characterId trùng khớp
      const q = query(collection(db, "cards"));
      const snapshot = await getDocs(q);
      const cards = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const card = cards.find((c) => c.characterId === characterId);
      if (card) {
        setCharacterStats(Object.keys(card.stats || {}));
      } else {
        setCharacterStats([]);
      }
    } catch (err) {
      console.error("Lỗi lấy stats từ card:", err);
    }
  }, []);

  useEffect(() => {
    if (ability) {
      setFormState({
        skillCategory: ability.skillCategory || "active",
        meta: {
          characterId: ability.characterId || ability.meta?.characterId || "",
          imageUrl: ability.meta?.imageUrl || "",
          name: ability.meta?.name || "",
          description: ability.meta?.description || "",
          unlockRarity: ability.meta?.unlockRarity || "",
        },
        active: ability.active || formState.active,
        passive: ability.passive || formState.passive,
      });
    }
  }, [ability]);

  useEffect(() => {
    if (formState.meta?.characterId) {
      getCharacterData(formState.meta.characterId);
    }
  }, [formState.meta?.characterId, getCharacterData]);

  const handleChange = (section, key, value) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleMetaChange = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...formState,
      characterId: formState.meta.characterId,
      imageUrl: formState.meta.imageUrl,
      name: formState.meta.name,
      description: formState.meta.description,
      unlockRarity: formState.meta.unlockRarity,
      updatedAt: new Date(),
    };

    try {
      if (ability?.id) {
        await updateDoc(doc(db, "ability", ability.id), payload);
        onSaved({ id: ability.id, ...payload }, true);
      } else {
        const docRef = await addDoc(collection(db, "ability"), {
          ...payload,
          createdAt: new Date(),
        });
        onSaved({ id: docRef.id, ...payload }, false);
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className={styles.formGroup}>
        <label>Loại kỹ năng:</label>
        <select
          value={formState.skillCategory}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, skillCategory: e.target.value }))
          }
        >
          <option value="active">Chủ động</option>
          <option value="passive">Bị động</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Nhân vật:</label>
        <select
          value={formState.meta.characterId}
          onChange={(e) => handleMetaChange("characterId", e.target.value)}
        >
          <option value="">-- Chọn --</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.gender})
            </option>
          ))}
        </select>
      </div>

      <ImageUploader
        folder="abilityImages"
        label="Ảnh kỹ năng"
        defaultImage={formState.meta.imageUrl}
        onUploadSuccess={(url) => handleMetaChange("imageUrl", url)}
        width={100}
        height={100}
      />

      <div className={styles.formGroup}>
        <label>Tên kỹ năng:</label>
        <input
          type="text"
          value={formState.meta.name}
          onChange={(e) => handleMetaChange("name", e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Mô tả:</label>
        <input
          type="text"
          value={formState.meta.description}
          onChange={(e) => handleMetaChange("description", e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Độ hiếm kích hoạt:</label>
        <select
          value={formState.meta.unlockRarity}
          onChange={(e) => handleMetaChange("unlockRarity", e.target.value)}
        >
          <option value="">-- chọn --</option>
          {rarities.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {formState.skillCategory === "active" ? (
        <ActiveSkillForm
          active={formState.active}
          onChange={(key, value) => handleChange("active", key, value)}
          characterStats={characterStats}
        />
      ) : (
        <PassiveSkillForm
          passive={formState.passive}
          onChange={(section, key, value) => {
            setFormState((prev) => ({
              ...prev,
              passive: {
                ...prev.passive,
                [section]: {
                  ...prev.passive[section],
                  [key]: value,
                },
              },
            }));
          }}
        />
      )}

      <button className={styles.submitBtn} onClick={handleSubmit}>
        {ability ? "Lưu chỉnh sửa" : "Tạo kỹ năng"}
      </button>
    </Modal>
  );
};

export default AbilityForm;
