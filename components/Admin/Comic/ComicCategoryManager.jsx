// src/components/Admin/CategoryManager.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  getDoc,
  getDocs,
  where,
  limit,
} from "firebase/firestore";
import { initializeFieldForCollection } from "../Common/firestoreTools";
import "./ComicManager.css";

const initializeCategoryOrder = async () => {
  await initializeFieldForCollection("categories", "order", (i, data) => i);
};

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "categories"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim() === "") return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategory });
      setNewCategory("");
    } catch (error) {
      setError(error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = async (id, newName) => {
    try {
      await updateDoc(doc(db, "categories", id), { name: newName });
      setEditingCategory(null);
    } catch (error) {
      setError(error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thể loại này?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      setError(error);
    }
  };

  const handleMoveUpCategory = async (id) => {
    try {
      const currentDocRef = doc(db, "categories", id);
      const currentSnap = await getDoc(currentDocRef);
      const currentOrder = currentSnap.data()?.order ?? 0;

      const q = query(
        collection(db, "categories"),
        where("order", "<", currentOrder),
        orderBy("order", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const prevDoc = querySnapshot.docs[0];
        const prevOrder = prevDoc.data()?.order ?? 0;

        await Promise.all([
          updateDoc(currentDocRef, { order: prevOrder }),
          updateDoc(doc(db, "categories", prevDoc.id), { order: currentOrder }),
        ]);
        console.log("✅ Đã di chuyển thể loại lên!");
      } else {
        alert("🚫 Thể loại đang ở đầu danh sách!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi di chuyển thể loại lên!");
    }
  };

  const handleMoveDownCategory = async (id) => {
    try {
      const currentDocRef = doc(db, "categories", id);
      const currentSnap = await getDoc(currentDocRef);
      const currentOrder = currentSnap.data()?.order ?? 0;

      const q = query(
        collection(db, "categories"),
        where("order", ">", currentOrder),
        orderBy("order", "asc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const nextDoc = querySnapshot.docs[0];
        const nextOrder = nextDoc.data()?.order ?? 0;

        await Promise.all([
          updateDoc(currentDocRef, { order: nextOrder }),
          updateDoc(doc(db, "categories", nextDoc.id), { order: currentOrder }),
        ]);
        console.log("✅ Đã di chuyển thể loại xuống!");
      } else {
        alert("🚫 Thể loại đang ở cuối danh sách!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi di chuyển thể loại xuống!");
    }
  };

  if (loading) return <div>Đang tải thể loại...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <button
          onClick={initializeCategoryOrder}
          style={{
            padding: "10px",
            backgroundColor: "orange",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🚀 ReOrder thể loại
        </button>
      </div>

      <div
        style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Thêm thể loại mới"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ marginRight: "10px", flex: 1 }}
        />
        <button onClick={handleAddCategory}>Thêm</button>
      </div>

      <div>
        {categories.map((category, index) => (
          <div
            key={category.id}
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            {/* Nếu đang sửa */}
            {editingCategory && editingCategory.id === category.id ? (
              <>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  style={{ flex: 1, marginRight: "10px" }}
                />
                <button
                  onClick={() =>
                    handleUpdateCategory(category.id, editingCategory.name)
                  }
                >
                  Lưu
                </button>
                <button onClick={() => setEditingCategory(null)}>Hủy</button>
              </>
            ) : (
              <>
                {/* Tên thể loại */}
                <div
                  style={{
                    flexBasis: "250px",
                    flexShrink: 0,
                    flexGrow: 0,
                    textAlign: "left",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.name}
                </div>

                {/* Các nút thao tác */}
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    flex: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleMoveUpCategory(category.id)}
                    disabled={index === 0}
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => handleMoveDownCategory(category.id)}
                    disabled={index === categories.length - 1}
                  >
                    ⬇️
                  </button>
                  <button onClick={() => handleEditCategory(category)}>
                    Sửa
                  </button>
                  <button onClick={() => handleDeleteCategory(category.id)}>
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
