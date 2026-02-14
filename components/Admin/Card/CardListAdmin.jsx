// CardListAdmin.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebase";
import EditCardForm from "./EditCardForm";

const CardListAdmin = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [cards, setCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [initialCardData, setInitialCardData] = useState(null);
  const rarities = [
    "gray",
    "green",
    "purple",
    "gold",
    "red",
    "objective",
    "subjectCards",
  ];

  useEffect(() => {
    const fetchSeasons = async () => {
      const q = query(collection(db, "seasons"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setSeasons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchSeasons();
  }, []);

  const getCardStatCount = async (cardTemplateId, status) => {
    const q = query(
      collection(db, "ownedCards"),
      where("cardTemplateId", "==", cardTemplateId),
      where("status", "==", status)
    );
    const snap = await getDocs(q);
    return snap.size;
  };

  const fetchCards = useCallback(async () => {
    if (!selectedSeason || !selectedRarity) return setCards([]);

    const q = query(
      collection(db, "cards"),
      where("seasonId", "==", selectedSeason),
      where("rarity", "==", selectedRarity),
      orderBy("order")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const enriched = await Promise.all(
      data.map(async (card) => {
        const ownedCount = await getCardStatCount(card.id, "active");
        const consumedCount = await getCardStatCount(card.id, "consumed");
        return { ...card, ownedCount, consumedCount };
      })
    );
    setCards(enriched);
  }, [selectedSeason, selectedRarity]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleEditCard = (cardId) => {
    const found = cards.find((c) => c.id === cardId);
    if (found) {
      setInitialCardData(found);
      setEditingCardId(cardId);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa card template này?")) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "cards", cardId));
      await batch.commit();
      alert("✅ Đã xóa card template thành công");
      fetchCards();
      setEditingCardId(null);
    } catch (e) {
      console.error(e);
      alert("❌ Lỗi khi xóa: " + e.message);
    }
  };

  const handleUpdateCardSuccess = () => {
    setEditingCardId(null);
    setInitialCardData(null);
    fetchCards();
  };

  return (
    <div style={{ padding: 20 }}>
      {!editingCardId && <h3>📊 Danh sách Card</h3>}

      {!editingCardId && (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={{ marginRight: 10 }}>Chọn mùa:</label>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setSelectedRarity("");
              }}
            >
              <option value="">-- Chọn mùa --</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.id}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ marginRight: 10 }}>Chọn độ hiếm:</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              disabled={!selectedSeason}
            >
              <option value="">-- Chọn độ hiếm --</option>
              {rarities.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {editingCardId && initialCardData ? (
        <EditCardForm
          initialCardData={initialCardData}
          onUpdateSuccess={handleUpdateCardSuccess}
          onCancel={() => {
            setEditingCardId(null);
            setInitialCardData(null);
          }}
        />
      ) : cards.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                background: "#fff",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={card.cardImageUrl}
                  alt={card.characterName}
                  style={{
                    width: 80,
                    height: 100,
                    objectFit: "cover",
                    marginRight: 10,
                  }}
                />
                <div>
                  <h4 style={{ margin: 0 }}>{card.characterName}</h4>
                  <p style={{ margin: "4px 0" }}>Độ hiếm: {card.rarity}</p>
                </div>
              </div>

              <p>Sở hữu: {card.ownedCount}</p>
              <p>Đã dùng: {card.consumedCount}</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 10,
                  gap: 6,
                }}
              >
                <button
                  onClick={() => handleEditCard(card.id)}
                  style={{
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                  }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Không có card nào.</p>
      )}
    </div>
  );
};

export default CardListAdmin;
