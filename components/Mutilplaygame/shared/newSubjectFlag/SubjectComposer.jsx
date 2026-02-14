import React, { useState } from "react";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { SUBJECT_RECIPES } from "./Recipes";
import { SubjectModal } from "./Modal";
import { addSubjectPassiveToAbilitiesMap } from "./addSubjectPassive";

export function SubjectComposer({
  db,
  roomId,
  role,
  roomData,
  user,
  myCards,
  availableAbilitiesMap,
  setAvailableAbilitiesMap,
}) {
  const flags = [...(roomData.flags?.[role] || [])];
  const obtained = roomData.obtainedSubjects?.[role] || [];
  const [showModal, setShowModal] = useState(false);

  const subjectQueue = roomData.subjectQueue?.[role] || [];
  const unlearnedSubjects = subjectQueue.filter((s) => !obtained.includes(s));
  const nextSubjects = unlearnedSubjects.slice(0, 3);

  const isMyTurn =
    roomData?.currentActorId &&
    (roomData[role + "Cards"] || [])
      .map((c) => c.ownedCardId)
      .includes(roomData.currentActorId);

  const handleCompose = async (subjectName, requiredFlags) => {
    const hasAll = requiredFlags.every((f) => flags.includes(f));
    if (!hasAll || !isMyTurn) return;

    const updatedCards = (roomData[role + "Cards"] || []).map((card) => {
      let used = 0;
      const updated = {
        ...card,
        characterId: card.characterId ?? "", // 👈 Bắt buộc giữ lại characterId
        ownedCardId: card.ownedCardId ?? "", // 👈 Đảm bảo không mất
        flags: (card.flags || []).filter((f) => {
          if (used < requiredFlags.length && requiredFlags.includes(f)) {
            used++;
            requiredFlags.splice(requiredFlags.indexOf(f), 1);
            return false;
          }
          return true;
        }),
      };
      return updated;
    });
    

    const updatedFlagList = updatedCards.flatMap((c) => c.flags || []);
    const newObtained = [...obtained, subjectName];

    const composedSubjectsByPlayerId = {};
    for (const card of updatedCards) {
      composedSubjectsByPlayerId[card.ownedCardId] = newObtained;
    }

    await updateDoc(doc(db, "rooms", roomId), {
      [`flags.${role}`]: updatedFlagList,
      [`obtainedSubjects.${role}`]: newObtained,
      [`${role}Cards`]: updatedCards,
      composedSubjectsByPlayerId,
    });

    await addDoc(collection(db, "rooms", roomId, "battleLogs"), {
      turnNumber: roomData.turnNumber ?? 0,
      actorId: null,
      actorName: roomData[role + "Name"] || "Người chơi",
      abilityId: null,
      abilityName: null,
      staminaCost: 0,
      targetIds: [],
      resultText: `📘 ${
        roomData[role + "Name"] || "Người chơi"
      } đã ghép thành công môn ${subjectName}!`,
      createdAt: serverTimestamp(),
    });

    // ✅ GẮN PASSIVE VÀO ABILITIES MAP
    addSubjectPassiveToAbilitiesMap({
      subjectName,
      myCards: updatedCards,
      availableAbilitiesMap,
      setAvailableAbilitiesMap,
    });

    setShowModal(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        {nextSubjects.map((subjectName) => {
          const subject = SUBJECT_RECIPES.find((s) => s.name === subjectName);
          const flagCopy = [...flags];

          const matchedFlagsCount = subject.requiredFlags.reduce((count, f) => {
            const index = flagCopy.indexOf(f);
            if (index !== -1) {
              flagCopy.splice(index, 1);
              return count + 1;
            }
            return count;
          }, 0);

          return (
            <div
              key={subjectName}
              onClick={() => setShowModal(true)}
              style={{
                position: "relative",
                width: 38,
                height: 38,
                background: "#f3f4f6",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "1px solid #ccc",
                fontSize: 20,
              }}
            >
              <img
                src={subject.icon}
                alt={subject.name}
                style={{
                  width: 36,
                  height: 36,
                  objectFit: "contain",
                  borderRadius: 6,
                }}
              />

              {matchedFlagsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 5,
                    transform: "translate(50%, -50%)",
                    fontSize: 11,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  {matchedFlagsCount === 3 ? "!" : matchedFlagsCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <SubjectModal
          nextSubjects={nextSubjects}
          flags={flags}
          onClose={() => setShowModal(false)}
          onCompose={handleCompose}
          isMyTurn={isMyTurn}
          db={db}
          roomId={roomId}
          roomData={roomData}
          role={role}
          user={user}
        />
      )}
    </div>
  );
}
