import React, { useEffect, useState, useRef } from "react";
import { useFirebase } from "../../../../context/FirebaseContext";
import { useAbility } from "../../useAbility/index";
import AbilitySelectionHandler from "../../shared/AbilitySelectionHandler";
import InitActionGauge from "../../turn/InitActionGauge";
import UpdateRoomTurnStructure from "../../turn/UpdateRoomTurnStructure";
import MessageLog from "../../shared/MessageLog";
import ForcedActionPanel from "../../shared/ForcedActionPanel.jsx";
import { useFetchRoomData } from "./useFetchRoomData";
import { useApplyTurnEffects } from "./useApplyTurnEffects";
import { useTurnCountdown } from "./useTurnCountdown";
import { handleSkipTurn } from "./useSkipTurn";
import { handleCardClick } from "./handleCardClick.js";
import { renderCard } from "./renderCard";
import { MAX_TURN_LIMIT } from "../../shared/victoryUtils";
import PauseGameControl from "./PauseGameControl";
import { updateDoc, doc, getDocs } from "firebase/firestore";
import { RewardSubject } from "../../shared/newSubjectFlag/RewardSubject.js";
import { SubjectComposer } from "../../shared/newSubjectFlag/SubjectComposer.jsx";
import { PlayerStatusBar } from "./PlayerStatusBar.jsx";
import { AbilityPanel } from "../../shared/Panel/AbilityPanel.jsx";
import { PreloadAbilityIconsRenderer } from "../../shared/Panel/PreloadAbilityIconsRenderer.js";
import { initSubjectQueue } from "../../shared/newSubjectFlag/initSubjectQueue.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export function GamePlayCardBattle({ roomId, onExit }) {
  const { db, auth } = useFirebase();
  const user = auth.currentUser;
  const [roomData, setRoomData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [opponentCards, setOpponentCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [chosenSubject, setChosenSubject] = useState("");
  const [availableAbilitiesMap, setAvailableAbilitiesMap] = useState({});
  const availableAbilitiesMapRef = useRef({});
  const [countdown, setCountdown] = useState(60);
  const [battleLogs, setBattleLogs] = useState([]);

  //const [hoveredAbility, setHoveredAbility] = useState(null);
  //const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    const el = document.documentElement;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        // Android & Chrome
        el.requestFullscreen();
        setIsFullscreen(true);
      } else if (isIOS) {
        // iOS fallback
        window.scrollTo(0, 1);
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const [floatingDamages, setFloatingDamages] = useState([]);
  const addFloatingDamage = ({
    id,
    targetCardId,
    damageValue,
    type,
    delay = 0,
  }) => {
    const newDamage = {
      id, // đã là unique rồi
      displayId: `${id}_${Math.random().toString(36).slice(2, 4)}`,
      cardId: targetCardId,
      value: damageValue,
      type,
    };

    const duration = type === "crit" ? 1400 : 1100;

    setTimeout(() => {
      setFloatingDamages((prev) => {
        const updated = [...prev, newDamage];

        setTimeout(() => {
          setFloatingDamages((current) =>
            current.filter((d) => d.id !== newDamage.id)
          );
        }, duration);

        return updated;
      });
    }, delay);
  };

  // hết floating

  const { handleUseAbility } = useAbility({
    db,
    setMyCards,
    setOpponentCards,
    onFloatingDamage: addFloatingDamage, // 👈 THÊM DÒNG NÀY
    availableAbilitiesMapRef,
  });

  const role = roomData?.host === user?.uid ? "host" : "guest";
  const opponentRole = role === "host" ? "guest" : "host";
  const myName = roomData?.[role + "Name"] || "Bạn";
  const opponentName = roomData?.[opponentRole + "Name"] || "Đối thủ";
  //đoạn tỉ số cờ//
  const myFlagCount = roomData?.flags?.[role]?.length ?? 0;
  const opponentFlagCount = roomData?.flags?.[opponentRole]?.length ?? 0;

  //tỉ số môn học
  const mySubjectCount = roomData?.obtainedSubjects?.[role]?.length ?? 0;
  const opponentSubjectCount =
    roomData?.obtainedSubjects?.[opponentRole]?.length ?? 0;

  //đếm hiệp phụ thêm
  const currentTurnNumber = roomData?.turnNumber ?? 0;
  const inExtraRound = currentTurnNumber >= MAX_TURN_LIMIT + 1;
  const extraRoundNumber =
    currentTurnNumber >= MAX_TURN_LIMIT + 1
      ? currentTurnNumber - MAX_TURN_LIMIT
      : 0;

  const currentTurnName =
    [...myCards, ...opponentCards].find(
      (c) => c.ownedCardId === roomData?.currentActorId
    )?.characterName || "...";

  const myAllCards = [...myCards];
  const opponentAllCards = [...opponentCards];

  const selectedCard = [...myAllCards, ...opponentAllCards].find(
    (c) => c.ownedCardId === selectedCardId
  );
  const selectedTargetCard = [...myAllCards, ...opponentAllCards].find(
    (c) => c.ownedCardId === selectedTargetId
  );
  const currentCard = [...myAllCards, ...opponentAllCards].find(
    (c) => c.ownedCardId === roomData?.currentActorId
  );

  useFetchRoomData({
    db,
    roomId,
    user,
    setRoomData,
    setMyCards,
    setOpponentCards,
    setAvailableAbilitiesMap,
  });
  useEffect(() => {
    availableAbilitiesMapRef.current = availableAbilitiesMap;
  }, [availableAbilitiesMap]);

  useEffect(() => {
    if (roomData) {
      initSubjectQueue({ db, roomId, roomData });
    }
  }, [roomData]);

  useApplyTurnEffects({
    db,
    roomId,
    roomData,
    role,
    opponentRole,
    onFloatingDamage: addFloatingDamage,
    availableAbilitiesMap: availableAbilitiesMapRef.current,
  });

  useTurnCountdown({
    roomData,
    myCards,
    setCountdown,
    handleSkipTurn: () =>
      handleSkipTurn({ db, roomId, roomData, currentCard, role }),
  });
  //đoạn này để thêm ability vào góc phải
  useEffect(() => {
    if (!roomData?.currentActorId) return;
    const current = [...myAllCards, ...opponentAllCards].find(
      (c) => c.ownedCardId === roomData.currentActorId
    );

    if (current && current.ownerId === user.uid) {
      setSelectedCardId(current.ownedCardId);
      setSelectedAbility(null);
      setSelectedTargetId(null);
    }
  }, [roomData?.currentActorId]);
  //floating damage

  const seenIdsRef = useRef(new Set());
  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "damageEvents"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const changes = snapshot.docChanges();

      changes.forEach((change, index) => {
        if (change.type !== "added") return;

        const ev = change.doc.data();
        if (!ev?.id || seenIdsRef.current.has(ev.id)) return;
        if (ev.type === "none") return;

        seenIdsRef.current.add(ev.id); // ✅ đánh dấu đã xử lý

        const value = Number(ev.value);

        addFloatingDamage({
          id: ev.id, // ✅ dùng đúng id từ server
          targetCardId: ev.targetId,
          damageValue:
            ev.type === "miss" ? 0 : ev.type === "heal" ? value : -value,
          type: ev.type,
          delay: index * 300,
        });
      });
    });

    return () => unsubscribe();
  }, [db, roomId]);
  //hết floating

  // ✅ Battlelog Gọi lại khi sang lượt mới
  useEffect(() => {
    const fetchBattleLogs = async () => {
      try {
        const q = query(
          collection(db, "rooms", roomId, "battleLogs"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const logs = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            return (
              d?.message ||
              (d.abilityName
                ? `${d.actorName} dùng kỹ năng "${d.abilityName}"${
                    d.resultText ? ` → ${d.resultText}` : ""
                  }`
                : d.resultText || "")
            );
          })
          .reverse(); // 👈 THÊM DÒNG NÀY
        setBattleLogs(logs);
      } catch (err) {
        console.error("Lỗi khi load battleLogs:", err);
      }
    };

    if (roomData?.turnNumber >= 1) {
      fetchBattleLogs();
    }
  }, [roomData?.turnNumber]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!roomData) return null;

  return (
    <>
      {" "}
      {/* LOGIC KHỞI TẠO LƯỢT – GIỮ NGUYÊN */}
      <InitActionGauge
        cards={[...myCards, ...opponentCards]}
        setCards={(newCards) => {
          const newMyCards = newCards.filter((c) =>
            myCards.some((m) => m.ownedCardId === c.ownedCardId)
          );
          const newOpponentCards = newCards.filter((c) =>
            opponentCards.some((m) => m.ownedCardId === c.ownedCardId)
          );
          setMyCards(newMyCards);
          setOpponentCards(newOpponentCards);
        }}
      />
      <UpdateRoomTurnStructure
        myCards={myCards}
        opponentCards={opponentCards}
        roomData={roomData}
        roomId={roomId}
        setRoomData={setRoomData}
      />
      {/*=== GIAO DIỆN GAME ===*/}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "calc(var(--vh, 1vh) * 100)",
          backgroundColor: "#ccc",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          WebkitOverflowScrolling: "touch", // iOS mượt hơn
          touchAction: "none",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto", // Cho phép scroll dọc nếu cần
            padding: 6,
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* ===== MAIN BATTLE LAYOUT ===== */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: "scale(1)", // 👈 scale toàn bộ giao diện để vừa mobile
              transformOrigin: "top center",
              width: "100%",
              overflow: "hidden", // 👈 tránh scroll ngang
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between", // quan trọng
                gap: 6,
                width: "100%",
                maxWidth: 1440,
              }}
            >
              {/* LEFT MAIN BATTLE FIELD */}
              <div
                style={{
                  flex: 5, // 4 phần
                  minWidth: 0, // tránh tràn
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* OPPONENT CARDS */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    marginBottom: 20,
                    marginTop: 10,
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  {roomData?.turnNumber >= 1 ? (
                    opponentCards.map((card) =>
                      renderCard({
                        card,
                        isMine: false,
                        selectedCardId,
                        selectedTargetId,
                        selectedAbility,
                        selectedCard,
                        selectedTargetCard,
                        availableAbilitiesMap,
                        chosenSubject,
                        roomData,
                        handleCardClick,
                        setSelectedCardId,
                        setSelectedAbility,
                        setSelectedTargetId,
                        setChosenSubject,
                        myCards: myAllCards,
                        opponentCards: opponentAllCards,
                        composedSubjects:
                          roomData?.obtainedSubjects?.[role] || [],
                        role,
                        opponentRole,
                        roomId,
                        forceCooldown: false,
                        handleSkip: () =>
                          handleSkipTurn({
                            db,
                            roomId,
                            roomData,
                            currentCard,
                          }),
                        floatingDamages,
                      })
                    )
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#dc2626", // đỏ
                        color: "white",
                        padding: 12,
                        borderRadius: 6,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Đang chờ đối thủ...
                    </div>
                  )}
                </div>

                {/* MY CARDS */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    marginBottom: 20,
                    marginTop: 4,
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  {myCards.map((card) =>
                    renderCard({
                      card,
                      isMine: true,
                      selectedCardId,
                      selectedTargetId,
                      selectedAbility,
                      selectedCard,
                      selectedTargetCard,
                      availableAbilitiesMap,
                      chosenSubject,
                      roomData,
                      handleCardClick,
                      setSelectedCardId,
                      setSelectedAbility,
                      setSelectedTargetId,
                      setChosenSubject,
                      myCards: myAllCards,
                      opponentCards: opponentAllCards,
                      composedSubjects:
                        roomData?.obtainedSubjects?.[role] || [],
                      role,
                      opponentRole,
                      roomId,
                      forceCooldown:
                        roomData?.currentActorId !== card.ownedCardId,
                      handleSkip: () =>
                        handleSkipTurn({ db, roomId, roomData, currentCard }),
                      floatingDamages,
                    })
                  )}
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div
                style={{
                  flex: 1.5,
                  minWidth: 100,
                  maxWidth: 220,
                  paddingLeft: 4,
                  marginTop: 1,
                  height: "100%",
                  position: "relative", // 👈 chứa được absolute
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <SubjectComposer
                    db={db}
                    roomId={roomId}
                    role={role}
                    roomData={roomData}
                    user={user}
                    myCards={myCards}
                    availableAbilitiesMap={availableAbilitiesMap}
                    setAvailableAbilitiesMap={setAvailableAbilitiesMap} // ✅ thêm dòng này
                  />
                  <PlayerStatusBar
                    myName={myName}
                    opponentName={opponentName}
                    myFlagCount={myFlagCount}
                    opponentFlagCount={opponentFlagCount}
                    mySubjectCount={mySubjectCount}
                    opponentSubjectCount={opponentSubjectCount}
                    currentTurnNumber={currentTurnNumber}
                    countdown={countdown}
                    roomData={roomData}
                    onExit={onExit}
                  />
                  <RewardSubject
                    composedSubjects={roomData?.obtainedSubjects?.[role] || []}
                  />
                  <AbilityPanel
                    currentCard={currentCard}
                    selectedAbility={selectedAbility}
                    setSelectedAbility={setSelectedAbility}
                    setSelectedCardId={setSelectedCardId}
                    setSelectedTargetId={setSelectedTargetId}
                    roomData={roomData}
                    myCards={myCards}
                    availableAbilitiesMap={availableAbilitiesMap}
                  />
                  <PreloadAbilityIconsRenderer
                    availableAbilitiesMap={availableAbilitiesMap}
                  />
                  <ForcedActionPanel
                    currentCard={currentCard}
                    onSkip={() =>
                      handleSkipTurn({ db, roomId, roomData, currentCard })
                    }
                    myCards={myCards}
                    roomData={roomData}
                    availableAbilitiesMap={availableAbilitiesMap}
                  />{" "}
                  <MessageLog messages={battleLogs} />
                </div>

                <AbilitySelectionHandler
                  selectedCard={selectedCard}
                  selectedAbility={selectedAbility}
                  selectedTargetId={selectedTargetId}
                  myCards={myAllCards}
                  opponentCards={opponentAllCards}
                  roomData={roomData}
                  role={role}
                  opponentRole={opponentRole}
                  handleUseAbility={handleUseAbility}
                  setSelectedCardId={setSelectedCardId}
                  setSelectedTargetCardId={setSelectedTargetId}
                  setSelectedAbility={setSelectedAbility}
                  availableAbilitiesMap={availableAbilitiesMapRef.current}
                />
              </div>
            </div>

            {/* ===== BOTTOM ===== */}
            <div style={{ marginTop: 0 }}></div>
          </div>
        </div>
      </div>
    </>
  );
}
