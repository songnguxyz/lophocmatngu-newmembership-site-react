// src/components/ReadStandaloneChapter/GiftModal.jsx
import React, { useState } from "react";
import styles from "./ReadStandaloneChapter.module.css";

export default function GiftModal({ onClose, onConfirm, chapterTitle, price }) {
  const [recipient, setRecipient] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handlePreConfirm = () => {
    if (!recipient.trim()) return;
    setConfirming(true);
  };

  const handleFinalConfirm = () => {
    if (isSending) return;
    setIsSending(true);
    onConfirm(recipient.trim());
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!confirming ? (
          <>
            <h3>🎁 Gửi tặng chương</h3>
            <p>
              <strong>Chương:</strong> {chapterTitle}
            </p>
            <p>
              <strong>Giá:</strong> {price} xu
            </p>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Tên người nhận (displayName)"
              className={styles.input}
              disabled={isSending}
            />
            <div className={styles.actions}>
              <button onClick={onClose} disabled={isSending}>
                Hủy
              </button>
              <button
                onClick={handlePreConfirm}
                disabled={!recipient.trim() || isSending}
              >
                Xác nhận
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>Xác nhận gửi tặng?</h4>
            <p>
              Bạn chắc chắn muốn gửi chương <strong>{chapterTitle}</strong> tới{" "}
              <strong>{recipient}</strong> với giá <strong>{price} xu</strong>?
            </p>
            <div className={styles.actions}>
              <button onClick={onClose} disabled={isSending}>
                Bỏ qua
              </button>
              <button onClick={handleFinalConfirm} disabled={isSending}>
                {isSending ? "Đang gửi…" : "Đồng ý"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
