// src/components/Item/ItemDetail.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import ItemDetailContent from "./ItemDetailContent";
import ItemSummary from "./ItemSummary";
import styles from "./Item.module.css";

const ItemDetail = ({ type }) => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollToTopRef = useRef(null);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      setError(null);

      // Thay đổi dòng này
      const collectionName = type === "articles" ? "home" : type;

      try {
        const itemRef = doc(db, collectionName, itemId); // Sử dụng collectionName
        const itemDoc = await getDoc(itemRef);

        if (itemDoc.exists()) {
          setItem({ id: itemDoc.id, ...itemDoc.data(), type });
        } else {
          setError(`Không tìm thấy ${type}.`);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    const loadOtherItems = async () => {
      // Thay đổi dòng này
      const collectionName = type === "articles" ? "home" : type;

      try {
        const approvedQuery = query(
          collection(db, collectionName), // Sử dụng collectionName
          where("approved", "==", true),
          orderBy("order", "desc")
        );

        const unsubscribeSnapshot = onSnapshot(
          approvedQuery,
          (snapshot) => {
            const itemsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              type,
            }));
            setItems(itemsData.filter((bg) => bg.id !== itemId));
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error("Lỗi khi lắng nghe snapshot:", err);
          }
        );

        return () => {
          unsubscribeSnapshot();
        };
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error(`Lỗi khi tải ${type}:`, e);
      }
    };

    loadItem();
    loadOtherItems();
  }, [itemId, type]);

  if (loading) {
    return <div>Đang tải {type}...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  if (!item) {
    return <div>Không tìm thấy {type}.</div>;
  }
  // Thêm object này
  const typeLabels = {
    articles: "bài viết",
    boardgame: "boardgame",
    sanpham: "sản phẩm",
  };

  //Đưa dòng này lên trên
  const otherItemsLabel = `Các nội dung khác`;

  return (
    <div className={styles["items-container"]}>
      {/* Xóa dòng này */}
      {/* <h2>Chi tiết {type}</h2> */}
      <div ref={scrollToTopRef} />
      <ItemDetailContent item={item} />
      <h2>{otherItemsLabel}</h2> {/* Sử dụng otherItemsLabel */}
      <div className={styles["other-items-container"]}>
        <div className={styles["item-list"]}>
          {items.map((otherItem) => (
            <div key={otherItem.id}>
              <ItemSummary item={otherItem} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
