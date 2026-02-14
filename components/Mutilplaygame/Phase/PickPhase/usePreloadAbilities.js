import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

export const usePreloadAbilities = (db, cards) => {
  const [abilityMap, setAbilityMap] = useState({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!db || !cards?.length || fetchedRef.current) return;

    const characterIds = [
      ...new Set(cards.map((card) => card.characterId).filter(Boolean)),
    ];

    const fetchAllAbilities = async () => {
      const newMap = {};
      for (const charId of characterIds) {
        const q = query(collection(db, "ability"), where("characterId", "==", charId));
        const snap = await getDocs(q);
        const abilities = [];
        snap.forEach((doc) => {
          const ab = doc.data();
          abilities.push(ab);

          // preload icon
          if (ab.meta?.imageUrl) {
            const img = new Image();
            img.src = ab.meta.imageUrl;
          }
        });
        newMap[charId] = abilities;
      }

      setAbilityMap(newMap);
      fetchedRef.current = true;
    };

    fetchAllAbilities();
  }, [db, cards]);

  return abilityMap;
};
