import React, { useState } from "react";
import Select from "react-select";
import ImageUploader from "../Common/ImageUploader";
import { deleteImageFromUrl } from "../Common/firebaseStorageHelpers";
import "./CharacterFormModal.css";

const CharacterFriendsForm = ({
  characterName,
  allCharacters,
  initialFriends = [],
  onSave,
  onCancel,
}) => {
  const [friends, setFriends] = useState(
    initialFriends.map(f => ({
      value: f.value,
      comment: f.comment || "",
      avatarCommentUrl: f.avatarCommentUrl || "",
    }))
  );
  const [loading, setLoading] = useState(false);

  // Chọn/deselect bạn bè
  const handleFriendChange = selectedOptions => {
    const updated = selectedOptions.map(option => {
      const existing = friends.find(f => f.value === option.value);
      return {
        value: option.value,
        comment: existing ? existing.comment : "",
        avatarCommentUrl: existing ? existing.avatarCommentUrl : "",
      };
    });
    setFriends(updated);
  };

  // Thay đổi comment
  const handleCommentChange = (friendId, newComment) => {
    setFriends(prev =>
      prev.map(f =>
        f.value === friendId ? { ...f, comment: newComment } : f
      )
    );
  };

  // Upload avatarComment thành công
  const handleAvatarUploadSuccess = (friendId, newUrl) => {
    setFriends(prev =>
      prev.map(f => {
        if (f.value === friendId) {
          // nếu đã có ảnh comment cũ, xóa nó
          if (f.avatarCommentUrl) {
            deleteImageFromUrl(f.avatarCommentUrl)
              .then(() => {
                console.log(
                  "Đã xoá avatarComment cũ:",
                  f.avatarCommentUrl
                );
              })
              .catch(err => {
                // ignore 404 not-found, log khác
                if (
                  err.code === "storage/object-not-found" ||
                  err.message?.includes("does not exist")
                ) {
                  console.warn(
                    "Không tìm thấy file cũ, bỏ qua xóa:",
                    f.avatarCommentUrl
                  );
                } else {
                  console.error(
                    "Lỗi khi xoá avatarComment cũ:",
                    err
                  );
                }
              });
          }
          return { ...f, avatarCommentUrl: newUrl };
        }
        return f;
      })
    );
  };

  // Lưu và đóng form
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(friends);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Chỉnh sửa bạn bè của: {characterName}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Danh sách bạn bè của {characterName}:
          </label>
          <Select
            isMulti
            options={allCharacters}
            value={allCharacters.filter(opt =>
              friends.some(f => f.value === opt.value)
            )}
            onChange={handleFriendChange}
          />

          {friends.map(friend => {
            const friendData = allCharacters.find(
              c => c.value === friend.value
            );
            const previewSrc =
              friend.avatarCommentUrl || friendData?.avatarUrl || "";

            return (
              <div
                key={friend.value}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 15,
                  gap: 10,
                }}
              >
                {/* Preview avatarComment hoặc avatar gốc */}
                <img
                  src={previewSrc}
                  alt="avatar"
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 5,
                    flexShrink: 0,
                    marginTop: 8,
                    border: "1px solid #ccc",
                  }}
                  loading="lazy"
                  onError={e => {
                    // nếu load thất bại (broken url), fallback về avatar gốc
                    if (friendData?.avatarUrl) {
                      e.currentTarget.src = friendData.avatarUrl;
                    }
                  }}
                />

                <div style={{ flex: 1 }}>
                  {/* Tên bạn bè */}
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: 4,
                      marginTop: 4,
                    }}
                  >
                    {friendData?.label || "Chưa rõ"}
                  </div>

                  {/* Uploader ảnh bình luận */}
                  <ImageUploader
                    inputId={`avatarCommentUploader-${friend.value}`}
                    folder="friend-avatar-comments"
                    label="Ảnh bình luận"
                    defaultImage={previewSrc}
                    onUploadSuccess={url =>
                      handleAvatarUploadSuccess(friend.value, url)
                    }
                    width={50}
                    height={50}
                  />

                  {/* Textarea bình luận */}
                  <textarea
                    value={friend.comment}
                    onChange={e =>
                      handleCommentChange(friend.value, e.target.value)
                    }
                    rows={2}
                    placeholder="Nhập bình luận..."
                    style={{
                      width: "100%",
                      padding: 5,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      marginTop: 8,
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 20, textAlign: "right" }}>
            <button type="button" onClick={onCancel} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterFriendsForm;
