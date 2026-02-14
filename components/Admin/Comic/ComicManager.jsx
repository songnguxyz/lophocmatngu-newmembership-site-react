import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  where,
  limit,
} from "firebase/firestore";
import ComicList from "./ComicList";
import ComicForm from "./ComicForm";
import CategoryManager from "./ComicCategoryManager";
import Modal from "../Common/Modal";
import "./ComicManager.css";
import "../Common/TabStyle.css";
import "../Common/PaginationStyle.css";

const initializeOrderField = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "truyens"), orderBy("createdAt", "asc"))
    );
    const comics = querySnapshot.docs;

    for (let i = 0; i < comics.length; i++) {
      const comicDoc = comics[i];
      await updateDoc(doc(db, "truyens", comicDoc.id), {
        order: i,
      });
    }

    alert("✅ Đã cập nhật xong trường order cho tất cả truyện!");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật order:", error);
    alert("Có lỗi xảy ra khi cập nhật order!");
  }
};

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const generateSlugsForAllComics = async () => {
  try {
    const snap = await getDocs(collection(db, "truyens"));
    const comics = snap.docs;

    for (let docSnap of comics) {
      const data = docSnap.data();
      if (!data.slug && data.title) {
        const newSlug = slugify(data.title);
        await updateDoc(doc(db, "truyens", docSnap.id), {
          slug: newSlug,
        });
        console.log(`✅ Slug set for: ${data.title} → ${newSlug}`);
      }
    }

    alert("✅ Đã tạo slug cho tất cả truyện chưa có!");
  } catch (error) {
    console.error("❌ Lỗi khi tạo slug:", error);
    alert("Có lỗi xảy ra khi tạo slug!");
  }
};


const ComicManager = () => {
  const [categories, setCategories] = useState([]);
  const [comics, setComics] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [selectedComicId, setSelectedComicId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const comicsPerPage = 10;

  useEffect(() => {
    const loadCategories = () => {
      const q = query(collection(db, "categories"), orderBy("name"));
      onSnapshot(q, (snapshot) => {
        const categoryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(categoryData);
        if (!activeCategoryId && categoryData.length > 0) {
          setActiveCategoryId(categoryData[0].id);
        }
      });
    };
    loadCategories();
  }, [activeCategoryId]);

  useEffect(() => {
    const loadComics = () => {
      const q = query(collection(db, "truyens"), orderBy("order", "asc"));
      onSnapshot(q, (snapshot) => {
        const comicsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComics(comicsData);
        setLoading(false);
      });
    };
    loadComics();
  }, []);

  const handleOpenAddForm = () => {
    setSelectedComicId(null);
    setShowForm(true);
  };

  const handleOpenAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const handleOpenEditForm = (comicId) => {
    setSelectedComicId(comicId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSuccess = () => {
    setShowForm(false);
  };

  const handleApprove = async (id, currentApproved) => {
    try {
      await updateDoc(doc(db, "truyens", id), {
        approved: !currentApproved,
      });
      alert("Cập nhật trạng thái duyệt thành công!");
    } catch {
      alert("Lỗi khi cập nhật duyệt/hủy duyệt!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa truyện này?")) {
      try {
        await deleteDoc(doc(db, "truyens", id));
        alert("Đã xóa truyện!");
      } catch {
        alert("Lỗi khi xóa truyện!");
      }
    }
  };

  // ✨ Move lên theo order
  const handleMoveUp = async (id) => {
    try {
      const currentDocRef = doc(db, "truyens", id);
      const currentSnap = await getDoc(currentDocRef);
      const currentOrder = currentSnap.data()?.order ?? 0;

      const q = query(
        collection(db, "truyens"),
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
          updateDoc(doc(db, "truyens", prevDoc.id), { order: currentOrder }),
        ]);

        console.log("✅ Đã di chuyển lên!");
      } else {
        alert("🚫 Đã ở đầu danh sách!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi di chuyển lên!");
    }
  };

  // ✨ Move xuống theo order
  const handleMoveDown = async (id) => {
    try {
      const currentDocRef = doc(db, "truyens", id);
      const currentSnap = await getDoc(currentDocRef);
      const currentOrder = currentSnap.data()?.order ?? 0;

      const q = query(
        collection(db, "truyens"),
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
          updateDoc(doc(db, "truyens", nextDoc.id), { order: currentOrder }),
        ]);

        console.log("✅ Đã di chuyển xuống!");
      } else {
        alert("🚫 Đã ở cuối danh sách!");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi di chuyển xuống!");
    }
  };

  const handleChangePage = (pageNumber) => {
    setIsPageLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsPageLoading(false);
    }, 500);
  };

  const renderTabs = () => (
    <div className="tabs-container">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`tab-item ${activeCategoryId === cat.id ? "active" : ""}`}
          onClick={() => {
            setActiveCategoryId(cat.id);
            setCurrentPage(1);
          }}
        >
          {cat.name}
        </div>
      ))}
      <div
        className={`tab-item ${activeCategoryId === "all" ? "active" : ""}`}
        onClick={() => {
          setActiveCategoryId("all");
          setCurrentPage(1);
        }}
      >
        Tất cả
      </div>
    </div>
  );

  const filteredComics =
    activeCategoryId === "all"
      ? comics
      : comics.filter((comic) => comic.category === activeCategoryId);

  const indexOfLastComic = currentPage * comicsPerPage;
  const indexOfFirstComic = indexOfLastComic - comicsPerPage;
  const currentComics = filteredComics.slice(
    indexOfFirstComic,
    indexOfLastComic
  );
  const totalPages = Math.ceil(filteredComics.length / comicsPerPage);

  return (
    <div className="comic-manager">
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={handleOpenAddCategory}
          className="btn-primary"
          style={{ backgroundColor: "#28a745" }}
        >
          ➕ Quản lý thể loại
        </button>

        <button onClick={handleOpenAddForm} className="btn-primary">
          ➕ Thêm truyện mới
        </button>
        <button
          onClick={initializeOrderField}
          style={{
            marginLeft: "10px",
            padding: "10px",
            backgroundColor: "orange",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🚀 Tạo trường Order
        </button>
        <button
          onClick={generateSlugsForAllComics}
          style={{
            marginLeft: "10px",
            padding: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🚀 Tạo slug
        </button>
      </div>

      {renderTabs()}

      <div style={{ marginTop: 20 }}>
        {loading || isPageLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : currentComics.length === 0 ? (
          <div>Không có truyện nào.</div>
        ) : (
          <ComicList
            comics={currentComics}
            onApprove={handleApprove}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onEdit={handleOpenEditForm}
            canMove={activeCategoryId === "all"}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handleChangePage(idx + 1)}
              className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            ▶
          </button>
        </div>
      )}

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <ComicForm
            comicId={selectedComicId}
            onComicCreated={handleSuccess}
            onComicUpdated={handleSuccess}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
      {showCategoryModal && (
        <Modal onClose={handleCloseCategoryModal}>
          <CategoryManager />
        </Modal>
      )}
    </div>
  );
};

export default ComicManager;
//code chạy hoàn hảo
