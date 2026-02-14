import { useEffect, useRef } from "react";
import {
  doc,
  onSnapshot,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { addSubjectPassiveToAbilitiesMap } from "../../shared/newSubjectFlag/addSubjectPassive";

export function useFetchRoomData({
  db,
  roomId,
  user,
  setRoomData,
  setMyCards,
  setOpponentCards,
  setAvailableAbilitiesMap,
}) {
  const abilityCacheRef = useRef({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomId), async (snap) => {
      const data = snap.data();
      setRoomData({ ...data, id: roomId });

      const roleKey = data.host === user?.uid ? "hostCards" : "guestCards";
      const opponentKey = data.host !== user?.uid ? "hostCards" : "guestCards";

      const allCards = [...(data.hostCards || []), ...(data.guestCards || [])];
      const abilitiesList = [];
      const rarities = ["gray", "green", "purple", "gold", "red"];

      const uniqueCharIds = Array.from(
        new Set(allCards.map((c) => c.characterId).filter(Boolean))
      );

      for (const charId of uniqueCharIds) {
        const cardsOfChar = allCards.filter((c) => c.characterId === charId);
        const maxRarityIndex = Math.max(
          ...cardsOfChar.map((c) => rarities.indexOf(c.rarity || "gray"))
        );
        const raritiesToQuery =
          maxRarityIndex >= 0
            ? rarities.slice(0, maxRarityIndex + 1)
            : ["gray"];

        if (!abilityCacheRef.current[charId]) {
          const q = query(
            collection(db, "ability"),
            where("characterId", "==", charId),
            where("unlockRarity", "in", raritiesToQuery)
          );

          const querySnapshot = await getDocs(q);
          const abilities = [];
          querySnapshot.forEach((doc) => abilities.push(doc.data()));
          abilityCacheRef.current[charId] = abilities;

          const seenIcons = new Set();
          abilities.forEach((ability) => {
            const url = ability?.meta?.imageUrl;
            if (url && !seenIcons.has(url)) {
              const img = new Image();
              img.src = url;
              seenIcons.add(url);
            }
          });
        }

        abilitiesList.push(...abilityCacheRef.current[charId]);
      }

      const grouped = {};
      const seen = new Set();
      for (const card of allCards) {
        const charKey = card.characterId?.trim?.();
        if (!charKey) continue;

        const relevant = abilitiesList.filter((a) => a.characterId === charKey);
        if (!grouped[charKey]) grouped[charKey] = [];

        for (const a of relevant) {
          const uniqueKey = `${a.characterId}-${a.name}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            grouped[charKey].push(a);
          }
        }

        const ownedKey = card.ownedCardId?.trim?.();
        if (ownedKey && !grouped[ownedKey]) {
          grouped[ownedKey] = [...grouped[charKey]];
        }
      }

      const composedMap = data.composedSubjectsByPlayerId || {};

      // ✅ Load equippedItems từ subcollection
      const equippedItemsSnap = await getDocs(
        collection(db, `rooms/${roomId}/equippedItems`)
      );
      const equippedItemsMap = {};
      equippedItemsSnap.forEach((doc) => {      
       equippedItemsMap[doc.id] = doc.data().equippedItems || {};
      });


      let finalMyCards = [];
      if (Array.isArray(data[roleKey])) {
        finalMyCards = data[roleKey].map((card) => ({
          ...card,
          equippedItems: equippedItemsMap[card.ownedCardId] || {}, // ✅ gắn vào đây
          lastUsedTurn: card.lastUsedTurn ?? -99,
          composedSubjects: composedMap[card.ownedCardId] || [],
        }));
        setMyCards(finalMyCards);      
      }

      if (Array.isArray(data[opponentKey])) {
        setOpponentCards(
          data[opponentKey].map((card) => ({
            ...card,
            equippedItems: equippedItemsMap[card.ownedCardId] || {}, // ✅ gắn cho cả đối thủ
            lastUsedTurn: card.lastUsedTurn ?? -99,
            composedSubjects: composedMap[card.ownedCardId] || [],
          }))
        );
      }

      const obtainedSubjects =
        data.obtainedSubjects?.[data.host === user?.uid ? "host" : "guest"] ||
        [];

      setAvailableAbilitiesMap(grouped);

      obtainedSubjects.forEach((subjectName) => {
        addSubjectPassiveToAbilitiesMap({
          subjectName,
          myCards: finalMyCards,
          availableAbilitiesMap: grouped,
          setAvailableAbilitiesMap: () => {},
          playerRole: data.host === user?.uid ? "host" : "guest",
        });
      });
    });

    return () => unsub();
  }, [roomId, user?.uid]);
}
