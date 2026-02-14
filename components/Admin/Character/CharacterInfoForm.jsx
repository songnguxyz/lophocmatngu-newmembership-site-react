import React, { useState, useEffect, useRef } from "react";
import { useQuill } from "../Common/useQuill";
//import "quill/dist/quill.snow.css";
import Select from "react-select";
import styles from "./CharacterInfo.module.css";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import ImageUploader from "../Common/ImageUploader";

const CharacterInfoForm = ({ character, onSave, onCancel }) => {
  const [name, setName] = useState(character.name || "");
  const [attribute, setAttribute] = useState(character.attribute || "");
  const [gender, setGender] = useState(character.gender || "male");
  const [_class, setClass] = useState(character.class || "");
  const [birthdate, setBirthdate] = useState(character.birthdate || "");
  const [avatarPreview, setAvatarPreview] = useState(character.avatarUrl || "");
  const [posterPreview, setPosterPreview] = useState(character.posterUrl || "");
  const [interviewPreview, setInterviewPreview] = useState(
    character.interviewUrl || ""
  );
  const [fullDescription, setFullDescription] = useState(
    character.fullDescription || ""
  );
  const [shortDescription, setShortDescription] = useState(
    character.shortDescription || ""
  );
  const [category, setCategory] = useState(character.category || "");
  const [quote, setQuote] = useState(character.quote || "");
  const [peak, setPeak] = useState(character.peak || "");
  const [featuredComics, setFeaturedComics] = useState([]);
  const [allComics, setAllComics] = useState([]);
  const [backgroundColor] = useState(
    (character.theme && character.theme.background) || "#878787"
  );
  const [genderOptions] = useState(["male", "female", "other"]);

  // Hàm helper để chuyển tên + giới tính thành slug
  const toSlug = (str) => {
    return str
      .replace(/đ/g, "d") // xử lý chữ đ
      .replace(/Đ/g, "D") // xử lý chữ Đ (nếu bạn muốn giữ hoa, nhưng sau đó sẽ toLowerCase)
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // thay ký tự lạ thành '-'
      .replace(/(^-|-$)/g, "");
  };


  const [attributeOptions] = useState([
    { value: "Water", label: "Nước" },
    { value: "Fire", label: "Lửa" },
    { value: "Air", label: "Khí" },
    { value: "Earth", label: "Đất" },
  ]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fullQuill = useQuill({
    initialValue: character.fullDescription,
    placeholder: "Nhập thông tin đầy đủ…",
  });
  const shortQuill = useQuill({
    initialValue: character.shortDescription,
    placeholder: "Nhập thông tin ngắn…",
  });

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

  //const editorRef = useRef(null);
  //const quillInstance = useRef(null);

  // Initialize Quill editor
  //useEffect(() => {
  //  if (editorRef.current && !quillInstance.current) {
  //    quillInstance.current = new Quill(editorRef.current, {
  //      theme: "snow",
  //      placeholder: "Nhập thông tin đầy đủ...",
  //      modules: {
  //        toolbar: [
  //          ["bold", "italic", "underline"],
  //          [{ list: "ordered" }, { list: "bullet" }],
  //          ["link", "image"],
  //          ["clean"],
  //        ],
  //     },
  //    });
  //    quillInstance.current.on("text-change", () => {
  //      setFullDescription(quillInstance.current.root.innerHTML);
  //    });
  //    if (character.fullDescription)
  //      quillInstance.current.root.innerHTML = character.fullDescription;
  //  }
  //}, [character.fullDescription]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, "characterscategories"),
          orderBy("name")
        );
        const snapshot = await getDocs(q);
        setCategoryOptions(
          snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
        );
      } catch (err) {
        console.error("Lỗi khi tải thể loại:", err);
      }
    };
    fetchCategories();
  }, []);

  // Load chapters
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const snap = await getDocs(collection(db, "chapters"));
        const data = snap.docs.map((doc) => ({
          value: doc.id,
          label: doc.data().title,
        }));
        setAllComics(data);
        if (character.featuredComics)
          setFeaturedComics(
            data.filter((c) => character.featuredComics.includes(c.value))
          );
      } catch (err) {
        console.error("Lỗi khi tải chương:", err);
      }
    };
    fetchChapters();
  }, [character.featuredComics]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullDesc = fullQuill.getContent();
    const shortDesc = shortQuill.getContent();

    await syncChaptersInChapterDocs(
      featuredComics.map((c) => c.value),
      character.id, // hoặc characterId nếu bạn có biến riêng
      "character"
    );
  
    
   // 1) Tạo slug cơ bản từ tên
   let baseSlug = toSlug(name);
   // 2) Thêm hậu tố nam/nu/other để phân biệt trùng tên
   const genderSuffix = gender === "male" 
     ? "nam" 
     : gender === "female" 
       ? "nu" 
       : "other";
   const slug = `${baseSlug}-${genderSuffix}`;

    setLoading(true);
    try {
      // Avatar
      if (character.avatarUrl && avatarPreview !== character.avatarUrl) {
        console.log("Xóa ảnh avatar cũ:", character.avatarUrl);
        await deleteImageFromUrl(character.avatarUrl);
      }
      // Poster
      if (character.posterUrl && posterPreview !== character.posterUrl) {
        console.log("Xóa ảnh poster cũ:", character.posterUrl);
        await deleteImageFromUrl(character.posterUrl);
      }
      // Interview
      if (
        character.interviewUrl &&
        interviewPreview !== character.interviewUrl
      ) {
        console.log("Xóa ảnh interview cũ:", character.interviewUrl);
        await deleteImageFromUrl(character.interviewUrl);
      }

      await onSave({
        name,
        slug,
        attribute,
        gender,
        class: _class,
        birthdate,
        fullDescription: fullDesc,
        shortDescription: shortDesc,
        category,
        quote,
        peak,
        featuredComics: featuredComics.map((c) => c.value),
        backgroundColor,
        avatarUrl: avatarPreview,
        posterUrl: posterPreview,
        interviewUrl: interviewPreview,
      });
      alert("Cập nhật nhân vật thành công!");
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("Lỗi khi lưu nhân vật. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>Chỉnh sửa: {character.name}</h3>
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Tên:</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className={styles.label}>Thuộc tính:</label>
          <select
            className={styles.input}
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
          >
            <option value="">-- Chọn thuộc tính --</option>
            {attributeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className={styles.label}>Giới tính:</label>
          <select
            className={styles.input}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            {genderOptions.map((g) => (
              <option key={g} value={g}>
                {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
              </option>
            ))}
          </select>

          <label className={styles.label}>Lớp:</label>
          <input
            className={styles.input}
            value={_class}
            onChange={(e) => setClass(e.target.value)}
          />

          <label className={styles.label}>Ngày sinh:</label>
          <input
            className={styles.input}
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            placeholder="dd/mm/yyyy"
          />

          <div className={styles.flexContainer}>
            <div className={styles.uploaderBlock}>
              <ImageUploader
                inputId="avatarUploader"
                folder="avatars"
                label="Ảnh đại diện"
                defaultImage={character.avatarUrl || ""}
                onUploadSuccess={(url) => setAvatarPreview(url)}
                width={100}
                height={100}
              />
            </div>
            <div className={styles.uploaderBlock}>
              <ImageUploader
                inputId="posterUploader"
                folder="posters"
                label="Ảnh poster"
                defaultImage={character.posterUrl || ""}
                onUploadSuccess={(url) => setPosterPreview(url)}
                width={150}
                height={150}
              />
            </div>
            <div className={styles.uploaderBlock}>
              <ImageUploader
                inputId="interviewUploader"
                folder="interviews"
                label="Ảnh phỏng vấn"
                defaultImage={character.interviewUrl || ""}
                onUploadSuccess={(url) => setInterviewPreview(url)}
                width={150}
                height={150}
              />
            </div>
            <div className={styles.uploaderBlock}>
              {" "}
              <label className={styles.label}>Poster preview:</label>
              <div className={styles.previewBox}>
                <div className={styles.overlayBg} style={{ backgroundColor }} />
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt="Poster Preview"
                    className={styles.previewImage}
                  />
                )}
              </div>
            </div>
          </div>
          <label>Đặc điểm nhận dạng:</label>
          <div
            ref={shortQuill.editorRef}
            className={styles.editor}
            style={{ height: 80 }}
          />
          <label>Thông tin Khác:</label>
          <div
            ref={fullQuill.editorRef}
            className={styles.editor}
            style={{ height: 100 }}
          />

          {/*     <label className={styles.label}>Thông tin đầy đủ:</label>
        <div ref={editorRef} className={styles.editor} /> 

          <label className={styles.label}>Thông tin khác:</label>
          <textarea
            className={styles.textarea}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={3}
          />
*/}
          <label className={styles.label}>Thể loại:</label>
          <select
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Chọn thể loại --</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label className={styles.label}>Châm ngôn sống:</label>
          <input
            className={styles.input}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />

          <label className={styles.label}>Peak:</label>
          <input
            className={styles.input}
            value={peak}
            onChange={(e) => setPeak(e.target.value)}
          />

          <label className={styles.label}>
            Đóng vai chính trong các chương:
          </label>
          <Select
            className={styles.select}
            isMulti
            options={allComics}
            value={featuredComics}
            onChange={(opts) => setFeaturedComics(opts)}
            placeholder="Chọn chương..."
          />

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onCancel} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterInfoForm;
