// src/components/Admin/Items/ItemManager.jsx
import React, { useState, useEffect, useCallback } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  limit,
  getDocs,
  getDoc,
} from "firebase/firestore";
import ItemList from "./ItemList";
import ArticlesForm from "./ArticlesForm";
import BoardgameForm from "./BoardgameForm";
import ProductForm from "./ProductForm";
import "./ItemManager.css";

const ItemManager = ({ type }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Map type prop to collectionName
  const collectionName =
    type === "articles" || type === "article"
      ? "home"
      : type === "boardgames" || type === "boardgame"
      ? "boardgame"
      : "sanpham";

  const loadItems = useCallback(
    async (status = "all") => {
      setLoading(true);
      setError(null);
      let q = query(collection(db, collectionName), orderBy("order", "asc"));
      if (status === "approved") {
        q = query(
          collection(db, collectionName),
          where("approved", "==", true),
          orderBy("order", "asc")
        );
      } else if (status === "pending") {
        q = query(
          collection(db, collectionName),
          where("approved", "==", false),
          orderBy("order", "asc")
        );
      }
      try {
        const unsubscribe = onSnapshot(q, (snap) => {
          setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        setError(e);
        setLoading(false);
        window.alert("Lỗi khi tải dữ liệu: " + e.message);
      }
    },
    [collectionName]
  );

  useEffect(() => {
    loadItems();
    setShowAddForm(false);
    setSelectedItemId(null);
  }, [loadItems]);

  const handleApprove = async (id, approved) => {
    try {
      await updateDoc(doc(db, collectionName, id), { approved: !approved });
      window.alert(approved ? "Hủy duyệt thành công" : "Duyệt thành công");
      loadItems();
    } catch (e) {
      window.alert("Lỗi duyệt/hủy duyệt: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      window.alert("Xóa thành công");
      loadItems();
    } catch (e) {
      window.alert("Lỗi xóa: " + e.message);
    }
  };

  const swapOrder = async (id, dir) => {
    try {
      const ref = doc(db, collectionName, id);
      const snapDoc = await getDoc(ref);
      if (!snapDoc.exists()) return;
      const curr = snapDoc.data().order;
      const op = dir === "up" ? "<" : ">";
      const ord = dir === "up" ? "desc" : "asc";
      const q = query(
        collection(db, collectionName),
        where("order", op, curr),
        orderBy("order", ord),
        limit(1)
      );
      const sw = (await getDocs(q)).docs[0];
      if (!sw) return;
      const otherOrder = sw.data().order;
      await updateDoc(ref, { order: otherOrder });
      await updateDoc(doc(db, collectionName, sw.id), { order: curr });
      window.alert(
        dir === "up" ? "Di chuyển lên thành công" : "Di chuyển xuống thành công"
      );
      loadItems();
    } catch (e) {
      window.alert("Lỗi di chuyển: " + e.message);
    }
  };

  const handleMoveUp = (id) => swapOrder(id, "up");
  const handleMoveDown = (id) => swapOrder(id, "down");

  const handleUpdateOrder = async (id, newOrder) => {
    try {
      const ord = parseInt(newOrder, 10);
      if (isNaN(ord)) throw new Error("Thứ tự không hợp lệ");
      await updateDoc(doc(db, collectionName, id), { order: ord });
      window.alert("Cập nhật thứ tự thành công");
      loadItems();
    } catch (e) {
      window.alert("Lỗi cập nhật thứ tự: " + e.message);
    }
  };

  const handleEdit = (id) => setSelectedItemId(id);
  const handleCancelEdit = () => setSelectedItemId(null);
  const handleItemUpdated = () => {
    setSelectedItemId(null);
    window.alert("Cập nhật thành công");
    loadItems();
  };

  const handleCreate = () => setShowAddForm(true);
  const handleCancelCreate = () => setShowAddForm(false);
  const handleItemCreated = () => {
    setShowAddForm(false);
    window.alert("Thêm mới thành công");
    loadItems();
  };

  const renderForm = () => {
    if (collectionName === "home") {
      return selectedItemId ? (
        <ArticlesForm
          itemId={selectedItemId}
          onItemUpdated={handleItemUpdated}
          onCancel={handleCancelEdit}
        />
      ) : showAddForm ? (
        <ArticlesForm
          onItemCreated={handleItemCreated}
          onCancel={handleCancelCreate}
        />
      ) : null;
    }
    if (collectionName === "boardgame") {
      return selectedItemId ? (
        <BoardgameForm
          itemId={selectedItemId}
          onItemUpdated={handleItemUpdated}
          onCancel={handleCancelEdit}
        />
      ) : showAddForm ? (
        <BoardgameForm
          onItemCreated={handleItemCreated}
          onCancel={handleCancelCreate}
        />
      ) : null;
    }
    if (collectionName === "sanpham") {
      return selectedItemId ? (
        <ProductForm
          itemId={selectedItemId}
          onItemUpdated={handleItemUpdated}
          onCancel={handleCancelEdit}
        />
      ) : showAddForm ? (
        <ProductForm
          onItemCreated={handleItemCreated}
          onCancel={handleCancelCreate}
        />
      ) : null;
    }
    return null;
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: "red" }}>Lỗi: {error.message}</div>;

  return (
    <div>
      <h2>Quản lý {type}</h2>
      <button onClick={handleCreate}>Thêm {type} mới</button>
      {renderForm()}
      <ItemList
        type={type}
        items={items}
        onApprove={handleApprove}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onUpdateOrder={handleUpdateOrder}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ItemManager;
//codehoanhao//