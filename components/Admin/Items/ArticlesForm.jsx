import React, { useState, useEffect, useRef } from "react";
import Modal from "../Common/Modal";
import ImageUploader from "../Common/ImageUploader";
import MultiImageUploader from "../Common/MultiImageUploader";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import { db, auth } from "../../../firebase";
import {
doc,
getDoc,
updateDoc,
collection,
getDocs,
addDoc,
query,
orderBy,
limit,
} from "firebase/firestore";
import DOMPurify from "dompurify";
import { useAuthState } from "react-firebase-hooks/auth";
import Quill from "quill";
import "quill/dist/quill.snow\.css";

const ArticleForm = ({ itemId, onItemCreated, onItemUpdated, onCancel }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // thêm trường giá
  const [purchaseLinks, setPurchaseLinks] = useState(""); // link mua gộp
  const [content, setContent] = useState(""); // full description qua quill
  const [category, setCategory] = useState(""); // giữ các trường khác nếu có
  const [fbImageUrl, setFbImageUrl] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [localAlbum, setLocalAlbum] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const collectionName = "home";
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

  // Khởi tạo Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: { toolbar: true },
        placeholder: "Nhập nội dung chi tiết...",
      });
      quillRef.current.on("text-change", () => {
        setContent(quillRef.current.root.innerHTML);
      });
    }
  }, []);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, collectionName, itemId));
        if (!snap.exists()) throw new Error("Không tìm thấy dữ liệu");
        const data = snap.data();
        setTitle(data.title || "");
        setPrice(data.price != null ? data.price.toString() : "");
        setPurchaseLinks((data.purchaseLinks || []).join(", "));
        setContent(data.content || "");
        setCategory(data.category || "");
        setFbImageUrl(data.fbImageUrl || null);
        setCoverImageUrl(data.coverImageUrl || null);
        setLocalAlbum(data.albumImages || []);
        if (quillRef.current)
          quillRef.current.root.innerHTML = data.content || "";
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

  // Helpers
  const handleUpload = async (getOldUrl, setter, newUrl) => {
    const oldUrl = getOldUrl();
    if (oldUrl) await deleteImageFromUrl(oldUrl);
    setter(newUrl);
  };

  const handleUploadSuccess = (uploaded) => {
    setLocalAlbum((prev) => [...prev, ...uploaded]);
    setNewImages([]);
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...localAlbum];
    updated[index].description = value;
    setLocalAlbum(updated);
  };

  const handleRemoveImage = async (img) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    if (img.url) await deleteImageFromUrl(img.url);
    setLocalAlbum((prev) => prev.filter((i) => i.url !== img.url));
  };

  // Tạo order
  const generateOrder = async () => {
    const q = query(
      collection(db, collectionName),
      orderBy("order", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? 1 : snap.docs[0].data().order + 1;
  };

  // Lưu dữ liệu
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        slug: slugify(title),
        price: Number(price) || 0,
        purchaseLinks: purchaseLinks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        content: DOMPurify.sanitize(content),
        category,
        fbImageUrl,
        coverImageUrl,
        albumImages: localAlbum,
        uid: user.uid,
      };
      if (itemId) {
        await updateDoc(doc(db, collectionName, itemId), payload);
        onItemUpdated?.();
      } else {
        payload.order = await generateOrder();
        await addDoc(collection(db, collectionName), payload);
        onItemCreated?.();
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onCancel}>
      {" "}
      <form onSubmit={handleSave} className="character-form">
        {" "}
        <h3>{itemId ? "Chỉnh sửa Bài viết" : "Thêm Bài viết mới"}</h3>
        <label>Tiêu đề</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label>Giá</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label>Link mua (ngăn cách bằng ,)</label>
        <input
          value={purchaseLinks}
          onChange={(e) => setPurchaseLinks(e.target.value)}
        />
        <label>Chuyên mục</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
        <label>Nội dung chi tiết</label>
        <div
          ref={editorRef}
          style={{ height: 250, background: "#fff", marginBottom: 10 }}
        />
        <ImageUploader
          key={fbImageUrl || "fb-empty"}
          inputId="fbImageUploader"
          folder={collectionName}
          label="Ảnh FB"
          defaultImage={fbImageUrl}
          onUploadSuccess={(url) =>
            handleUpload(() => fbImageUrl, setFbImageUrl, url)
          }
          width={100}
          height={100}
        />
        <ImageUploader
          key={coverImageUrl || "cover-empty"}
          inputId="coverImageUploader"
          folder={collectionName}
          label="Ảnh bìa"
          defaultImage={coverImageUrl}
          onUploadSuccess={(url) =>
            handleUpload(() => coverImageUrl, setCoverImageUrl, url)
          }
          width={100}
          height={100}
        />
        <label>Album ảnh</label>
        <MultiImageUploader
          folder={collectionName}
          images={newImages}
          setImages={setNewImages}
          onUploadSuccess={handleUploadSuccess}
        />
        {localAlbum.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            {localAlbum.map((img, idx) => (
              <div
                key={`${idx}-${img.url}`}
                style={{
                  width: 160,
                  border: "1px solid #ccc",
                  padding: 10,
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                }}
              >
                <img
                  src={img.url}
                  alt={`Ảnh ${idx}`}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
                <textarea
                  placeholder="Mô tả ảnh"
                  value={img.description || ""}
                  onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    fontSize: "0.8em",
                    padding: 6,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  style={{
                    background: "transparent",
                    color: "#f00",
                    border: "none",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ❌ Xóa
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="buttons" style={{ marginTop: 20 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu"}
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error.message}</p>}
      </form>
    </Modal>
  );
};

export default ArticleForm;
