import React, { useEffect, useState } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import { firebaseReady } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";

function generateShortRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function RoomList({ onJoinRoom }) {
  const { auth, db } = useFirebase();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    firebaseReady.then(() => {
      const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = data.filter(
          (room) =>
            room.status === "waiting" ||
            (room.status === "playing" && !room.winner)
        );

        setRooms(filtered);
      });

      return () => unsubscribe();
    });
  }, [db]);

  const createRoom = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Bạn cần đăng nhập.");

    const roomId = generateShortRoomId();
    const ref = doc(db, "rooms", roomId);
    await setDoc(ref, {
      host: user.uid,
      hostName: user.displayName || user.uid,
      guest: null,
      guestName: null,
      turn: "host",
      status: "waiting",
      createdAt: serverTimestamp(),
    });
    onJoinRoom(roomId);
  };

  const handleJoinRoom = async (roomId) => {
    const user = auth.currentUser;
    if (!user) return alert("Bạn cần đăng nhập.");

    const ref = doc(db, "rooms", roomId);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!data) return alert("Phòng không tồn tại.");

    const uid = user.uid;

    if (data.host === uid || data.guest === uid) {
      // ✅ Đã là host hoặc guest → không update, chỉ join
      onJoinRoom(roomId);
      return;
    }

    if (!data.guest) {
      // ✅ Nếu slot guest còn trống → gán làm guest
      await updateDoc(ref, {
        guest: uid,
        guestName: user.displayName || uid,
        status: "playing",
      });
      onJoinRoom(roomId);
      return;
    }

    // ❌ Người lạ → không được join, chỉ được xem
    alert("Phòng đã đủ người. Bạn chỉ có thể xem.");
  };

  const handleFindMatch = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Bạn cần đăng nhập.");

    const querySnapshot = await getDocs(collection(db, "rooms"));
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const uid = user.uid;

      if (data.host === uid || data.guest === uid) {
        // ✅ Đã từng vào phòng này
        onJoinRoom(docSnap.id);
        return;
      }

      if (data.status === "waiting" && !data.guest) {
        await updateDoc(doc(db, "rooms", docSnap.id), {
          guest: uid,
          guestName: user.displayName || uid,
          status: "playing",
        });
        onJoinRoom(docSnap.id);
        return;
      }
    }

    alert("Không tìm thấy phòng phù hợp, hãy tạo phòng mới.");
  };

  return (
    <div>
      <h2>Danh sách phòng</h2>
      <button onClick={createRoom}>Tạo phòng</button>
      <button onClick={handleFindMatch}>Tìm trận</button>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            {room.hostName} vs {room.guestName || "⏳ Đang chờ"} -
            <button onClick={() => handleJoinRoom(room.id)}>Tham gia</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
