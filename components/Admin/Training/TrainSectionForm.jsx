import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

const statList = [
  "Sức mạnh",
  "Nhanh nhẹn",
  "Khéo léo",
  "Bền bỉ",
  "May mắn",
  "Trí lực",
  "Uy tín",
];

const subjectOrder = [
  "Thể dục",
  "Logic",
  "Khoa học",
  "Xã hội",
  "Sáng tạo",
  "Nghệ thuật",
  "Trưởng thành",
];

const TrainSectionForm = ({ initialData = null, onDone = () => {} }) => {
  const isEdit = !!initialData;

  const [name, setName] = useState("");
  const [subject, setSubject] = useState(subjectOrder[0]);
  const [priorityStats, setPriorityStats] = useState([]);
  const [baseExp, setBaseExp] = useState(20);
  const [statThreshold, setStatThreshold] = useState(5);
  const [bonusPerStat, setBonusPerStat] = useState(0.1);
  const [subjectThreshold, setSubjectThreshold] = useState(3);
  const [subjectBonusMultiplier, setSubjectBonusMultiplier] = useState(0.2);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSubject(initialData.subject);
      setPriorityStats(initialData.priorityStats || []);
      setBaseExp(initialData.baseExp);
      setStatThreshold(initialData.statThreshold);
      setBonusPerStat(initialData.bonusPerStat);
      setSubjectThreshold(initialData.subjectThreshold);
      setSubjectBonusMultiplier(initialData.subjectBonusMultiplier);
    }
  }, [initialData]);

  const toggleStat = (stat) => {
    if (priorityStats.includes(stat)) {
      setPriorityStats(priorityStats.filter((s) => s !== stat));
    } else if (priorityStats.length < 3) {
      setPriorityStats([...priorityStats, stat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateDoc(doc(db, "trainAreas", initialData.id), {
          name,
          subject,
          priorityStats,
          baseExp,
          statThreshold,
          bonusPerStat,
          subjectThreshold,
          subjectBonusMultiplier,
        });
        setSuccessMessage("✅ Đã cập nhật khu vực train!");
      } else {
        await addDoc(collection(db, "trainAreas"), {
          name,
          subject,
          priorityStats,
          baseExp,
          statThreshold,
          bonusPerStat,
          subjectThreshold,
          subjectBonusMultiplier,
          createdAt: new Date(),
        });
        setSuccessMessage("✅ Đã tạo khu vực train thành công!");
      }

      // Reset form nếu không phải edit
      if (!isEdit) {
        setName("");
        setSubject(subjectOrder[0]);
        setPriorityStats([]);
        setBaseExp(20);
        setStatThreshold(5);
        setBonusPerStat(0.1);
        setSubjectThreshold(3);
        setSubjectBonusMultiplier(0.2);
      }

      onDone(); // callback reload danh sách
    } catch (err) {
      console.error("❌ Lỗi khi lưu khu vực train:", err);
      setSuccessMessage("❌ Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        marginTop: 20,
        padding: 16,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3>{isEdit ? "Chỉnh sửa Khu Vực Train" : "Tạo Khu Vực Train"}</h3>

      <label>
        <strong>Tên khu vực:</strong>
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <label>
        <strong>Môn học:</strong>
      </label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      >
        {subjectOrder.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      <label>
        <strong>Chọn 3 chỉ số ưu tiên:</strong>
      </label>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
      >
        {statList.map((stat) => (
          <button
            type="button"
            key={stat}
            onClick={() => toggleStat(stat)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: priorityStats.includes(stat)
                ? "2px solid green"
                : "1px solid #ccc",
              backgroundColor: priorityStats.includes(stat)
                ? "#d4edda"
                : "#f0f0f0",
              cursor: "pointer",
            }}
          >
            {stat}
          </button>
        ))}
      </div>

      <label>
        <strong>EXP Cơ Bản:</strong>
      </label>
      <input
        type="number"
        value={baseExp}
        onChange={(e) => setBaseExp(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>
        <strong>Ngưỡng chỉ số để nhận bonus:</strong>
      </label>
      <input
        type="number"
        value={statThreshold}
        onChange={(e) => setStatThreshold(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>
        <strong>% Bonus EXP cho mỗi chỉ số đạt yêu cầu:</strong>
      </label>
      <input
        type="number"
        step="0.1"
        value={bonusPerStat}
        onChange={(e) => setBonusPerStat(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>
        <strong>Ngưỡng yêu thích môn học:</strong>
      </label>
      <input
        type="number"
        value={subjectThreshold}
        onChange={(e) => setSubjectThreshold(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>
        <strong>% Bonus EXP nếu đạt yêu thích môn học:</strong>
      </label>
      <input
        type="number"
        step="0.1"
        value={subjectBonusMultiplier}
        onChange={(e) => setSubjectBonusMultiplier(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button
        type="submit"
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {isEdit ? "💾 Lưu Thay Đổi" : "✅ Tạo Khu Vực"}
      </button>

      {successMessage && (
        <p
          style={{
            color: successMessage.includes("✅") ? "green" : "red",
            marginTop: 12,
          }}
        >
          {successMessage}
        </p>
      )}
    </form>
  );
};

export default TrainSectionForm;
