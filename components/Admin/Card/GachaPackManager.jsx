//src/components/Admin/GachaPackManager.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";
import ImageUploader from "../Common/ImageUploader";
import { useQuill } from "../Common/useQuill";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";

const defaultRates = {
  gray: 0.6,
  green: 0.3,
  purple: 0.1,
};

const GachaPackManager = () => {
  const [packs, setPacks] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [newPack, setNewPack] = useState({
    name: "",
    description: "",
    seasonId: "",
    price: 0,
    count: 1,
    guaranteedPurple: false,
    rates: defaultRates,
    imageUrl: "",
    order: 1,
  });
  const [editingPackId, setEditingPackId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const descriptionQuill = useQuill({
    initialValue: newPack.description,
    placeholder: "Nhập thông tin mô tả gói...",
  });

  useEffect(() => {
    const loadPacks = async () => {
      const snap = await getDocs(collection(db, "gachaPacks"));
      setPacks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    loadPacks();
  }, []);

  useEffect(() => {
    const loadSeasons = async () => {
      const snap = await getDocs(collection(db, "seasons"));
      setSeasons(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    loadSeasons();
  }, []);

  const getNextOrder = async () => {
    const q = query(
      collection(db, "gachaPacks"),
      orderBy("order", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? 1 : (snap.docs[0].data().order || 0) + 1;
  };

  const handleAddOrUpdatePack = async () => {
    const description = descriptionQuill.getContent();
    const {
      name,
      price,
      count,
      rates,
      guaranteedPurple,
      seasonId,
      imageUrl,
      order,
    } = newPack;
    if (!name || !price || !count || !seasonId) return;

    const data = {
      name,
      description,
      price: Number(price),
      count: Number(count),
      rates: {
        gray: Number(rates.gray),
        green: Number(rates.green),
        purple: Number(rates.purple),
      },
      guaranteedPurple,
      seasonId,
      imageUrl,
      order: Number(order),
    };

    if (editingPackId) {
      await updateDoc(doc(db, "gachaPacks", editingPackId), data);
      setEditingPackId(null);
      setSuccessMessage("✅ Đã cập nhật gói thành công!");
    } else {
      const nextOrder = await getNextOrder();
      await addDoc(collection(db, "gachaPacks"), {
        ...data,
        order: nextOrder,
      });
      setSuccessMessage("🎉 Đã tạo gói Gacha mới thành công!");
    }

    setNewPack({
      name: "",
      description: "",
      price: 0,
      count: 1,
      guaranteedPurple: false,
      seasonId: "",
      rates: defaultRates,
      imageUrl: "",
      order: 1,
    });

    const snap = await getDocs(collection(db, "gachaPacks"));
    setPacks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDelete = async (packId) => {
    await deleteDoc(doc(db, "gachaPacks", packId));
    const snap = await getDocs(collection(db, "gachaPacks"));
    setPacks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleEdit = (pack) => {
    setNewPack({
      name: pack.name,
      description: pack.description || "",
      price: pack.price,
      count: pack.count,
      guaranteedPurple: pack.guaranteedPurple,
      seasonId: pack.seasonId,
      rates: pack.rates,
      imageUrl: pack.imageUrl || "",
      order: pack.order || 1,
    });
    setEditingPackId(pack.id);
  };

  return (
    <div>
      <h3>🎁 Quản lý Gói Gacha</h3>
      {successMessage && (
        <div
          style={{
            background: "#d4edda",
            color: "#155724",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
            border: "1px solid #c3e6cb",
          }}
        >
          {successMessage}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          border: "1px solid #ccc",
          padding: 16,
        }}
      >
        <h4>{editingPackId ? "✏️ Sửa Gói Gacha" : "➕ Tạo Gói Gacha Mới"}</h4>

        <label>1. Chọn mùa:</label>
        <select
          value={newPack.seasonId}
          onChange={(e) => setNewPack({ ...newPack, seasonId: e.target.value })}
        >
          <option value="">-- chọn mùa --</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name || s.id}
            </option>
          ))}
        </select>

        <label>2. Ảnh gói:</label>
        <ImageUploader
          label="Ảnh gói Gacha"
          folder="gacha-packs"
          defaultImage={newPack.imageUrl}
          onUploadSuccess={async (url) => {
            if (newPack.imageUrl && newPack.imageUrl !== url) {
              await deleteImageFromUrl(newPack.imageUrl);
            }
            setNewPack({ ...newPack, imageUrl: url });
          }}
        />
        {newPack.imageUrl && (
          <div style={{ marginTop: 8 }}>
            <strong>Ảnh hiện tại:</strong>
            <div>
              <img
                src={newPack.imageUrl}
                alt="Gacha pack"
                style={{ maxWidth: 200, marginTop: 4, borderRadius: 8 }}
              />
            </div>
          </div>
        )}

        <label>3. Tên gói:</label>
        <input
          value={newPack.name}
          onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
        />

        <label>4. Thông tin gói:</label>
        <div
          ref={descriptionQuill.editorRef}
          style={{ minHeight: 100, border: "1px solid #ccc", borderRadius: 4 }}
        />

        <label>5. Giá gói (xu):</label>
        <input
          type="number"
          value={newPack.price}
          onChange={(e) =>
            setNewPack({ ...newPack, price: parseInt(e.target.value) })
          }
        />

        <label>6. Số lượt quay:</label>
        <input
          type="number"
          value={newPack.count}
          onChange={(e) =>
            setNewPack({ ...newPack, count: parseInt(e.target.value) })
          }
        />

        <label>7. Tỉ lệ độ hiếm:</label>
        {["gray", "green", "purple"].map((rarity) => (
          <div key={rarity}>
            {rarity}:{" "}
            <input
              type="number"
              step="0.01"
              value={newPack.rates[rarity]}
              onChange={(e) =>
                setNewPack({
                  ...newPack,
                  rates: {
                    ...newPack.rates,
                    [rarity]: parseFloat(e.target.value),
                  },
                })
              }
            />
          </div>
        ))}

        <label>8. Đảm bảo có thẻ tím:</label>
        <input
          type="checkbox"
          checked={newPack.guaranteedPurple}
          onChange={(e) =>
            setNewPack({ ...newPack, guaranteedPurple: e.target.checked })
          }
        />

        <label>9. Sắp xếp (order):</label>
        <input
          type="number"
          value={newPack.order}
          onChange={(e) =>
            setNewPack({ ...newPack, order: parseInt(e.target.value) })
          }
        />

        <button onClick={handleAddOrUpdatePack}>
          {editingPackId ? "💾 Lưu thay đổi" : "💾 Tạo Gói"}
        </button>
      </div>

      <div>
        <h4>📦 Gói Gacha đã tạo:</h4>
        <ul>
          {packs.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> - {p.count} lượt - {p.price} xu
              <br />
              🎯 Tỉ lệ:{" "}
              {["gray", "green", "purple"]
                .map((rarity) => `${rarity}: ${p.rates[rarity] ?? 0}`)
                .join(", ")}
              <br />
              {p.guaranteedPurple && <em>✅ Có đảm bảo thẻ tím</em>}
              <br />
              <button onClick={() => handleEdit(p)}>✏️ Sửa</button>{" "}
              <button onClick={() => handleDelete(p.id)}>❌ Xoá</button>
              <hr style={{ margin: "12px 0" }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GachaPackManager;
