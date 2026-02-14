// ThankYou.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const ThankYou = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderCode = params.get("orderCode");

  return (
    <div className="thankyou-container">
      <h2>Cảm ơn bạn đã thanh toán!</h2>
      <p>
        Đơn hàng của bạn {orderCode ? `(#${orderCode})` : ""} đã được hoàn
        thành.
      </p>
      <p>Hệ thống sẽ xử lý phần thưởng và cập nhật tài khoản tự động.</p>
    </div>
  );
};

export default ThankYou;
