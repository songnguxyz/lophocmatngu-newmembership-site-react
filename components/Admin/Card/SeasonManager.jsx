// src/Admin/Card/SeasonManager.jsx

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";

const SeasonManager = () => {
  const [seasons, setSeasons] = useState([]);
  const [newSeason, setNewSeason] = useState("");

  const loadSeasons = async () => {
    const snap = await getDocs(collection(db, "seasons"));
    setSeasons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const addSeason = async () => {
    if (!newSeason.trim()) return;
    await addDoc(collection(db, "seasons"), {
      name: newSeason.trim(),
      createdAt: serverTimestamp(),
    });
    setNewSeason("");
    loadSeasons();
  };

  const removeSeason = async (id) => {
    await deleteDoc(doc(db, "seasons", id));
    loadSeasons();
  };

  return (
    <div>
      <h3>📅 Quản lý Mùa Gacha</h3>
      <input
        placeholder="Tên mùa mới"
        value={newSeason}
        onChange={(e) => setNewSeason(e.target.value)}
      />
      <button onClick={addSeason}>➕ Thêm mùa</button>
      <ul>
        {seasons.map((s) => (
          <li key={s.id}>
            {s.name} <button onClick={() => removeSeason(s.id)}>❌ Xoá</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeasonManager;
