// src/components/Admin/Nav/ManagePages.jsx

import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import useAdminCheck from "../../../hooks/useAdminCheck";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";
import { initializeFieldForCollection } from "../Common/firestoreTools";
import styles from "./ManagePages.module.css";

const ManagePages = () => {
  const [rawNavItems, setRawNavItems] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [newNavItem, setNewNavItem] = useState({
    label: "",
    url: "",
    order: 1,
    active: true,
    visibleTo: "all",
  });
  const { user, isAdmin } = useAdminCheck();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theo dõi auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  // Load navigationItems
  const loadNavigationItems = useCallback(() => {
    const q = query(collection(db, "navigationItems"), orderBy("order", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        setRawNavItems(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const unsub = loadNavigationItems();
    return () => unsub();
  }, [loadNavigationItems]);

  // Thêm mới
  const handleAdd = async () => {
    try {
      await addDoc(collection(db, "navigationItems"), {
        ...newNavItem,
        order: Number(newNavItem.order),
      });
      setAddFormVisible(false);
      setNewNavItem({
        label: "",
        url: "",
        order: 1,
        active: true,
        visibleTo: "all",
      });
    } catch (e) {
      setError(e);
    }
  };

  // Cập nhật
  const handleUpdate = async (id) => {
    try {
      await updateDoc(doc(db, "navigationItems", id), editForm);
      setEditForm(null);
    } catch (e) {
      setError(e);
    }
  };

  // Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await deleteDoc(doc(db, "navigationItems", id));
      } catch (e) {
        setError(e);
      }
    }
  };

  // Khởi tạo visibleTo (và active nếu cần)
  const initFields = async () => {
    try {
      await initializeFieldForCollection(
        "navigationItems",
        "visibleTo",
        () => "all"
      );
      alert("Đã khởi tạo field 'visibleTo' cho tất cả mục.");
    } catch (e) {
      console.error(e);
      alert("Lỗi khi khởi tạo field: " + e.message);
    }
  };

  if (loading) return <div className={styles.spinner}>Đang tải...</div>;
  if (error) return <div className={styles.error}>Lỗi: {error.message}</div>;

  // Admin thấy tất cả, khách chỉ thấy active & visible
  const navItemsToShow = isAdmin
    ? rawNavItems
    : rawNavItems.filter((item) => item.active && item.visibleTo === "all");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Navigation</h2>
        {isAdmin && (
          <div className={styles.headerActions}>
            <button
              className={styles.addBtn}
              onClick={() => setAddFormVisible((v) => !v)}
            >
              Thêm mới
            </button>
            <button className={styles.initBtn} onClick={initFields}>
              Khởi tạo visibleTo
            </button>
          </div>
        )}
      </div>

      {addFormVisible && isAdmin && (
        <div className={styles.formRow}>
          <input
            placeholder="Label"
            value={newNavItem.label}
            onChange={(e) =>
              setNewNavItem({ ...newNavItem, label: e.target.value })
            }
          />
          <input
            placeholder="URL"
            value={newNavItem.url}
            onChange={(e) =>
              setNewNavItem({ ...newNavItem, url: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Thứ tự"
            value={newNavItem.order}
            onChange={(e) =>
              setNewNavItem({ ...newNavItem, order: e.target.value })
            }
          />
          <select
            value={newNavItem.active}
            onChange={(e) =>
              setNewNavItem({
                ...newNavItem,
                active: e.target.value === "true",
              })
            }
          >
            <option value="true">Hiển thị</option>
            <option value="false">Ẩn</option>
          </select>
          <select
            value={newNavItem.visibleTo}
            onChange={(e) =>
              setNewNavItem({ ...newNavItem, visibleTo: e.target.value })
            }
          >
            <option value="all">Tất cả</option>
            <option value="auth">Chỉ thành viên</option>
          </select>
          <button className={styles.saveBtn} onClick={handleAdd}>
            Lưu
          </button>
        </div>
      )}

      <ul className={styles.list}>
        {navItemsToShow.map((item) => (
          <li
            key={item.id}
            className={`${styles.listItem} ${
              !item.active ? styles.disabled : ""
            }`}
          >
            {editForm && editForm.id === item.id && isAdmin ? (
              <div className={styles.formRow}>
                <input
                  value={editForm.label}
                  onChange={(e) =>
                    setEditForm({ ...editForm, label: e.target.value })
                  }
                />
                <input
                  value={editForm.url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, url: e.target.value })
                  }
                />
                <input
                  type="number"
                  value={editForm.order}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      order: Number(e.target.value),
                    })
                  }
                />
                <select
                  value={editForm.active}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      active: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Hiển thị</option>
                  <option value="false">Ẩn</option>
                </select>
                <select
                  value={editForm.visibleTo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, visibleTo: e.target.value })
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="auth">Chỉ thành viên</option>
                </select>
                <button
                  className={styles.saveBtn}
                  onClick={() => handleUpdate(item.id)}
                >
                  Lưu
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setEditForm(null)}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.url}>{item.url}</span>
                <span className={styles.order}>#{item.order}</span>
                <span className={styles.visible}>
                  {item.visibleTo === "all" ? "Tất cả" : "Chỉ thành viên"}
                </span>
                {isAdmin && (
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => setEditForm(item)}
                    >
                      Sửa
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagePages;
