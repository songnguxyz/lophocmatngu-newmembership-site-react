import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import TrainSectionForm from "./TrainSectionForm";

const tabs = [
  { key: "trainSectionForm", label: "Tạo / Chỉnh sửa Khu Vực Train" },
];

const TrainManager = () => {
  const [selectedTab, setSelectedTab] = useState("trainSectionForm");
  const [trainAreas, setTrainAreas] = useState([]);
  const [editingArea, setEditingArea] = useState(null);

  const fetchTrainAreas = async () => {
    const querySnapshot = await getDocs(collection(db, "trainAreas"));
    const areas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTrainAreas(areas);
  };

  useEffect(() => {
    fetchTrainAreas();
  }, []);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "trainSectionForm":
        return (
          <TrainSectionForm
            initialData={editingArea}
            onDone={() => {
              setEditingArea(null);
              fetchTrainAreas();
            }}
          />
        );
      default:
        return <div>Chọn một tab để bắt đầu</div>;
    }
  };

  return (
    <div className="train-manager" style={{ padding: 20 }}>
      <h2>Quản lý Khu Vực Train</h2>

      <div className="tab-buttons" style={{ marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${selectedTab === tab.key ? "active" : ""}`}
            onClick={() => setSelectedTab(tab.key)}
            style={{
              marginRight: 8,
              padding: "8px 16px",
              backgroundColor: selectedTab === tab.key ? "#007bff" : "#eee",
              color: selectedTab === tab.key ? "#fff" : "#000",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">{renderTabContent()}</div>

      <h3 style={{ marginTop: 32 }}>Danh sách Khu Vực Train</h3>
      <ul style={{ paddingLeft: 0 }}>
        {trainAreas.map((area) => (
          <li key={area.id} style={{ marginBottom: 16, listStyle: "none" }}>
            <strong>{area.name}</strong> – {area.subject}
            <br />
            <button
              onClick={() => setEditingArea(area)}
              style={{
                marginRight: 8,
                padding: "4px 10px",
                backgroundColor: "#ffc107",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              ✏️ Sửa
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Bạn có chắc chắn muốn xóa khu vực này?")) {
                  await deleteDoc(doc(db, "trainAreas", area.id));
                  fetchTrainAreas();
                }
              }}
              style={{
                padding: "4px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              🗑️ Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrainManager;
