import { filterCardBeforeSaving } from "./filterCardBeforeSaving";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { saveEquippedItemsToSubdoc } from "./saveEquippedItemsToSubdoc"; // mới tạo
import { calculateMaxStamina } from "../../abilityType/battleCalculator";

export async function handleConfirmPick({
  db,
  roomId,
  user,
  selectedCards,
  onCardsPicked,
}) {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  const roomData = roomSnap.data();
  const role = roomData.host === user.uid ? "host" : "guest";
  const key = `${role}Cards`;

  // ✅ Ghi vào subdoc equippedItems
  await saveEquippedItemsToSubdoc({ db, roomId, selectedCards });

  // ✅ Ghi card (KHÔNG chứa equippedItems) vào rooms
const newCards = selectedCards.map((card) => {
  // Tính lại stamina đúng với items đã trang bị
  const updatedCard = {
    ...card,
    stamina: calculateMaxStamina(card),
    maxStamina: calculateMaxStamina(card),
  };
  return filterCardBeforeSaving(updatedCard);
});

  await updateDoc(roomRef, {
    [key]: newCards,
  });

  onCardsPicked();
}
