import { doc, updateDoc } from "firebase/firestore";
import { SUBJECT_RECIPES } from "./Recipes";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function initSubjectQueue({ db, roomId, roomData }) {
  // Nếu đã có subjectQueue rồi thì bỏ qua
  if (roomData?.subjectQueue?.host && roomData?.subjectQueue?.guest) return;

  const allSubjects = SUBJECT_RECIPES.map((s) => s.name);
  const hostQueue = shuffle(allSubjects);
  const guestQueue = shuffle(allSubjects);

  await updateDoc(doc(db, "rooms", roomId), {
    subjectQueue: {
      host: hostQueue,
      guest: guestQueue,
    },
  });
}
