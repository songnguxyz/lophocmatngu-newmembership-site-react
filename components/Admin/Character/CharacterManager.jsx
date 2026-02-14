import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";
import CharacterList from "./CharacterList";
import CharacterInfoForm from "./CharacterInfoForm";
import CharacterFriendsForm from "./CharacterFriendsForm";
import CharacterAlbumForm from "./CharacterAlbumForm";
import CharacterInventoryForm from "./CharacterInventoryForm";
import CharacterCategoryManager from "./CharacterCategoryManager";
import NhanvatStatsEditor from "./NhanvatStatsEditor";
import NhanvatSubjectStatsEditor from "./NhanvatSubjectStatsEditor";
import SimpleCharacterCreateForm from "./SimpleCharacterCreateForm";
import ThemeForm from "./ThemeForm";
import {
  FaPlus,
  FaTags,
  FaUserFriends,
  FaImages,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "./CharacterManager.css";


const CharacterManager = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [allCharacters, setAllCharacters] = useState([]);
  const [activeTab, setActiveTab] = useState("characters");
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showFriendForm, setShowFriendForm] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [album, setAlbum] = useState([]);
  const [newAlbumImages, setNewAlbumImages] = useState([]);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showThemeForm, setShowThemeForm] = useState(false); 

  const fetchAllCharacters = async () => {
    const snapshot = await getDocs(
      query(collection(db, "characters"), orderBy("order", "asc"))
    );
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCharacters(data);
    const options = data.map((c) => ({
      value: c.id,
      label: `${c.name} (${
        c.gender === "male" ? "Nam" : c.gender === "female" ? "Nữ" : "Khác"
      })`,
      avatarUrl: c.avatarUrl || "",
    }));
    setAllCharacters(options);
  };

  const fetchCharacterById = async (id) => {
    const docRef = doc(db, "characters", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return { id, ...docSnap.data() };
    else throw new Error("Không tìm thấy nhân vật");
  };

  useEffect(() => {
    fetchAllCharacters();
  }, []);

  const handleApprove = async (id, approved) => {
    await updateDoc(doc(db, "characters", id), { approved: !approved });
    alert(`Nhân vật đã được ${approved ? "hủy duyệt" : "duyệt"}!`);
    fetchAllCharacters();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân vật này?")) {
      await deleteDoc(doc(db, "characters", id));
      alert("Đã xóa!");
      fetchAllCharacters();
    }
  };

  const handleMoveUp = async (id) => {
    const docRef = doc(db, "characters", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const order = snap.data().order;
      const q = query(
        collection(db, "characters"),
        where("order", "<", order),
        orderBy("order", "desc"),
        limit(1)
      );
      const prev = await getDocs(q);
      if (!prev.empty) {
        const other = prev.docs[0];
        await updateDoc(docRef, { order: other.data().order });
        await updateDoc(doc(db, "characters", other.id), { order });
        fetchAllCharacters();
      } else alert("Không có nhân vật phía trên");
    }
  };

  const handleMoveDown = async (id) => {
    const docRef = doc(db, "characters", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const order = snap.data().order;
      const q = query(
        collection(db, "characters"),
        where("order", ">", order),
        orderBy("order", "asc"),
        limit(1)
      );
      const next = await getDocs(q);
      if (!next.empty) {
        const other = next.docs[0];
        await updateDoc(docRef, { order: other.data().order });
        await updateDoc(doc(db, "characters", other.id), { order });
        fetchAllCharacters();
      } else alert("Không có nhân vật phía dưới");
    }
  };

  const openThemePopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowThemeForm(true);
    // Ẩn tất cả form khác
    setShowInfoForm(false);
    setShowFriendForm(false);
    setShowAlbumForm(false);
    setShowInventoryForm(false);
    setShowStatsForm(false);
    setShowSubjectForm(false);
  };

  const openInfoPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowInfoForm(true);
    setShowFriendForm(false);
    setShowAlbumForm(false);
    setShowCreateForm(false);
  };

  const openFriendPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowFriendForm(true);
    setShowInfoForm(false);
    setShowAlbumForm(false);
    setShowCreateForm(false);
  };

  const openAlbumPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setAlbum(fresh.album || []);
    setNewAlbumImages([]);
    setShowAlbumForm(true);
    setShowFriendForm(false);
    setShowInfoForm(false);
    setShowCreateForm(false);
  };

  const openInventoryPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowInventoryForm(true);
    setShowFriendForm(false);
    setShowAlbumForm(false);
    setShowInfoForm(false);
    setShowCreateForm(false);
    setShowStatsForm(false);
  };

  const openStatsPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowStatsForm(true);
    setShowInfoForm(false);
    setShowFriendForm(false);
    setShowAlbumForm(false);
    setShowCreateForm(false);
  };

  const openSubjectStatsPopup = async (character) => {
    const fresh = await fetchCharacterById(character.id);
    setSelectedCharacter(fresh);
    setShowSubjectForm(true);
    setShowInfoForm(false);
    setShowFriendForm(false);
    setShowAlbumForm(false);
    setShowInventoryForm(false);
    setShowStatsForm(false);
  };

  return (
    <div className="character-manager">
      <div className="tabs">
        <button
          className={activeTab === "characters" ? "active" : ""}
          onClick={() => setActiveTab("characters")}
        >
          {" "}
          <FaPlus /> Quản lý Nhân vật{" "}
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          {" "}
          <FaTags /> Quản lý Thể loại{" "}
        </button>
        <button className="create-btn" onClick={() => setShowCreateForm(true)}>
          ➕ Tạo mới
        </button>
      </div>

      {activeTab === "characters" && (
        <CharacterList
          characters={characters}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onEdit={openInfoPopup}
          renderExtraButtons={(character) => (
            <>
              <button onClick={() => openThemePopup(character)}>
                🎨 Theme +{" "}
              </button>
              <button onClick={() => openInfoPopup(character)}>
                <FaEdit /> Thông tin
              </button>
              <button onClick={() => openFriendPopup(character)}>
                <FaUserFriends /> Bạn bè
              </button>
              <button onClick={() => openAlbumPopup(character)}>
                <FaImages /> Album
              </button>
              <button onClick={() => openInventoryPopup(character)}>
                🧳 Inventory
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openStatsPopup(character);
                }}
              >
                Chỉ số
              </button>
              <button onClick={() => openSubjectStatsPopup(character)}>
                Môn học
              </button>
            </>
          )}
        />
      )}

      {activeTab === "categories" && <CharacterCategoryManager />}

      {/* Popups */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <SimpleCharacterCreateForm
              onCreated={() => {
                setShowCreateForm(false);
                fetchAllCharacters();
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {showInfoForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <CharacterInfoForm
              character={selectedCharacter}
              onSave={async (updatedData) => {
                try {
                  const docRef = doc(db, "characters", selectedCharacter.id);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                    const currentData = docSnap.data();
                    const mergedData = { ...currentData, ...updatedData };
                    await updateDoc(docRef, mergedData);
                    alert("Nhân vật đã được cập nhật!");
                    setShowInfoForm(false);
                    fetchAllCharacters();
                  } else {
                    alert("Không tìm thấy nhân vật trong database.");
                  }
                } catch (error) {
                  console.error("Lỗi khi cập nhật nhân vật:", error);
                  alert("Đã xảy ra lỗi khi cập nhật.");
                }
              }}
              onCancel={() => setShowInfoForm(false)}
            />
          </div>
        </div>
      )}

      {showFriendForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <NhanvatStatsEditor
              character={selectedCharacter}
              onUpdate={(newStats) =>
                setSelectedCharacter({ ...selectedCharacter, stats: newStats })
              }
            />
            <CharacterFriendsForm
              characterName={selectedCharacter.name}
              allCharacters={allCharacters}
              initialFriends={selectedCharacter.friends || []}
              onSave={async (updatedFriends) => {
                try {
                  const docRef = doc(db, "characters", selectedCharacter.id);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                    const currentData = docSnap.data();
                    const mergedData = {
                      ...currentData,
                      friends: updatedFriends,
                    };
                    await updateDoc(docRef, mergedData);
                    alert("Cập nhật bạn bè thành công!");
                    setShowFriendForm(false);
                    fetchAllCharacters();
                  } else {
                    alert("Không tìm thấy nhân vật.");
                  }
                } catch (error) {
                  console.error("Lỗi khi cập nhật bạn bè:", error);
                  alert("Đã xảy ra lỗi khi cập nhật bạn bè.");
                }
              }}
              onCancel={() => setShowFriendForm(false)}
            />
          </div>
        </div>
      )}

      {showAlbumForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <CharacterAlbumForm
              characterName={selectedCharacter.name}
              album={album}
              setAlbum={setAlbum}
              newAlbumImages={newAlbumImages}
              setNewAlbumImages={setNewAlbumImages}
              characterId={selectedCharacter.id}
              onClose={() => setShowAlbumForm(false)}
            />
          </div>
        </div>
      )}
      {showInventoryForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <CharacterInventoryForm
              characterName={selectedCharacter.name}
              inventory={selectedCharacter.inventory || []} // ✅ fallback sang []
              characterId={selectedCharacter.id}
              onClose={() => setShowInventoryForm(false)}
            />
          </div>
        </div>
      )}
      {showStatsForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <NhanvatStatsEditor
              character={selectedCharacter}
              onClose={() => setShowStatsForm(false)}
              onUpdate={(updatedStats) =>
                setSelectedCharacter({
                  ...selectedCharacter,
                  stats: updatedStats,
                })
              }
            />
          </div>
        </div>
      )}
      {showSubjectForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <NhanvatSubjectStatsEditor
              character={selectedCharacter}
              onUpdate={(updatedStats) =>
                setSelectedCharacter({
                  ...selectedCharacter,
                  subjectStats: updatedStats,
                })
              }
              onClose={() => setShowSubjectForm(false)}
            />
          </div>
        </div>
      )}
      {showThemeForm && selectedCharacter && (
        <div className="modal-overlay">
          <div className="modal-box">
            <ThemeForm            
              theme={selectedCharacter.theme || {}}
              posterUrl={selectedCharacter.posterUrl || ""}
              onSave={async (newTheme) => {
                try {
                  const ref = doc(db, "characters", selectedCharacter.id);
                  const snap = await getDoc(ref);
                  if (!snap.exists()) throw new Error("Không tìm thấy");
                  const data = snap.data();
                  await updateDoc(ref, { ...data, theme: newTheme });
                  alert("🎨 Theme đã được lưu!");
                  setShowThemeForm(false);
                  fetchAllCharacters();
                } catch (err) {
                  console.error("Lỗi lưu theme:", err);
                  alert("Lỗi khi lưu theme.");
                }
              }}
              onCancel={() => {
                setShowThemeForm(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;
