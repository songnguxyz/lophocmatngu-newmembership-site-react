// src/components/Admin/ShopProductManager.jsx
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import "./ShopProductManager.css"; // Tạo file CSS riêng

const ShopProductManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    type: "xu", // Mặc định là 'xu'
    data: { xu: 0 },
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "shopProducts"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(productsData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddProduct = async () => {
    try {
      await addDoc(collection(db, "shopProducts"), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        type: newProduct.type,
        data: { xu: parseInt(newProduct.data.xu) },
      });
      setNewProduct({ name: "", price: 0, type: "xu", data: { xu: 0 } });
    } catch (error) {
      setError(error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      await updateDoc(doc(db, "shopProducts", id), updatedProduct);
      setEditingProduct(null);
    } catch (error) {
      setError(error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "shopProducts", id));
    } catch (error) {
      setError(error);
    }
  };

  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  return (
    <div>
      <h2>Quản lý Sản Phẩm</h2>
      {/* Form thêm sản phẩm */}
      <div>
        <h3>Thêm Sản Phẩm Mới</h3>
        <input
          type="text"
          name="name"
          placeholder="Tên sản phẩm"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Giá (VND)"
          value={newProduct.price}
          onChange={handleInputChange}
        />
        <select
          name="type"
          value={newProduct.type}
          onChange={handleInputChange}
        >
          <option value="xu">Xu</option>
        </select>
        {newProduct.type === "xu" && (
          <input
            type="number"
            name="xu"
            placeholder="Số lượng Xu"
            value={newProduct.data.xu}
            onChange={(e) =>
              setNewProduct((prevState) => ({
                ...prevState,
                data: { xu: parseInt(e.target.value) },
              }))
            }
          />
        )}
        <button onClick={handleAddProduct}>Thêm</button>
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <h3>Danh Sách Sản Phẩm</h3>
        {products.map((product) => (
          <div key={product.id}>
            {editingProduct && editingProduct.id === product.id ? (
              <>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
                <button
                  onClick={() =>
                    handleUpdateProduct(product.id, editingProduct)
                  }
                >
                  Lưu
                </button>
                <button onClick={() => setEditingProduct(null)}>Hủy</button>
              </>
            ) : (
              <>
                {product.name} - {product.price} VND
                <button onClick={() => handleEditProduct(product)}>Sửa</button>
                <button onClick={() => handleDeleteProduct(product.id)}>
                  Xóa
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopProductManager;
