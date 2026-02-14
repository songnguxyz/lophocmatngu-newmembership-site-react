import React, { useState, useEffect, useCallback } from "react";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase";
import ImageUploader from "../Common/ImageUploader";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";

const defaultStats = {
  "Sức mạnh": 0,
  "Trí lực": 0,
  "Bền bỉ": 0,
  "May mắn": 0,
  "Nhanh nhẹn": 0,
  "Uy tín": 0,
  "Khéo léo": 0,
};

const defaultSubjectStats = {
  "Thể dục": 0,
  "Logic": 0,
  "Khoa học": 0,
  "Xã hội": 0,
  "Sáng tạo": 0,
  "Nghệ thuật": 0,
  "Trưởng thành": 0,
};

const EditCardForm = ({ initialCardData, onUpdateSuccess, onCancel }) => {
  const [seasons, setSeasons] = useState([]);
  const [seasonId, setSeasonId] = useState("");
  const [rarity, setRarity] = useState("gray");
  const [stamina, setStamina] = useState(0);
  const [stats, setStats] = useState(defaultStats);
  const [subjectStats, setSubjectStats] = useState(defaultSubjectStats);
  const [newCardImageUrl, setNewCardImageUrl] = useState(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [attribute, setAttribute] = useState("");
  const [charClass, setCharClass] = useState("");
  const [customCharacterId, setCustomCharacterId] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    const fetchSeasons = async () => {
      const q = query(collection(db, "seasons"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSeasons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchSeasons();
  }, []);

  const initializeState = useCallback((data) => {
    setSeasonId(data?.seasonId || "");
    setRarity(data?.rarity || "gray");
    setStamina(data?.stamina || 0);
    setStats(data?.stats && Object.keys(data.stats).length > 0 ? data.stats : { ...defaultStats });
    setSubjectStats(data?.subjectStats && Object.keys(data.subjectStats).length > 0 ? data.subjectStats : { ...defaultSubjectStats });
    setCharacterName(data?.characterName || "");
    setGender(data?.gender || "");
    setAttribute(data?.attribute || "");
    setCharClass(data?.class || "");
    setCustomCharacterId(data?.characterId || "");
  }, []);

  useEffect(() => {
    if (initialCardData) {
      initializeState(initialCardData);
    }
  }, [initialCardData, initializeState]);

  const handleImageUpload = async (url) => {
    if (initialCardData?.cardImageUrl && url !== initialCardData.cardImageUrl) {
      await deleteImageFromUrl(initialCardData.cardImageUrl);
      setNewCardImageUrl(url);
    }
  };

  const handleAvatarUpload = async (url) => {
    if (initialCardData?.avatarUrl && url !== initialCardData.avatarUrl) {
      await deleteImageFromUrl(initialCardData.avatarUrl);
      setNewAvatarUrl(url);
    } else {
      setNewAvatarUrl(url);
    }
  };

  const handleStatsChange = (type, key, value) => {
    const update = { ...(type === "stats" ? stats : subjectStats) };
    update[key] = Number(value);
    type === "stats" ? setStats(update) : setSubjectStats(update);
  };

  const generateFirestoreId = () => {
    return doc(collection(db, "characters")).id;
  };

  const handleSave = async () => {
    if (!initialCardData) return;
    try {
      const cardDocRef = doc(db, "cards", initialCardData.id);
      const finalCharacterId =
        customCharacterId ||
        initialCardData.characterId ||
        generateFirestoreId();

      await updateDoc(cardDocRef, {
        characterName,
        gender,
        avatarUrl: newAvatarUrl || initialCardData.avatarUrl,
        attribute,
        class: charClass,
        characterId: finalCharacterId,
        cardImageUrl: newCardImageUrl || initialCardData.cardImageUrl,
        seasonId,
        rarity,
        stamina: Number(stamina),
        stats,
        subjectStats,
      });

      setMessage("✅ Đã cập nhật card!");
      onUpdateSuccess?.();
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi cập nhật: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>✏️ Chỉnh sửa Card</h3>

      <div>
        <label>Mùa:</label>
        <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
          <option value="">-- chọn mùa --</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name || s.id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Độ hiếm:</label>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          <option value="gray">Xám</option>
          <option value="green">Xanh</option>
          <option value="purple">Tím</option>
          <option value="gold">Vàng</option>
          <option value="red">Đỏ</option>
          <option value="subjectCards">subjectCards</option>
          <option value="objective">objective</option>
        </select>
      </div>

      <div>
        <label>Tên nhân vật:</label>
        <input
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
        />
      </div>

      <div>
        <label>characterId (nếu card tự tạo):</label>
        <input
          value={customCharacterId}
          onChange={(e) => setCustomCharacterId(e.target.value)}
        />
      </div>

      <div>
        <label>Attribute:</label>
        <input
          value={attribute}
          onChange={(e) => setAttribute(e.target.value)}
        />
      </div>

      <div>
        <label>Class:</label>
        <input
          value={charClass}
          onChange={(e) => setCharClass(e.target.value)}
        />
      </div>

      <div>
        <label>Giới tính:</label>
        <input value={gender} onChange={(e) => setGender(e.target.value)} />
      </div>

      <div>
        <label>Mệt (Stamina):</label>
        <input
          type="number"
          value={stamina}
          onChange={(e) => setStamina(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <h4>Chỉ số Stats:</h4>
          {Object.keys(stats).map((key) => (
            <div key={key}>
              <label>{key}:</label>
              <input
                type="number"
                value={stats[key]}
                onChange={(e) =>
                  handleStatsChange("stats", key, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div>
          <h4>Chỉ số SubjectStats:</h4>
          {Object.keys(subjectStats).map((key) => (
            <div key={key}>
              <label>{key}:</label>
              <input
                type="number"
                value={subjectStats[key]}
                onChange={(e) =>
                  handleStatsChange("subject", key, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>

      <h4>Ảnh Card:</h4>
      <ImageUploader
        folder="cards"
        defaultImage={initialCardData?.cardImageUrl}
        onUploadSuccess={handleImageUpload}
        width={140}
        height={180}
      />

      <h4>Ảnh Avatar:</h4>
      <ImageUploader
        folder="cardAvatars"
        defaultImage={initialCardData?.avatarUrl}
        onUploadSuccess={handleAvatarUpload}
        width={100}
        height={100}
      />

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave}>💾 Lưu thay đổi</button>
        <button onClick={onCancel} style={{ marginLeft: 10 }}>
          Hủy
        </button>
      </div>

      <p>{message}</p>
    </div>
  );
};

export default EditCardForm;
