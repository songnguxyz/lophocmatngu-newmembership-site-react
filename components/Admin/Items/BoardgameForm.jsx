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

const BoardgameForm = ({ itemId, onItemCreated, onItemUpdated, onCancel }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // thêm giá
  const [author, setAuthor] = useState("");
  const [artist, setArtist] = useState("");
  const [publisher, setPublisher] = useState("");
  const [genres, setGenres] = useState("");
  const [players, setPlayers] = useState("");
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState("");
  const [intro, setIntro] = useState("");
  const [content, setContent] = useState("");
  const [fbImageUrl, setFbImageUrl] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [localAlbum, setLocalAlbum] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [purchaseLinks, setPurchaseLinks] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const collectionName = "boardgame";
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
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: { toolbar: true },
        placeholder: "Nhập mô tả chi tiết...",
      });
      quillRef.current.on("text-change", () => {
        setContent(quillRef.current.root.innerHTML);
      });
    }
  }, []);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDoc(doc(db, collectionName, itemId));
        if (!snap.exists()) throw new Error("Không tìm thấy dữ liệu");
        const data = snap.data();
        setTitle(data.title || "");
        setPrice(data.price != null ? data.price.toString() : ""); // load giá
        setAuthor(data.author || "");
        setArtist(data.artist || "");
        setPublisher(data.publisher || "");
        setGenres((data.genres || []).join(", "));
        setPlayers(data.players?.toString() || "");
        setAge(data.age || "");
        setDuration(data.duration || "");
        setIntro(data.intro || "");
        setContent(data.content || "");
        setFbImageUrl(data.fbImageUrl || null);
        setCoverImageUrl(data.coverImageUrl || null);
        setLocalAlbum(data.albumImages || []);
        setPurchaseLinks((data.purchaseLinks || []).join(", "));
        setVideoLink(data.videoLink || "");
        if (quillRef.current)
          quillRef.current.root.innerHTML = data.content || "";
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [itemId]);

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

  const generateOrder = async () => {
    const q = query(
      collection(db, collectionName),
      orderBy("order", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? 1 : snap.docs[0].data().order + 1;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        slug: slugify(title),
        price: Number(price) || 0, // include giá
        author,
        artist,
        publisher,
        genres: genres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        players: Number(players) || 0,
        age,
        duration,
        intro,
        content: DOMPurify.sanitize(content),
        fbImageUrl,
        coverImageUrl,
        albumImages: localAlbum,
        purchaseLinks: purchaseLinks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        videoLink,
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
        <h3>{itemId ? "Chỉnh sửa Boardgame" : "Thêm Boardgame mới"}</h3>
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
        <label>Tác giả</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        <label>Họa sĩ</label>
        <input value={artist} onChange={(e) => setArtist(e.target.value)} />
        <label>Phát hành</label>
        <input
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />
        <label>Thể loại (ngăn cách bằng ,)</label>
        <input value={genres} onChange={(e) => setGenres(e.target.value)} />
        <label>Số người chơi</label>
        <input
          type="number"
          value={players}
          onChange={(e) => setPlayers(e.target.value)}
        />
        <label>Độ tuổi</label>
        <input value={age} onChange={(e) => setAge(e.target.value)} />
        <label>Thời gian</label>
        <input value={duration} onChange={(e) => setDuration(e.target.value)} />
        <label>Giới thiệu ngắn (intro)</label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          style={{ height: 80, resize: "vertical" }}
        />
        <label>Mô tả chi tiết</label>
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
        <label>Link mua game (ngăn cách bằng ,)</label>
        <input
          value={purchaseLinks}
          onChange={(e) => setPurchaseLinks(e.target.value)}
        />
        <label>Video YouTube (URL)</label>
        <input
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
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

export default BoardgameForm;
