import React, { useState, useMemo } from "react";
import { useFirebase } from "../../../../context/FirebaseContext";
import { useFetchOwnedCards } from "./useFetchOwnedCards";
import { toggleCard } from "./toggleCard";
import { handleConfirmPick } from "./handleConfirmPick";
import { CardInfoPanelForPick } from "./CardInfoPanelForPick";
import { usePreloadAbilities } from "./usePreloadAbilities";
import { PreloadPickPhaseAbilities } from "./PreloadPickPhaseAbilities";


export function PickPhase({ roomId, onCardsPicked }) {
  const { auth, db } = useFirebase();
  const user = auth.currentUser;
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null); // 👈 để dùng hiển thị panel
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  useFetchOwnedCards({ db, user, setCards });

  const getStatWithBuff = (card, key) => {
    const base = card.stats?.[key] || 0;
    const buff = card.buffs?.[key] || 0;
    const debuff = card.debuffs?.[key] || 0;
    return base + buff - debuff;
  };

  const getClassScore = (card) => {
    const s = getStatWithBuff(card, "Sức mạnh");
    const t = getStatWithBuff(card, "Trí lực");
    const d = getStatWithBuff(card, "Bền bỉ");
    const l = getStatWithBuff(card, "May mắn");
    const agi = getStatWithBuff(card, "Nhanh nhẹn");
    const cha = getStatWithBuff(card, "Uy tín");
    const dex = getStatWithBuff(card, "Khéo léo");

    return {
      Fighter: s * 1.8 + agi,
      Mage: t * 1.8 + l,
      Tank: s + d + cha,
      Assassin: agi + dex + l,
      Support: cha + dex * 1.2,
    };
  };

  const cardsWithClass = useMemo(() => {
    return cards.map((card) => {
      const score = getClassScore(card);
      const gameClass = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      return { ...card, gameClass };
    });
  }, [cards]);

  const classFilters = ["Fighter", "Mage", "Tank", "Assassin", "Support"];

  const filteredCards = useMemo(() => {
    return cardsWithClass.filter((card) => {
      const matchesSearch = card.characterName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [cardsWithClass, searchQuery]);
  const abilityMap = usePreloadAbilities(db, cards);

      
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#fef2f2", // test lớp phủ
        zIndex: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 2,
          height: "100%",
          overflow: "hidden", // không scroll toàn màn
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            width: "60%",
            padding: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Cụm Pick và Confirm */}
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: 5,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 6,
                marginBottom: 2,
                flexWrap: "nowrap",
              }}
            >
              {/* Các card được chọn */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  flex: 1,
                }}
              >
                {selectedCards.map((card) => {
                  const isSelectedForInfo =
                    selectedCard &&
                    selectedCard.ownedCardId === card.ownedCardId;
                  const size = isSelectedForInfo
                    ? "clamp(75px, 9vw, 130px)"
                    : "clamp(70px, 8vw, 120px)";
                  return (
                    <img
                      key={card.ownedCardId}
                      src={card.avatarUrl}
                      alt={card.characterName}
                      onClick={() => {
                        setSelectedCard(card);
                      }}
                      title="Bấm để xem thông tin"
                      style={{
                        width: size,
                        height: size,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: isSelectedForInfo
                          ? "2px solid #22c55e"
                          : "2px solid #e11d48",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                      }}
                    />
                  );
                })}
              </div>

              {/* Nút xác nhận và loại */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() =>
                    handleConfirmPick({
                      db,
                      roomId,
                      user,
                      selectedCards,
                      onCardsPicked,
                    })
                  }
                  disabled={selectedCards.length !== 5}
                  style={{
                    padding: "4px 8px",
                    backgroundColor:
                      selectedCards.length === 5 ? "#4ade80" : "#ccc",
                    border: "none",
                    borderRadius: 4,
                    cursor:
                      selectedCards.length === 5 ? "pointer" : "not-allowed",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  ✅ {selectedCards.length}/5
                </button>

                <button
                  onClick={() => {
                    if (!selectedCard) return;
                    const newList = selectedCards.filter(
                      (c) => c.ownedCardId !== selectedCard.ownedCardId
                    );
                    setSelectedCards(newList);
                    setSelectedCard({
                      characterName: "—",
                      stats: {},
                      buffs: {},
                      debuffs: {},
                    });
                  }}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: selectedCard ? "pointer" : "not-allowed",
                    fontSize: 12,
                  }}
                  disabled={!selectedCard}
                >
                  ❌ Loại
                </button>
              </div>
            </div>
          </div>

          {/* search + filter */}
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: 4,
              height: 50,
              flexShrink: 0,
              marginBottom: 8,
              overflowX: "auto",
              whiteSpace: "nowrap",
              paddingRight: 4,
            }}
          >
            <input
              type="text"
              placeholder="🔍 Tìm tên nhân vật..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px 8px",
                width: 160,
                minWidth: 130,
                fontSize: 13,
                border: "1px solid #ccc",
                borderRadius: 4,
                marginRight: 4,
              }}
            />

            {[...classFilters, "Tất cả"].map((role) => {
              const isActive =
                selectedFilter === role ||
                (role === "Tất cả" && !selectedFilter);
              return (
                <button
                  key={role}
                  onClick={() =>
                    setSelectedFilter(role === "Tất cả" ? "" : role)
                  }
                  style={{
                    padding: "4px 8px",
                    marginRight: 4,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    backgroundColor: isActive ? "#4ade80" : "#606060",
                    color: "#fff",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div
            style={{
              height: "calc(100vh - 140px)",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(clamp(68px, 8vw, 120px), 1fr))",
              gap: 8, // 👈 tăng nhẹ gap để có không gian
              justifyItems: "center", // ✅ căn avatar giữa mỗi cột
              scrollbarWidth: "thin",
              msOverflowStyle: "auto",
            }}
          >
            {filteredCards.map((card) => {
              const isSelected = selectedCards.some(
                (c) => c.ownedCardId === card.ownedCardId
              );
              const shouldDim =
                selectedFilter && card.gameClass !== selectedFilter;

              return (
                <div
                  key={card.ownedCardId}
                  style={{
                    opacity: shouldDim ? 0.2 : 1,
                    transition: "opacity 0.3s",
                  }}
                  onClick={() => {
                    toggleCard({ card, selectedCards, setSelectedCards });
                    setSelectedCard(card); // 👈 gán vào panel luôn
                  }}
                >
                  <img
                    src={card.avatarUrl}
                    alt={card.characterName}
                    style={{
                      width: "clamp(68px, 8vw, 120px)",
                      height: "clamp(68px, 8vw, 120px)",
                      borderRadius: 4,
                      objectFit: "cover",
                      border: isSelected
                        ? "2px solid #4ade80"
                        : "1px solid #888",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: "40%",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Card Info Panel */}
          <div style={{ flex: "none" }}>
            <CardInfoPanelForPick
              selectedCard={selectedCard}
              db={db}
              abilitiesMap={abilityMap}
            />
          </div>
          <PreloadPickPhaseAbilities abilityMap={abilityMap} />
        </div>
      </div>
    </div>
  );
}
