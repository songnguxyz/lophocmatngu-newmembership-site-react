import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const globalImageCache = new Map(); // giữ cache trong toàn app

const usePreloadTemplateImages = (selectedPack) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!selectedPack?.seasonId || !selectedPack?.rates) return;

    const preload = async () => {
      try {
        const rarityList = Object.keys(selectedPack.rates).filter(
          (rarity) => selectedPack.rates[rarity] > 0
        );

        const q = query(
          collection(db, "cards"),
          where("seasonId", "==", selectedPack.seasonId),
          where("rarity", "in", rarityList)
        );

        const snap = await getDocs(q);
        const urls = snap.docs.flatMap((doc) => {
          const data = doc.data();
          return [data.cardImageUrl, data.avatarUrl].filter(Boolean);
        });

        let loadedCount = 0;
        const total = urls.length;

        urls.forEach((url) => {
          if (globalImageCache.has(url)) {
            loadedCount++;
            if (loadedCount === total) setLoaded(true);
            return;
          }

          const img = new Image();
          img.src = url;
          img.onload = img.onerror = () => {
            globalImageCache.set(url, true); // Đánh dấu là đã preload
            loadedCount++;
            if (loadedCount === total) {
              setLoaded(true);
            }
          };

          // Thêm DOM ẩn để giữ lại cache (tránh bị flush)
          const hidden = document.createElement("img");
          hidden.src = url;
          hidden.style.display = "none";
          hidden.loading = "eager";
          document.body.appendChild(hidden);
        });

        if (urls.length === 0) setLoaded(true);
      } catch (err) {
        console.error("🔥 Lỗi preload ảnh:", err);
        setLoaded(true);
      }
    };

    preload();
  }, [selectedPack]);

  return loaded;
};

export default usePreloadTemplateImages;
