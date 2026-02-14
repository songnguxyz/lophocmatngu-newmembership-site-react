import { useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { calculateMaxStamina } from "../../abilityType/battleCalculator";

export function useFetchOwnedCards({ db, user, setCards }) {
  useEffect(() => {
    if (!db || !user || !user.uid) return;

    const fetchCards = async () => {
      const q = query(
        collection(db, "ownedCards"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);

      const abilitySnap = await getDocs(collection(db, "ability"));
      const allAbilities = abilitySnap.docs.map((doc) => doc.data());

      const abilityMap = {};
      allAbilities.forEach((ab) => {
        if (!abilityMap[ab.characterId]) {
          abilityMap[ab.characterId] = [];
        }
        abilityMap[ab.characterId].push(ab);
      });

      const owned = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const ownedCardId = d.id;
          const characterId = data.characterId;

          const cardSnap = await getDoc(doc(db, "cards", data.cardTemplateId));
          if (!cardSnap.exists()) return null;
          const cardData = cardSnap.data();

          // ✅ Load equippedItems từng slot (tối đa 3-4 slot)
          const slots = [
            "weapon",
            "helmet",
            "armor",
            "boots",
            "gloves",
            "amulet"
          ];
          const equippedItems = {};

          for (const slot of slots) {
            const itemRef = doc(
              db,
              "ownedCards",
              ownedCardId,
              "equippedItems",
              slot
            );

            const itemSnap = await getDoc(itemRef);
            if (itemSnap.exists()) {
              equippedItems[slot] = itemSnap.data();
            }
          }
          const mergedCard = { ...cardData, ...data, equippedItems };
          const maxStamina = calculateMaxStamina(mergedCard);

          return {
            ...cardData,
            ...data,
            ownedCardId,
            stamina: calculateMaxStamina({ ...cardData, ...data }),
            maxStamina,
            equippedItems,
            // abilities: abilityMap[characterId] || [],
          };
        })
      );

      setCards(owned.filter(Boolean));
    };

    fetchCards();
  }, [db, user, setCards]);
}
