// src/Admin/Card/CardManager.jsx

import React, { useState } from "react";
import AdminCreateCard from "./AdminCreateCard";
import CardListAdmin from "./CardListAdmin";
import SeasonManager from "./SeasonManager";
import GachaPackManager from "./GachaPackManager";
import AbilityManager from "./AbilityManager";
import NewCardCreator from "./NewCardCreator";
import ItemManager from "./item/ItemManager"; // ✅ THÊM DÒNG NÀY

import "../Common/TabStyle.css";

const CardManager = () => {
  const [activeTab, setActiveTab] = useState("season");

  const renderTabContent = () => {
    switch (activeTab) {
      case "season":
        return <SeasonManager />;
      case "newcreate":
        return <NewCardCreator />;
      case "gachapack":
        return <GachaPackManager />;
      case "overview":
        return <CardListAdmin />;
      case "ability":
        return <AbilityManager />;
      case "items": // ✅ THÊM DÒNG NÀY
        return <ItemManager />; // ✅ THÊM DÒNG NÀY
      default:
        return <p>Chọn một tab để thao tác</p>;
    }
  };

  return (
    <div className="card-manager">
      <h2>🎴 Quản lý Hệ thống Thẻ (Card Gacha)</h2>
      <div className="tabs">
        <button
          className={activeTab === "season" ? "active" : ""}
          onClick={() => setActiveTab("season")}
        >
          📅 Mùa Gacha
        </button>
        <button
          className={activeTab === "newcreate" ? "active" : ""}
          onClick={() => setActiveTab("newcreate")}
        >
          🆕 Tạo Card Tối giản
        </button>
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          📊 Thống kê / Số lượng
        </button>
        <button
          className={activeTab === "gachapack" ? "active" : ""}
          onClick={() => setActiveTab("gachapack")}
        >
          🎁 Gói Gacha
        </button>
        <button
          className={activeTab === "ability" ? "active" : ""}
          onClick={() => setActiveTab("ability")}
        >
          🧠 Kỹ năng
        </button>
        <button
          className={activeTab === "items" ? "active" : ""} 
          onClick={() => setActiveTab("items")}
        >
          🛡️ Quản lý Items
        </button>
      </div>
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default CardManager;
