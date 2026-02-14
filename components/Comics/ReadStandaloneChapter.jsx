// src/components/ReadStandaloneChapter/ReadStandaloneChapter.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { auth, db, onAuthStateChanged } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  updateDoc
} from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import styles from "./ReadStandaloneChapter.module.css";
import PurchaseCard from "./PurchaseCard";
import GiftModal from "./GiftModal";
import {
  faList,
  faArrowLeft,
  faArrowRight,
  faSun,
  faMoon,
  faThLarge,
  faStream,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ScrollToTopButton from "../Shared/ScrollToTopButton";

const PREMIUM_PRICE = 20;
const CHECK_URL = "https://checkuserpurchase-vbqdmzbvka-uc.a.run.app";
const PURCHASE_URL = "https://purchasechapter-vbqdmzbvka-uc.a.run.app";

export default function ReadStandaloneChapter() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const [user, setUser] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewCarousel, setViewCarousel] = useState(false);
  const [showPreferencePopup, setShowPreferencePopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showBuyPrompt, setShowBuyPrompt] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const location = useLocation();
  const allowedChapters = location.state?.allowedChapters || null;


  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setShowPreferencePopup(true);
    });
  }, []);

  const [userData, setUserData] = useState(null);
  const [chapterImages, setChapterImages] = useState([]);
  const updateViewMode = async (mode) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        viewMode: mode,
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật viewMode:", err);
    }
  };


  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          if (data.viewMode === "carousel") {
            setViewCarousel(true);
          } else if (data.viewMode === "scroll") {
            setViewCarousel(false);
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu người dùng Firestore:", err);
      }
    };
    fetchUserData();
  }, [user]);
  

  useEffect(() => {
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "chapters"),
          where("approved", "==", true),
          orderBy("order", "asc")
        )
      );
      let fullList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (allowedChapters) {
        fullList = fullList.filter((c) => allowedChapters.includes(c.id));
      }

      setChaptersList(fullList);
    })();
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setIsPurchased(false);
    setShowBuyPrompt(false);
    setCurrentIndex(0);

    (async () => {
      const snap = await getDocs(
        query(collection(db, "chapters"), where("slug", "==", slug))
      );
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        setCurrentChapter(data);
        
        // Fetch chapter images from chapterContent
        try {
          const contentSnap = await getDoc(
            doc(db, "chapterContent", docSnap.id)
          );
          if (contentSnap.exists()) {
            setChapterImages(contentSnap.data().images || []);
            setRequiresLogin(false);
          } else {
            setChapterImages([]);
            setRequiresLogin(false); // không có nội dung thì không cảnh báo
          }
        } catch (err) {
          console.error("Lỗi khi lấy chapterContent:", err);
          // Nếu lỗi liên quan đến quyền (PERMISSION_DENIED), thường là do chưa đăng nhập
          if (err.code === "permission-denied") {
            setRequiresLogin(true);
          }
          setChapterImages([]);
        }
        

        if (data.isPremium) {
          if (!user) {
            setShowBuyPrompt(true);
          } else {
            try {
              const token = await user.getIdToken();
              const resp = await fetch(CHECK_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chapterId: docSnap.id }),
              });
              const { purchased } = await resp.json();
              if (purchased) setIsPurchased(true);
              else setShowBuyPrompt(true);
            } catch (err) {
              console.error("checkUserPurchase error:", err);
              setShowBuyPrompt(true);
            }
          }
        } else {
          setIsPurchased(true);
        }
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const handleBuyChapter = async (giftUid) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const token = await user.getIdToken();
      const body = { chapterId: currentChapter.id, price: PREMIUM_PRICE };
      if (giftUid) body.giftUid = giftUid;
      const resp = await fetch(PURCHASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (resp.status === 412) {
        alert("Bạn chưa đủ xu. Chuyển tới Shop để nạp thêm.");
        navigate("/shop");
        return;
      }
      if (resp.status === 404) {
        alert("Người dùng không tồn tại. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }
      if (resp.status === 400) {
        const { error } = await resp.json().catch(() => ({}));
        alert(error || "Yêu cầu không hợp lệ.");
        return;
      }
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        console.error("purchaseChapter failed:", resp.status, errBody);
        alert(errBody.error || "Mua chương thất bại, thử lại sau.");
        return;
      }

      if (!giftUid || giftUid === user.uid) {
        setIsPurchased(true);
      }

      setShowBuyPrompt(false);
      setShowGiftModal(false);
      alert("Cảm ơn bạn đã mua truyện, chúc bạn đọc truyện vui vẻ.");
    } catch (err) {
      console.error("purchaseChapter error:", err);
      alert("Không thể kết nối. Vui lòng kiểm tra mạng.");
    }
  };

  const goToPage = useCallback(
    (i) => {
      const max = chapterImages.length - 1;
      setCurrentIndex(Math.min(Math.max(i, 0), max));
    },
    [chapterImages]
  );
  

  useEffect(() => {
    if (viewCarousel && imgRef.current) {
      imgRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentIndex, viewCarousel]);

  const handlers = useSwipeable({
    onSwipedLeft: () => goToPage(currentIndex + 1),
    onSwipedRight: () => goToPage(currentIndex - 1),
    trackMouse: true,
  });

  if (loading || !currentChapter) {
    return <div className={styles.loading}>Đang tải chương…</div>;
  }

  if (requiresLogin) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Bạn cần đăng nhập để đọc chương này.</h2>
        <p>
          Vui lòng <Link to="/login">đăng nhập</Link> để tiếp tục đọc truyện.
        </p>
      </div>
    );
  }
  if (currentChapter.isPremium && !isPurchased && showBuyPrompt) {
    return (
      <>
        <PurchaseCard
          title={currentChapter.title}
          price={PREMIUM_PRICE}
          userXu={userData?.xu}
          onBuy={() => handleBuyChapter()}
          onGift={() => setShowGiftModal(true)}
        />
        {showGiftModal && (
          <GiftModal
            onClose={() => setShowGiftModal(false)}
            onConfirm={(uid) => handleBuyChapter(uid)}
          />
        )}
      </>
    );
  }

  const slugs = chaptersList.map((c) => c.slug);
  const idx = slugs.indexOf(slug);
  const goBySlug = (slug) => navigate(`/read-chapter/${slug}`);

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      {showPreferencePopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <h3>Bạn muốn đọc theo phong cách nào?</h3>
            <div className={styles.popupButtons}>
              <button
                onClick={() => {
                  setViewCarousel(false);
                  updateViewMode("scroll");
                  setShowPreferencePopup(false);
                }}
                className={styles.optionBtn}
              >
                📜 Cuộn webtoon
              </button>
              <button
                onClick={() => {
                  setViewCarousel(true);
                  updateViewMode("carousel");
                  setShowPreferencePopup(false);
                }}
                className={styles.optionBtn}
              >
                📖 Carousel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.topNav}>
        <select
          value={slug}
          onChange={(e) => goBySlug(e.target.value)}
          className={styles.chapterSelect}
        >
          {chaptersList.map((c) => {
            const isCurrent = c.slug === slug;
            let label = "";
            if (isCurrent && isPurchased && c.isPremium) label = " (Đã mua)";
            else if (c.isPremium) label = " (Premium)";
            return (
              <option key={c.slug} value={c.slug}>
                {c.title}
                {label}
              </option>
            );
          })}
        </select>
        <button
          onClick={() => navigate("/comics")}
          className={styles.navBtn}
          title="Danh sách truyện"
        >
          <FontAwesomeIcon icon={faList} />
        </button>
        <button
          onClick={() => idx > 0 && goBySlug(slugs[idx - 1])}
          disabled={idx <= 0}
          className={styles.navBtn}
          title="Chương trước"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          onClick={() => idx < slugs.length - 1 && goBySlug(slugs[idx + 1])}
          disabled={idx >= slugs.length - 1}
          className={styles.navBtn}
          title="Chương sau"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <button
          onClick={() => {
            const newMode = !viewCarousel;
            setViewCarousel(newMode);
            updateViewMode(newMode ? "carousel" : "scroll");
          }}
          className={`${styles.navBtn} ${viewCarousel ? styles.active : ""}`}
          title={viewCarousel ? "Cuộn" : "Carousel"}
        >
         {viewCarousel ? "📜" : "📖"}
        </button>
        <button
          onClick={() => setDarkMode((d) => !d)}
          className={styles.navBtn}
          title={darkMode ? "Sáng" : "Tối"}
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>

        {currentChapter.isPremium && (
          <button
            onClick={() => setShowGiftModal(true)}
            className={styles.navBtn}
            title="Gửi tặng chương này"
          >
            🎁
          </button>
        )}
      </div>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className={styles.title}>
          {currentChapter.title}
          {isPurchased && currentChapter.isPremium && (
            <span className={styles.purchasedLabel}> (Đã mua)</span>
          )}
        </h1>
      </motion.div>

      {viewCarousel ? (
        <div {...handlers} className={styles.carouselContainer}>
          <motion.img
            ref={imgRef}
            key={`img-${currentIndex}`}
            src={chapterImages[currentIndex]}
            alt={`Trang ${currentIndex + 1}`}
            className={styles.carouselImage}
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Nút chuyển trang nằm dưới ảnh, căn giữa */}
          <div className={styles.carouselButtonsWrapper}>
            <button
              onClick={() => goToPage(currentIndex - 1)}
              disabled={currentIndex <= 0}
              className={styles.circleBtn}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              onClick={() => goToPage(currentIndex + 1)}
              disabled={currentIndex >= chapterImages.length - 1}
              className={styles.circleBtn}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.pagesContainer}>
          {chapterImages.map((url, i) => (
            <motion.img
              key={i}
              src={url}
              alt={`Trang ${i + 1}`}
              className={styles.pageImage}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      <ScrollToTopButton />

      {showGiftModal && (
        <GiftModal
          chapterTitle={currentChapter.title}
          price={PREMIUM_PRICE}
          onClose={() => setShowGiftModal(false)}
          onConfirm={(uid) => handleBuyChapter(uid)}
        />
      )}
    </div>
  );
}
//code đang chạy ngon. mai làm tiếp phần 2 button trái phải