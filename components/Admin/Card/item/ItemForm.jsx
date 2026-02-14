// src/Admin/Item/ItemForm.jsx
import React, { useState, useEffect } from "react";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
} from "firebase/firestore";

const defaultItem = {
  name: "",
  slot: "weapon",
  statBonus: {},
  level: 1,
  imageUrl: "",
  status: [],
};

const ItemForm = ({ db, selectedItem, onSaveDone }) => {
  const [item, setItem] = useState(defaultItem);

  useEffect(() => {
    if (selectedItem) {
      setItem(selectedItem);
    } else {
      setItem(defaultItem);
    }
  }, [selectedItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatChange = (e, stat) => {
    const value = parseFloat(e.target.value);
    setItem((prev) => ({
      ...prev,
      statBonus: {
        ...prev.statBonus,
        [stat]: isNaN(value) ? 0 : value,
      },
    }));
  };

  const handleSave = async () => {
    if (!item.name || !item.slot) {
      return alert("Thiếu tên hoặc slot");
    }

    if (item.id) {
      // update
      const ref = doc(db, "items", item.id);
      const { id, ...rest } = item;
      await updateDoc(ref, rest);
    } else {
      // add mới
      await addDoc(collection(db, "items"), item);
    }

    onSaveDone?.();
  };

  const handleDelete = async () => {
    if (item.id) {
      await deleteDoc(doc(db, "items", item.id));
      onSaveDone?.();
    }
  };

  return (
    <div style={{ border: "1px solid gray", padding: 12, marginBottom: 16 }}>
      <h3>{item.id ? "✏️ Sửa Item" : "➕ Tạo Item mới"}</h3>

      <input
        name="name"
        placeholder="Tên Item"
        value={item.name}
        onChange={handleChange}
      />
      <input
        name="slot"
        placeholder="Slot (weapon/armor/accessory)"
        value={item.slot}
        onChange={handleChange}
      />
      <input
        name="imageUrl"
        placeholder="Link ảnh"
        value={item.imageUrl}
        onChange={handleChange}
      />
      <input
        name="level"
        type="number"
        placeholder="Level"
        value={item.level}
        onChange={handleChange}
      />

      <h4>🎯 Stat Bonus</h4>
      {[
        "Atk",
        "MaxStamina",
        "skillAmp",
        "defend",
        "critRate",
        "critDamage",
        "regen",
        "resistant",
        "actionGauge",
        "bonusHits",
      ].map((stat) => (
        <div key={stat}>
          {stat}:{" "}
          <input
            type="number"
            value={item.statBonus?.[stat] || ""}
            onChange={(e) => handleStatChange(e, stat)}
          />
        </div>
      ))}

      <div style={{ marginTop: 10 }}>
        <button onClick={handleSave}>💾 Lưu</button>
        {item.id && (
          <button
            onClick={handleDelete}
            style={{ marginLeft: 10, color: "red" }}
          >
            🗑 Xoá
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemForm;
