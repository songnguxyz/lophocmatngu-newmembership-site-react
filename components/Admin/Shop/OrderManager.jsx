// src/components/Admin/ShopOrderManager.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  increment,
} from "firebase/firestore"; // Sửa dòng này
import "./ShopOrderManager.css";

const ShopOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("pending"); // Trạng thái mặc định
  const statuses = ["pending", "confirmed", "expired"];

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        let q = query(
          collection(db, "pendingOrders"),
          orderBy("createdAt", "desc") // Sắp xếp theo thời gian tạo
        );
        if (selectedStatus !== "all") {
          q = query(
            collection(db, "pendingOrders"),
            where("status", "==", selectedStatus),
            orderBy("createdAt", "desc")
          );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    loadOrders();
  }, [selectedStatus]);

  const handleConfirmOrder = async (orderId, userId, productId) => {
    try {
      // 1. Cập nhật trạng thái đơn hàng
      const orderRef = doc(db, "pendingOrders", orderId);
      await updateDoc(orderRef, { status: "confirmed" });

      // 2. Lấy thông tin sản phẩm
      const productRef = doc(db, "shopProducts", productId);
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const productData = productDoc.data();

        // 3. Cộng xu vào tài khoản người dùng
        if (productData.type === "xu") {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, { xu: increment(productData.data.xu) });
        }
        alert("Đã xác nhận đơn hàng và cộng xu thành công!");
      } else {
        alert("Không tìm thấy thông tin sản phẩm!");
      }
    } catch (error) {
      setError(error);
      alert(`Lỗi xác nhận đơn hàng: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  return (
    <div>
      <h2>Quản lý Đơn Hàng</h2>

      {/* Bộ lọc trạng thái */}
      <div>
        <label>Trạng thái: </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Tất cả</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách đơn hàng */}
      {orders.map((order) => (
        <div key={order.id} className="order-item">
          <p>Mã đơn hàng: {order.orderCode}</p>
          <p>Người dùng: {order.userEmail}</p>
          <p>Sản phẩm: {order.productName}</p>
          <p>Số tiền: {order.amount.toLocaleString()} VND</p>
          <p>Trạng thái: {order.status}</p>
          {order.status === "pending" && (
            <button
              onClick={() =>
                handleConfirmOrder(order.id, order.userId, order.productId)
              }
            >
              Xác nhận đơn
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShopOrderManager;
