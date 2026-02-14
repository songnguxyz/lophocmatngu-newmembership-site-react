// src/components/Admin/CharacterCategoryManager.jsx
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
} from "firebase/firestore";
import "./CharacterManager.css";

const CharacterCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null); // Thêm state cho order
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "characterscategories"),
          orderBy("order", "asc")
        ); // Sắp xếp theo order
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
      await addDoc(collection(db, "characterscategories"), {
        name: newCategory,
        order: 0,
      }); // Thêm order
      setNewCategory("");
    } catch (error) {
      setError(error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditingOrder(category.order); // Lưu giá trị order hiện tại
  };

  const handleUpdateCategory = async (id, newName, newOrder) => {
    try {
      await updateDoc(doc(db, "characterscategories", id), {
        name: newName,
        order: newOrder,
      });
      setEditingCategory(null);
      setEditingOrder(null); // Reset editingOrder
    } catch (error) {
      setError(error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "characterscategories", id));
    } catch (error) {
      setError(error);
    }
  };

  if (loading) {
    return <div>Đang tải thể loại...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  return (
    <div>
      <h3>Quản lý Thể Loại Nhân Vật</h3>
      <div
        style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Thêm thể loại mới"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleAddCategory}>Thêm</button>
      </div>
      <div className="character-list">
        {" "}
        {/* Sử dụng lại CSS */}
        {categories.map((category) => (
          <div
            key={category.id}
            className="character-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px",
              borderBottom: "1px solid #eee",
            }}
          >
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
                  style={{ marginRight: "5px" }}
                />
                {/* Thêm input cho order */}
                <input
                  type="number"
                  value={editingOrder}
                  onChange={(e) => setEditingOrder(parseInt(e.target.value))}
                  style={{ marginRight: "5px" }}
                />
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() =>
                      handleUpdateCategory(
                        category.id,
                        editingCategory.name,
                        editingOrder
                      )
                    }
                  >
                    Lưu
                  </button>
                  <button onClick={() => setEditingCategory(null)}>Hủy</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: "1", textAlign: "left" }}>
                  {category.name} (Order: {category.order})
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
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

export default CharacterCategoryManager;
