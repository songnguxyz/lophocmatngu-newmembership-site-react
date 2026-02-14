// Shop.jsx
import React, { useState } from "react";
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase"; // 🔁 chỉnh lại đường dẫn cho đúng dự án của bạn

const Shop = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const amounts = [2000, 10000, 20000, 50000, 100000, 200000];

  const handleBuy = async (amount) => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Bạn cần đăng nhập để thực hiện thanh toán");

      const token = await getIdToken(user);

      const response = await fetch(
        "https://createpayment-vbqdmzbvka-uc.a.run.app", // ✅ chỉnh lại URL cho đúng
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            description: `Noptm test payos ${amount / 100} xu`,
            returnUrl: `${
              window.location.origin
            }/thankyou?orderCode=${Date.now()}`,
            cancelUrl: `${window.location.origin}/cancel`,
            items: [
              {
                name: `${amount / 100} Xu`,
                quantity: 1,
                price: amount,
              },
            ],
            buyerName: user.displayName || "Người dùng",
            buyerEmail: user.email || "unknown@example.com",
            buyerPhone: "0123456789",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Lỗi tạo thanh toán");
      }

      const data = await response.json();

      // ✅ Redirect người dùng tới trang thanh toán
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setMessage(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-container">
      <h2>Mua Xu</h2>
      {amounts.map((amount) => (
        <button
          key={amount}
          disabled={loading}
          onClick={() => handleBuy(amount)}
          style={{ margin: "10px", padding: "10px 20px" }}
        >
          Mua {amount / 100} xu - với giá {amount.toLocaleString()}₫
        </button>
      ))}
      {loading && <p>Đang xử lý...</p>}
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default Shop;
