export function filterCardBeforeSaving(card) {
  const filtered = {
    // === BẮT BUỘC (KHÔNG NÊN TẮT) ===
    ownedCardId: card.ownedCardId, // ID riêng của thẻ sở hữu
    characterId: card.characterId, // Dùng để tìm abilities
    characterName: card.characterName, // Hiển thị tên nhân vật
    stamina: card.stamina, // HP hiện tại
    maxStamina: card.maxStamina,
    stats: card.stats, // Chỉ số nhân vật
    //subjectStats: card.subjectStats, // Chỉ số môn học
    rarity: card.rarity, // Phân loại mạnh/yếu
    //status: card.status, // Trạng thái (active/dead)

    // === CÓ TRONG DB (NÊN GIỮ) ===
    order: card.order, // Dùng để sắp xếp
    avatarUrl: card.avatarUrl, // Avatar hiển thị
    cardImageUrl: card.cardImageUrl, // Ảnh card chính
    attribute: card.attribute, // Nguyên tố
    gameClass: card.cardClass, // ✅ Lớp nhân vật trong trận (Fighter, Tank, ...)
    gender: card.gender, // Nam/Nữ/Khác

    // === PHÁT SINH TRONG GAME - CÓ THỂ BỎ ĐỂ GIẢM DUNG LƯỢNG ===
    // actionGauge: card.actionGauge,         // Thanh hành động
    // actionCount: card.actionCount,         // Số hành động còn lại
    // abilityCooldowns: card.abilityCooldowns, // Cooldown kỹ năng
    // abilities: card.abilities || [],       // Danh sách kỹ năng (không nên lưu nếu đã fetch riêng)
    // buffs: card.buffs,                     // Buff đang có
    // debuffs: card.debuffs,                 // Debuff đang có
    // buffEffects: card.buffEffects,         // Hiệu ứng buff
    // debuffEffects: card.debuffEffects,     // Hiệu ứng debuff
    // baseSpeed: card.baseSpeed,             // Tốc độ cơ bản
    // currentSpeed: card.currentSpeed,       // Tốc độ hiện tại
    // flags: card.flags,                     // Cờ chiếm được
    // respawnCounter: card.respawnCounter,   // Số lượt hồi sinh

    // === DỮ LIỆU DB KHÁC - KHÔNG CẦN LƯU LẠI TRONG ROOMS ===
    // id: card.id,
    // cardTemplateId: card.cardTemplateId,
    // exp: card.exp,
    // quantity: card.quantity,
    // level: card.level,
    // seasonId: card.seasonId,
    // userId: card.userId,
    // createdAt: card.createdAt,
    // acquiredAt: card.acquiredAt,
    // updatedAt: card.updatedAt,
    // random: card.random,
    // maxPerUser: card.maxPerUser,
    // trainHistory: card.trainHistory,
  };

  // ✅ Loại bỏ các field undefined để tránh lỗi Firestore
  Object.keys(filtered).forEach((key) => {
    if (filtered[key] === undefined) delete filtered[key];
  });

  return filtered;
}
