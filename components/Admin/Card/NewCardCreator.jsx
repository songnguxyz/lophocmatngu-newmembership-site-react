import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";
import MultiImageUploader from "../Common/MultiImageUploader";

const NewCardCreator = () => {
  const [seasons, setSeasons] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [seasonId, setSeasonId] = useState("");
  const [rarity, setRarity] = useState("gray");
  const [cardImages, setCardImages] = useState([]);
  const [cardConfigs, setCardConfigs] = useState([]);
  const [latestOrder, setLatestOrder] = useState(0);
  const [message, setMessage] = useState("");

  const rarityBonusMap = {
    gray: 0,
    green: 1,
    purple: 2,
    gold: 3,
    red: 4,
    objective: 0,
  };

  useEffect(() => {
    const fetchSeasons = async () => {
      const q = query(collection(db, "seasons"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSeasons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchCharacters = async () => {
      const q = query(collection(db, "characters"), orderBy("order"));
      const snapshot = await getDocs(q);
      setCharacters(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const q = query(collection(db, "cards"), orderBy("order", "desc"), limit(1));
      const snapshot = await getDocs(q);
      setLatestOrder(snapshot.empty ? 0 : snapshot.docs[0].data().order);
    };
    fetchLatestOrder();
  }, []);

  const handleImageUploadSuccess = (images) => {
    setCardImages(images.map((img) => img.url));
    setCardConfigs(images.map(() => ({ characterId: "", customName: "" })));
  };

  const handleCharacterChange = (index, characterId) => {
    const updatedConfigs = [...cardConfigs];
    updatedConfigs[index].characterId = characterId;
    updatedConfigs[index].customName = "";
    setCardConfigs(updatedConfigs);
  };

  const handleCustomNameChange = (index, name) => {
    const updatedConfigs = [...cardConfigs];
    updatedConfigs[index].characterId = "custom";
    updatedConfigs[index].customName = name;
    setCardConfigs(updatedConfigs);
  };

  const handleCreateCards = async () => {
    if (!seasonId || !rarity || cardImages.length === 0) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      let newOrder = latestOrder;
      for (let i = 0; i < cardImages.length; i++) {
        newOrder++;
        const config = cardConfigs[i];
        let characterData;

        if (config.characterId === "custom") {
          characterData = {
            name: config.customName || "Chưa đặt tên",
            gender: "Khác",
            attribute: "",
            class: "",
            avatarUrl: "",
          };
        } else {
          const found = characters.find((c) => c.id === config.characterId);
          if (!found) continue;
          characterData = found;
        }

        await addDoc(collection(db, "cards"), {
          characterId: config.characterId === "custom" ? null : characterData.id,
          characterName: characterData.name,
          gender: characterData.gender,
          avatarUrl: characterData.avatarUrl,
          cardImageUrl: cardImages[i],
          attribute: characterData.attribute,
          class: characterData.class,
          rarity,
          level: 1,
          exp: 0,
          quantity: 0,
          maxPerUser: 9999,
          seasonId,
          order: newOrder,
          createdAt: serverTimestamp(),
          random: Math.random(),
          stamina: 0,
          stats: {},
          subjectStats: {},
        });
      }

      setMessage(`✅ Tạo ${cardImages.length} card thành công!`);
      setCardImages([]);
      setCardConfigs([]);
      setLatestOrder(newOrder);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tạo card: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>✏️ Tạo Card Mới (Tối giản)</h3>
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
          <option value="objective">objective</option>
          <option value="subjectCards">subjectCards</option>
        </select>
      </div>

      <div>
        <label>Ảnh Cards:</label>
        <MultiImageUploader
          folder="cards"
          onUploadSuccess={handleImageUploadSuccess}
        />
      </div>

      {cardImages.length > 0 && (
        <div>
          <h4>Cấu hình Card:</h4>
          {cardImages.map((url, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                marginBottom: 10,
                padding: 10,
              }}
            >
              <img
                src={url}
                alt={`Card ${i + 1}`}
                style={{ width: 100, height: 130, objectFit: "cover" }}
              />
              <div>
                <label>Chọn nhân vật:</label>
                <select
                  value={cardConfigs[i]?.characterId || ""}
                  onChange={(e) => handleCharacterChange(i, e.target.value)}
                >
                  <option value="">-- chọn --</option>
                  <option value="custom">Khác (Nhập tên)</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender})
                    </option>
                  ))}
                </select>

                {cardConfigs[i]?.characterId === "custom" && (
                  <div>
                    <label>Nhập tên nhân vật:</label>
                    <input
                      type="text"
                      value={cardConfigs[i].customName}
                      onChange={(e) =>
                        handleCustomNameChange(i, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleCreateCards} disabled={cardImages.length === 0}>
        Tạo Card
      </button>

      <p>{message}</p>
    </div>
  );
};

export default NewCardCreator;
