// src/components/Admin/Comic/ChapterManager.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  deleteField, // ✅ thêm dòng này
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ChapterForm from "./ChapterForm";
import ChapterList from "./ChapterList";

const ChapterManager = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState(null);
  const [user] = useAuthState(auth);
  const slugify = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const generateSlugsForChapters = async () => {
    try {
      const snap = await getDocs(collection(db, "chapters"));
      const chapters = snap.docs;

      for (const chapterDoc of chapters) {
        const data = chapterDoc.data();
        if (!data.slug && data.title) {
          const newSlug = slugify(data.title);
          await updateDoc(doc(db, "chapters", chapterDoc.id), {
            slug: newSlug,
          });
          console.log(`✅ Slug set for: ${data.title} → ${newSlug}`);
        }
      }

      alert("✅ Đã tạo slug cho các chương chưa có!");
    } catch (error) {
      console.error("❌ Lỗi tạo slug chương:", error);
      alert("❌ Lỗi khi tạo slug!");
    }
  };
  
  //hàm để sửa và xóa dữ liệu sai trong field
  const migrateApproveToApproved = async () => {
    try {
      const snap = await getDocs(collection(db, "chapters"));
      const updates = snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const updates = {};

        // Nếu có approve → chuyển sang approved
        if (data.approve !== undefined) {
          updates.approved = data.approve;
          updates.approve = deleteField();
        }

        // Nếu approved đã tồn tại mà approve vẫn còn → xóa
        if (data.approved !== undefined && data.approve !== undefined) {
          updates.approve = deleteField();
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "chapters", docSnap.id), updates);
          console.log(`✅ Migrated: ${docSnap.id}`);
        }
      });

      await Promise.all(updates);
      alert("✅ Đã migrate và xoá field approve!");
    } catch (error) {
      console.error("❌ Lỗi khi migrate approve field:", error);
      alert("❌ Có lỗi xảy ra khi migrate!");
    }
  };
  

  const loadChapters = async () => {
    setLoading(true);
    const q = query(collection(db, "chapters"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setChapters(list);
    setLoading(false);
  };

  useEffect(() => {
    loadChapters();
  }, []);

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
  };

  const handleCancel = () => {
    setEditingChapter(null);
  };

  const handleSaved = () => {
    setEditingChapter(null);
    loadChapters();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này?")) return;
    await deleteDoc(doc(db, "chapters", id));
    loadChapters();
  };

  const handleSwap = async (idA, idB) => {
    const chapA = chapters.find((c) => c.id === idA);
    const chapB = chapters.find((c) => c.id === idB);
    if (!chapA || !chapB) return;
    await updateDoc(doc(db, "chapters", idA), { order: chapB.order });
    await updateDoc(doc(db, "chapters", idB), { order: chapA.order });
    loadChapters();
  };

  const handleToggleApprove = async (id, current) => {
    await updateDoc(doc(db, "chapters", id), { approved: !current });
    loadChapters();
  };

  return (
    <div style={{ padding: 20 }}>
      {editingChapter ? (
        <ChapterForm
          initialData={editingChapter}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <button onClick={() => setEditingChapter({})}>Thêm chương mới</button>
          <button
            onClick={generateSlugsForChapters}
            style={{
              marginLeft: "10px",
              backgroundColor: "#17a2b8",
              color: "#fff",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🚀 Tạo slug
          </button>

          <button
            onClick={migrateApproveToApproved}
            style={{
              marginLeft: "10px",
              backgroundColor: "#ffc107",
              color: "#000",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 đổi  approve → approved
          </button>

          {loading ? (
            <p>Đang tải danh sách chương...</p>
          ) : (
            <ChapterList
              chapters={chapters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSwap={handleSwap}
              onToggleApprove={handleToggleApprove}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChapterManager;
