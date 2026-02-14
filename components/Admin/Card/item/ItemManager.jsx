// src/Admin/Items/ItemManager.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import ItemForm from "./ItemForm";
import AssignItemToCard from "./AssignItemToCard";

const ItemManager = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchItems = async () => {
    const itemsRef = collection(db, "items");
    const snapshot = await getDocs(itemsRef);
    const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(fetched);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá item này?")) {
      await deleteDoc(doc(db, "items", id));
      await fetchItems();
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  const handleSaveDone = async () => {
    setSelectedItem(null);
    await fetchItems();
  };

  return (
    <div>
      <h2>🧩 Quản lý Items</h2>

      {/* Form Tạo / Sửa */}
      <ItemForm
        db={db}
        selectedItem={selectedItem}
        onSaveDone={handleSaveDone}
      />

      {/* Danh sách Items */}
      <h3>📜 Danh sách Items đã tạo</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name || "(Không tên)"}</strong> | Slot: {item.slot} |
            +
            {Object.entries(item.statBonus || {})
              .map(([stat, val]) => `${stat}: ${val}`)
              .join(", ")}{" "}
            | Cấp: +{item.level}
            <button onClick={() => handleEdit(item)} style={{ marginLeft: 10 }}>
              ✏️ Sửa
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              style={{ marginLeft: 10 }}
            >
              ❌ Xoá
            </button>
          </li>
        ))}
      </ul>
      <AssignItemToCard roomId={"ROOM_ID_CỦA_BẠN"} />
    </div>
  );
};

export default ItemManager;
