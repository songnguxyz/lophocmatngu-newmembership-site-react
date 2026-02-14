// src/Admin/Item/AssignItemToCard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase";

const AssignItemToCard = () => {
  const [items, setItems] = useState([]);
  const [ownedCardId, setOwnedCardId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [slot, setSlot] = useState("weapon");
  const [targetLocation, setTargetLocation] = useState("ownedCards");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetched);
    };
    fetchItems();
  }, []);

  const handleAssign = async () => {
    if (!ownedCardId || !selectedItemId) {
      alert("Hãy nhập ownedCardId và chọn item.");
      return;
    }

    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;

    let ref;
    let payload;

    if (targetLocation === "ownedCards") {
      // 👉 Gắn vào subcollection: ownedCards/[ownedCardId]/equippedItems/[slot]
      ref = doc(db, `ownedCards/${ownedCardId}/equippedItems/${slot}`);
      payload = {
        slot: item.slot,
        imageUrl: item.imageUrl || "",
        statBonus: item.statBonus || {},
        level: item.level || 0,
        status: item.status || [],
        name: item.name || "",
      };
    } else {
      // 👉 Gắn vào rooms/[roomId]/equippedItems/[ownedCardId]
      if (!roomId) return alert("Thiếu roomId");
      ref = doc(db, `rooms/${roomId}/equippedItems/${ownedCardId}`);
      payload = {
        equippedItems: {
          [slot]: {
            slot: item.slot,
            imageUrl: item.imageUrl || "",
            statBonus: item.statBonus || {},
            level: item.level || 0,
            status: item.status || [],
            name: item.name || "",
          },
        },
      };
    }

    await setDoc(ref, payload, { merge: true });

    alert(
      `✅ Gắn thành công "${item.name}" vào ${targetLocation} → ${ownedCardId} (slot: ${slot})`
    );
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div style={{ marginTop: "2rem", padding: 16, border: "1px solid gray" }}>
      <h3>🔗 Gắn Item vào Card</h3>

      <div>
        <label>🎯 Gắn vào: </label>
        <select
          value={targetLocation}
          onChange={(e) => setTargetLocation(e.target.value)}
        >
          <option value="ownedCards">
            ✅ Gắn vào ownedCards (dùng cho PickPhase)
          </option>
          <option value="rooms">🧪 Gắn vào rooms (test trong trận)</option>
        </select>
      </div>

      {targetLocation === "rooms" && (
        <div style={{ marginTop: 8 }}>
          <label>🏠 roomId: </label>
          <input
            type="text"
            placeholder="Nhập roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ width: "200px", marginLeft: "10px" }}
          />
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <label>🆔 ownedCardId: </label>
        <input
          type="text"
          placeholder="Nhập ownedCardId"
          value={ownedCardId}
          onChange={(e) => setOwnedCardId(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>🧩 Chọn Item: </label>
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="">-- Chọn item --</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.slot})
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>🎯 Slot: </label>
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          <option value="weapon">🔪 Weapon</option>
          <option value="armor">🛡️ Armor</option>
          <option value="accessory">💍 Accessory</option>
        </select>
      </div>

      {selectedItem && (
        <div style={{ marginTop: 12, padding: 12, background: "#f8f8f8" }}>
          <h4>📦 Chi tiết item:</h4>
          <p>
            <strong>Tên:</strong> {selectedItem.name}
          </p>
          <p>
            <strong>Slot:</strong> {selectedItem.slot}
          </p>
          <p>
            <strong>Level:</strong> {selectedItem.level}
          </p>
          <p>
            <strong>Stat Bonus:</strong>
          </p>
          <ul>
            {Object.entries(selectedItem.statBonus || {}).map(([stat, val]) => (
              <li key={stat}>
                {stat}: {val}
              </li>
            ))}
          </ul>
          {selectedItem.imageUrl && (
            <img
              src={selectedItem.imageUrl}
              alt="item"
              style={{ maxWidth: 80, marginTop: 8 }}
            />
          )}
        </div>
      )}

      <button onClick={handleAssign} style={{ marginTop: "12px" }}>
        ✅ Gắn vào card
      </button>
    </div>
  );
};

export default AssignItemToCard;
