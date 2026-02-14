import React, { useState } from "react";
import "./AdminDashboard.css";
import {
  FaHome,
  FaUserFriends,
  FaBook,
  FaComments,
  FaList,
  FaFileAlt,
  FaDice,
  FaShoppingBag,
  FaShoppingCart,
  FaBookOpen
} from "react-icons/fa";
import ManagePages from "./Nav/ManagePages";
import CharacterManager from "./Character/CharacterManager";
import ItemManager from "./Items/ItemManager";
import HeaderManager from "./HeaderFooter/Header-Manager";
import FooterManager from "./HeaderFooter/FooterManager";
import ComicManager from "./Comic/ComicManager";
import ChapterManager from "./Comic/ChapterManager";
import ShopProductManager from "./Shop/ProductManager";
import ShopOrderManager from "./Shop/OrderManager";
import CardManager from "./Card/CardManager";
import TrainManager from "./Training/TrainManager";

const sections = [
  { key: "header", label: "Quản lý Header", icon: <FaHome /> },
  { key: "footer", label: "Quản lý Footer", icon: <FaHome /> },
  { key: "characters", label: "Quản lý Nhân vật", icon: <FaUserFriends /> },
  { key: "comics", label: "Ảnh Bìa", icon: <FaBook /> },
  { key: "Chapter", label: "Quản lý Truyện", icon: <FaBook /> },
  { key: "comments", label: "Quản lý Comment", icon: <FaComments /> },
  { key: "pages", label: "Quản lý Nav", icon: <FaList /> },
  { key: "articles", label: "Quản lý Bài viết", icon: <FaFileAlt /> },
  { key: "boardgame", label: "Quản lý Boardgame", icon: <FaDice /> },
  { key: "sanpham", label: "Quản lý Sản phẩm", icon: <FaShoppingBag /> },
  { key: "cardManager", label: "Quản lý Thẻ", icon: <FaDice /> },
  { key: "trainManager", label: "Quản lý Train", icon: <FaBookOpen /> },
  { key: "shop", label: "Quản lý Sản Phẩm Shop", icon: <FaShoppingCart /> },
  {
    key: "shopOrders",
    label: "Quản lý Đơn Hàng Shop",
    icon: <FaShoppingCart />,
  },
];

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  const renderContent = () => {
    switch (selectedSection) {
      case "header":
        return <HeaderManager />;
      case "footer":
        return <FooterManager />;
      case "pages":
        return <ManagePages />;
      case "characters":
        return <CharacterManager />;
      case "articles":
        return <ItemManager type="articles" />;
      case "boardgame":
        return <ItemManager type="boardgame" />;
      case "sanpham":
        return <ItemManager type="sanpham" />;
      case "comics":
        return <ComicManager />;
      case "Chapter":
        return <ChapterManager />;
      case "shop":
        return <ShopProductManager />;
      case "shopOrders":
        return <ShopOrderManager />;
      case "cardManager":
        return <CardManager />;
      case "trainManager":
        return <TrainManager />;
      default:
        return <p>Hãy chọn một mục quản lý từ menu bên trái.</p>;
    }
  };

  const getSectionLabel = () => {
    const section = sections.find((s) => s.key === selectedSection);
    return section ? section.label : "Chào mừng Admin";
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Quản trị</h2>
        <nav className="menu">
          {sections.map((section) => (
            <button
              key={section.key}
              className={`menu-button ${
                selectedSection === section.key ? "active" : ""
              }`}
              onClick={() => setSelectedSection(section.key)}
            >
              <span className="icon">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        <div className="breadcrumb">{getSectionLabel()}</div>
        <div className="content-wrapper">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
