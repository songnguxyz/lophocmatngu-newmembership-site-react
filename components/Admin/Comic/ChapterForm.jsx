// src/components/Admin/Comic/ChapterForm.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
  getDoc,
  query,
  orderBy,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import MultiImageUploader from "../Common/MultiImageUploader";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import ChapterPremiumEditor from "./ChapterPremiumEditor";
import ImageUploader from "../Common/ImageUploader";
import Select from "react-select";

const ChapterForm = ({ initialData, onSaved, onCancel }) => {
  const data = initialData || {};
  const [title, setTitle] = useState(data.title || "");
  const [isPremium, setIsPremium] = useState(data.isPremium || false);
  const [coverUrl, setCoverUrl] = useState(data.coverUrl || "");
  const [images, setImages] = useState(
    (data.imageUrls || []).map((url) => ({ url }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const [allCharacters, setAllCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [allComics, setAllComics] = useState([]);
  const [selectedComics, setSelectedComics] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const [charSnap, comicSnap] = await Promise.all([
        getDocs(collection(db, "characters")),
        getDocs(collection(db, "truyens")),
      ]);

      const chars = charSnap.docs.map((doc) => {
        const d = doc.data();
        const genderMap = { male: "Nam", female: "Nữ", other: "Khác" };
        const gender = genderMap[d.gender] || "Không rõ";
        return {
          value: doc.id,
          label: `${d.name} (${gender})`,
          hasChapter: (d.featuredComics || []).includes(data.id),
        };
      });
      

      const comics = comicSnap.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().title,
        hasChapter: (doc.data().chapters || []).includes(data.id),
      }));

      setAllCharacters(chars);
      setAllComics(comics);

      // chọn mặc định:
      const defaultChars = chars.filter(
        (c) => (data.characters || []).includes(c.value) || c.hasChapter
      );
      const defaultComics = comics.filter(
        (c) => (data.comics || []).includes(c.value) || c.hasChapter
      );

      setSelectedCharacters(defaultChars);
      setSelectedComics(defaultComics);
    };
    fetchOptions();
  }, [data.id, data.characters, data.comics]);
  

  const slugify = (str) =>
    str
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleCoverUpload = async (newUrl) => {
    if (coverUrl) await deleteImageFromUrl(coverUrl).catch(() => {});
    setCoverUrl(newUrl);
  };

  const handleUploadImages = (uploaded) => {
    setImages((prev) => [
      ...prev,
      ...uploaded.map((img) => ({ url: img.url })),
    ]);
  };

  const handleDeleteImage = async (idx) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    await deleteImageFromUrl(images[idx].url).catch(() => {});
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const syncLinkedDocs = async (chapterId, type, newIds) => {
    const col = type === "character" ? "characters" : "truyens";
    const field = type === "character" ? "featuredComics" : "chapters";

    const snap = await getDocs(collection(db, col));
    for (const docSnap of snap.docs) {
      const ref = doc(db, col, docSnap.id);
      const hasLink = (docSnap.data()[field] || []).includes(chapterId);

      if (newIds.includes(docSnap.id) && !hasLink) {
        await updateDoc(ref, { [field]: arrayUnion(chapterId) });
      } else if (!newIds.includes(docSnap.id) && hasLink) {
        await updateDoc(ref, { [field]: arrayRemove(chapterId) });
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(new Error("Vui lòng nhập tên chương."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let chapterRef;
      const chapterPayload = {
        title,
        slug: slugify(title),
        isPremium,
        coverUrl,
        uid: user.uid,
        approved: data.approved ?? false,
        order: data.order || 1,
        createdAt: Timestamp.fromDate(new Date()),
        characters: selectedCharacters.map((c) => c.value),
        comics: selectedComics.map((c) => c.value),
      };

      if (data.id) {
        chapterRef = doc(db, "chapters", data.id);
        await updateDoc(chapterRef, chapterPayload);
      } else {
        const q = query(collection(db, "chapters"), orderBy("order", "desc"));
        const snap = await getDocs(q);
        const nextOrder = snap.empty ? 1 : snap.docs[0].data().order + 1;
        chapterPayload.order = nextOrder;
        const newDoc = await addDoc(collection(db, "chapters"), chapterPayload);
        chapterRef = newDoc;
      }

      const chapterId = chapterRef.id || chapterRef; // addDoc trả về DocumentRef

      // Save chapter images to chapterContent
      await setDoc(doc(db, "chapterContent", chapterId), {
        images: images.map((i) => i.url),
      });

      // Sync chapter reference to characters and comics
      await Promise.all([
        syncLinkedDocs(
          chapterId,
          "character",
          selectedCharacters.map((c) => c.value)
        ),
        syncLinkedDocs(
          chapterId,
          "comic",
          selectedComics.map((c) => c.value)
        ),
      ]);

      window.alert("Cập nhật chương thành công!");
      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(err);
      window.alert("Lỗi khi lưu chương: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxHeight: "80vh", overflowY: "auto" }}>
      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-group">
          <label>Tên chương:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <ChapterPremiumEditor
            chapter={{ isPremium }}
            index={0}
            onChange={() => setIsPremium((p) => !p)}
          />
        </div>

        <div className="form-group">
          <label>Ảnh bìa chương:</label>
          <ImageUploader
            inputId="chapter-cover"
            label="Chọn ảnh bìa"
            folder={`chapters/${data.id || "new"}`}
            defaultImage={coverUrl}
            onUploadSuccess={handleCoverUpload}
            width={120}
            height={160}
          />
        </div>

        <div className="form-group">
          <label>Album ảnh chương:</label>
          <MultiImageUploader
            folder={`chapters/${data.id || "new"}`}
            onUploadSuccess={handleUploadImages}
          />
        </div>

        {images.length > 0 && (
          <div className="form-group">
            <label>Preview ảnh:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ width: 100 }}>
                  <img
                    src={img.url}
                    alt=""
                    style={{
                      width: "100%",
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    style={{
                      marginTop: 6,
                      padding: "2px 6px",
                      fontSize: "0.8em",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ✕ Xóa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Nhân vật xuất hiện trong chương:</label>
          <Select
            isMulti
            options={allCharacters}
            value={selectedCharacters}
            onChange={setSelectedCharacters}
            placeholder="Chọn nhân vật…"
          />
        </div>

        <div className="form-group">
          <label>Thuộc truyện:</label>
          <Select
            isMulti
            options={allComics}
            value={selectedComics}
            onChange={setSelectedComics}
            placeholder="Chọn truyện…"
          />
        </div>

        <div className="buttons">
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

export default ChapterForm;
