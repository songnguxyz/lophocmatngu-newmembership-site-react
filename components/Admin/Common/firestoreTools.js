//Common/firestoreTools.js
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase"; // hoặc "../firebase" tùy vị trí file

export const initializeFieldForCollection = async (collectionName, fieldName, generateValueFn) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const docs = querySnapshot.docs;

  for (let i = 0; i < docs.length; i++) {
    const docSnap = docs[i];
    const value = generateValueFn(i, docSnap.data());

    await updateDoc(doc(db, collectionName, docSnap.id), {
      [fieldName]: value,
    });
  }

  console.log(`✅ Đã cập nhật ${fieldName} cho collection ${collectionName}`);
};

//import { initializeFieldForCollection } from "../scripts/firestoreTools";

//initializeFieldForCollection("truyens", "order", (i, data) => i);
// hoặc
//initializeFieldForCollection("users", "score", (i, data) => 0);