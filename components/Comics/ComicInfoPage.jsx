import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ComicInfoSection from "./ComicInfoSection";

const ComicInfoPage = () => {
  const { slug } = useParams();
  const [comic, setComic] = useState(null);
  const [user, setUser] = useState(null);
  const [userPurchased, setUserPurchased] = useState([]);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const q = query(
          collection(db, "truyens"),
          where("slug", "==", slug),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0];
          setComic({ id: docData.id, ...docData.data() });
        } else {
          console.warn("Không tìm thấy truyện với slug:", slug);
        }
      } catch (err) {
        console.error("Lỗi tải truyện theo slug:", err);
      }
    };

    fetchComic();
  }, [slug]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchPurchases = async () => {
      try {
        const snap = await getDoc(doc(db, "userPurchases", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserPurchased(data?.chapters ? Object.keys(data.chapters) : []);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu mua chương:", err);
      }
    };
    fetchPurchases();
  }, [user]);

  return (
    <div>
      <ComicInfoSection
        comic={comic}
        comicId={comic?.id}
        userPurchasedChapters={userPurchased}
      />
    </div>
  );
};

export default ComicInfoPage;
