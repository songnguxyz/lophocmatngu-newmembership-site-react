import React from "react";
import "./Modal.css";

const Modal = ({ onClose, children }) => {
  const handleOverlayClick = (e) => {
    // Nếu click đúng overlay
    if (e.target === e.currentTarget) {
      const selection = window.getSelection();
      // Nếu không đang bôi đen text thì mới cho đóng
      if (!selection || selection.toString().length === 0) {
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
