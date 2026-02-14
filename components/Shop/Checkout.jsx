// src/components/Shop/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.items || !state?.amount) {
      navigate("/");
      return;
    }

    // Tự động tạo payment và redirect
    (async () => {
      try {
        const res = await fetch("https://createpayment-vbqdmzbvka-uc.a.run.app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: state.amount,
            description: "Mua xu trong website",
            returnUrl: `${window.location.origin}/thankyou?orderCode=${state.orderCode || ''}`,
            cancelUrl: `${window.location.origin}/cancel`,
            items: state.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            coupon: state.coupon,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Lỗi tạo payment");
        }
        const { checkoutUrl, orderCode } = await res.json();
        // Lưu orderCode để trang ThankYou xử lý
        sessionStorage.setItem("orderCode", orderCode.toString());
        window.location.href = checkoutUrl;
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [state, navigate]);

  if (loading && !error) {
    return (
      <div className="p-6 text-center">
        <p>Đang chuyển tới cổng thanh toán...</p>
      </div>
    );
  }
}