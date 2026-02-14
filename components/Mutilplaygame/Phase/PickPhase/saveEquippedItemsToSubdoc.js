import { doc, setDoc } from "firebase/firestore";

// ✅ Hàm export ra ngoài để dùng
export async function saveEquippedItemsToSubdoc({ db, roomId, selectedCards }) {
  const batch = selectedCards.map((card) => {
    const ref = doc(db, `rooms/${roomId}/equippedItems/${card.ownedCardId}`);
    const equippedItems = card.equippedItems || {};

    return setDoc(ref, {
      characterName: card.characterName || "Unknown", // ✅ Thêm tên nhân vật cho dễ tra cứu
      equippedItems: Object.fromEntries(
        Object.entries(equippedItems).map(([slot, item]) => [
          slot,
          {
            slot: item.slot,
            imageUrl: item.imageUrl,
            statBonus: item.statBonus,
            level: item.level,
            status: item.status,
          },
        ])
      ),
    });
  });

  await Promise.all(batch);
}
