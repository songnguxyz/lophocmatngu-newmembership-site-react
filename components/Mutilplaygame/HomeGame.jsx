import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "../../context/FirebaseContext";
import RoomList from "./RoomList";
import { PickPhase } from "./Phase/PickPhase/PickPhase";
import { GamePlayCardBattle } from "./Phase/BattlePhase/GamePlayCardBattle";

export default function HomeGame() {
  const { db, auth } = useFirebase();
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [phase, setPhase] = useState("rooms");

  // 🆕 Bắt sự kiện beforeinstallprompt để hiển thị nút "Cài ứng dụng"
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!roomId || !auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      const data = snap.data();
      setRoomData(data);

      const role = data.host === auth.currentUser.uid ? "host" : "guest";
      const cardsKey = `${role}Cards`;
      if (Array.isArray(data[cardsKey]) && data[cardsKey].length === 5) {
        setPhase("battle");
      } else {
        setPhase("pick");
      }
    });
    return () => unsub();
  }, [roomId, auth.currentUser]);

  const handleJoinRoom = (id) => {
    setRoomId(id);
  };

  const handleCardsPicked = () => {
    setPhase("battle");
  };

  const handleExit = () => {
    setRoomId(null);
    setRoomData(null);
    setPhase("rooms");
  };

  return (
    <div style={{ padding: 20 }}>
      {phase === "rooms" && <RoomList onJoinRoom={handleJoinRoom} />}
      {phase === "pick" && roomId && (
        <PickPhase roomId={roomId} onCardsPicked={handleCardsPicked} />
      )}
      {phase === "battle" && roomId && (
        <GamePlayCardBattle roomId={roomId} onExit={handleExit} />
      )}

      {/* ✅ Nút "Cài đặt ứng dụng" cho Chrome Android/Desktop */}
      {deferredPrompt && (
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            console.log("Kết quả:", choice.outcome);
            setDeferredPrompt(null);
          }}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          📲 Cài đặt ứng dụng
        </button>
      )}
    </div>
  );
}
