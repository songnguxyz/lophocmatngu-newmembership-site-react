// src/components/Admin/Comic/ComicForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  limit,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import DOMPurify from "dompurify";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import ImageUploader from "../Common/ImageUploader";
import Select from "react-select";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import "./ComicManager.css";

const ComicForm = ({ comicId, onComicUpdated, onCancel, onComicCreated }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [fullDescription, setFullDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [chapterOptions, setChapterOptions] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [user] = useAuthState(auth);

  const fullDescriptionRef = useRef(null);
  const quillInstance = useRef(null);
  const syncChaptersInChapterDocs = async (
    chapterIds,
    characterOrComicId,
    type
  ) => {
    const field = type === "character" ? "characters" : "comics";

    const snap = await getDocs(collection(db, "chapters"));
    for (const docSnap of snap.docs) {
      const chapterRef = doc(db, "chapters", docSnap.id);
      const current = docSnap.data()[field] || [];
      const hasLink = current.includes(characterOrComicId);
      const shouldHave = chapterIds.includes(docSnap.id);

      if (shouldHave && !hasLink) {
        await updateDoc(chapterRef, {
          [field]: arrayUnion(characterOrComicId),
        });
      } else if (!shouldHave && hasLink) {
        await updateDoc(chapterRef, {
          [field]: arrayRemove(characterOrComicId),
        });
      }
    }
  };
  
  const slugify = (str) =>
    str
      .replace(/đ/g, "d") // Thay đ → d
      .replace(/Đ/g, "D") // Thay Đ → D (nếu giữ nguyên chữ hoa, nhưng sau đó sẽ toLowerCase)
      .toLowerCase()
      .normalize("NFD") // Tách dấu
      .replace(/[\u0300-\u036f]/g, "") // Xoá dấu
      .replace(/[^a-z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (comicId) {
          const docRef = doc(db, "truyens", comicId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || "");
            setAuthor(data.author || "");
            setCategory(data.category || "");
            setCoverImageUrl(data.coverImageUrl || "");
            setFullDescription(data.summary || "");
            if (quillInstance.current) {
              quillInstance.current.root.innerHTML = data.summary || "";
            }
            if (Array.isArray(data.chapters)) {
              setSelectedChapters(
                data.chapters.map((id) => ({ value: id, label: "" }))
              );
            }
          }
        }
        // load categories
        const catQ = query(collection(db, "categories"), orderBy("name"));
        const catSnap = await getDocs(catQ);
        setCategories(
          catSnap.docs.map((d) => ({ id: d.id, name: d.data().name }))
        );
        // load all chapters
        const chQ = query(collection(db, "chapters"), orderBy("order", "asc"));
        const chSnap = await getDocs(chQ);
        const opts = chSnap.docs.map((d) => ({
          value: d.id,
          label: d.data().title,
        }));
        setChapterOptions(opts);
        // sync selected labels
        setSelectedChapters((prev) =>
          prev.map((s) => opts.find((o) => o.value === s.value) || s)
        );
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [comicId]);

  useEffect(() => {
    if (fullDescriptionRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(fullDescriptionRef.current, {
        theme: "snow",
        placeholder: "Nhập tóm tắt truyện...",
      });
      quillInstance.current.on("text-change", () => {
        setFullDescription(quillInstance.current.root.innerHTML);
      });
    }
  }, []);

  // Wrapper để xóa cover cũ và cập nhật cover mới
  const handleCoverUploadSuccess = async (newUrl) => {
    if (coverImageUrl) {
      try {
        await deleteImageFromUrl(coverImageUrl);
        console.log("Xóa ảnh cover cũ thành công:", coverImageUrl);
      } catch (err) {
        console.error("Xóa ảnh cover cũ thất bại:", coverImageUrl, err);
      }
    }
    setCoverImageUrl(newUrl);
  };

  const handleSelectChapters = (opts) => setSelectedChapters(opts || []);

  const generateOrder = async () => {
    const q = query(
      collection(db, "truyens"),
      orderBy("order", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? 1 : snap.docs[0].data().order + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await syncChaptersInChapterDocs(
      selectedChapters.map((c) => c.value),
      comicId,
      "comic"
    );
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title,
        slug: slugify(title),
        author,
        category,
        summary: DOMPurify.sanitize(fullDescription),
        coverImageUrl,
        chapters: selectedChapters.map((o) => o.value),
        uid: user.uid,
        approved: true,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      if (comicId) {
        await updateDoc(doc(db, "truyens", comicId), payload);
        window.alert("✅ Cập nhật truyện thành công!");
        onComicUpdated?.();
      } else {
        payload.order = await generateOrder();
        await addDoc(collection(db, "truyens"), payload);
        window.alert("✅ Thêm truyện mới thành công!");
        onComicCreated?.();
      }
    } catch (e) {
      console.error(e);
      setError(e);
      window.alert("❌ Lỗi khi lưu truyện: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div style={{ maxHeight: "90vh", overflowY: "auto", padding: 20 }}>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-group">
          <label>Tên truyện:</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Tác giả:</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Thể loại:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Chọn thể loại--</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tóm tắt:</label>
          <div ref={fullDescriptionRef} style={{ height: 200 }} />
        </div>
        <div className="form-group">
          <ImageUploader
            key={coverImageUrl || "cover-empty"}
            inputId="cover-upload"
            label="Bìa truyện"
            folder="covers"
            defaultImage={coverImageUrl}
            onUploadSuccess={handleCoverUploadSuccess}
            width={150}
            height={200}
          />
        </div>
        <div className="form-group">
          <label>Chọn chương:</label>
          <Select
            isMulti
            options={chapterOptions}
            value={selectedChapters}
            onChange={handleSelectChapters}
            placeholder="Gõ để chọn chapter..."
          />
        </div>
        <div className="buttons" style={{ marginTop: 20 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error.message}</p>}
      </form>
    </div>
  );
};

export default ComicForm;
