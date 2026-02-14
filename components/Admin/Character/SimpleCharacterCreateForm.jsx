// src/components/Admin/Character/SimpleCharacterCreateForm.jsx
import React, { useState } from 'react';
import { db, storage } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import "./CharacterFormModal.css";


const SimpleCharacterCreateForm = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !avatar) {
      alert("Vui lòng nhập tên và chọn ảnh đại diện!");
      return;
    }

    try {
      const extension = avatar.name.slice(avatar.name.lastIndexOf('.'));
      const uniqueName = `${uuidv4()}${extension}`;
      const avatarRef = ref(storage, `avatars/${uniqueName}`);
      await uploadBytes(avatarRef, avatar);
      const avatarUrl = await getDownloadURL(avatarRef);

      await addDoc(collection(db, 'characters'), {
        name,
        avatarUrl,
        order: Date.now(),
        createdAt: serverTimestamp(),
        approved: false,
        gender: '',
        friends: [],
        posterUrl: '',
        album: [],
        category: '',
        description: '',
      });

      alert("Tạo nhân vật thành công!");
      onCreated();
    } catch (error) {
      alert("Lỗi khi tạo nhân vật");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Tạo nhân vật mới</h3>
      <div>
        <label>Tên nhân vật:</label><br />
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Ảnh đại diện:</label><br />
        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button type="submit">Tạo</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 10 }}>Hủy</button>
      </div>
    </form>
  );
};

export default SimpleCharacterCreateForm;