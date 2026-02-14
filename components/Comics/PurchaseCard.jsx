// src/components/ReadStandaloneChapter/PurchaseCard.jsx
import React, { useState } from "react";
import styles from "./ReadStandaloneChapter.module.css";

export default function PurchaseCard({ title, price, userXu, onBuy }) {
  const [confirming, setConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePreConfirm = () => {
    setConfirming(true);
  };

  const handleFinalConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await onBuy(); // gọi hàm mua từ cha
  };

  return (
    <div className={styles.buyOverlay}>
      <h2>Chương Premium</h2>
      <p>
        <strong>Chương:</strong> {title}
      </p>
      <p>
        <strong>Giá:</strong> {price} xu
      </p>
      <p>
        Xu hiện có: <strong>{userXu ?? 0} xu</strong>
      </p>

      {!confirming ? (
        <div className={styles.buttons}>
          <button
            onClick={handlePreConfirm}
            disabled={isProcessing}
            className={styles.buyBtn}
          >
            Mua chương
          </button>
          <button
            onClick={() => (window.location.href = "/shop")}
            disabled={isProcessing}
            className={styles.shopBtn}
          >
            Nạp xu tại Shop
          </button>
        </div>
      ) : (
        <>
          <p className={styles.confirmText}>
            Bạn chắc chắn muốn mua chương <strong>{title}</strong> với giá{" "}
            <strong>{price} xu</strong>?
          </p>
          <div className={styles.buttons}>
            <button
              onClick={() => setConfirming(false)}
              disabled={isProcessing}
            >
              Bỏ qua
            </button>
            <button
              onClick={handleFinalConfirm}
              disabled={isProcessing}
              className={styles.buyBtn}
            >
              {isProcessing ? "Đang xử lý..." : "Đồng ý mua"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
