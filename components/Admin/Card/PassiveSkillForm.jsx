// --- PassiveSkillForm.jsx ---
import React from "react";
import styles from "./AbilityManager.module.css";

const triggerTypes = [
  { value: "onTurnStart", label: "Bắt đầu lượt (onTurnStart)-ok"},
  { value: "onTurnEnd", label: "Kết thúc lượt (onTurnEnd)-ok" },
  { value: "onTakeDamage", label: "Khi nhận sát thương (onTakeDamage) -ok" },
  { value: "onKillEnemy", label: "Khi hạ gục địch (onKillEnemy)-ok" },
  { value: "afterNDuels", label: "Sau N lần đấu tay đôi (afterNDuels)-ok" },
  {
    value: "onUseSpecificSkill",
    label: "Khi dùng kỹ năng cụ thể (onUseSpecificSkill)",
  },
  { value: "onSkillUse", label: "Khi dùng kỹ năng bất kỳ (onSkillUse)" },
  { value: "staminaLow", label: "Khi (staminaLow) -ok" },
  {
    value: "onAllyDefeated",
    label: "Khi đồng minh bị hạ gục (onAllyDefeated)-ok",
  },
  {
    value: "onAllyTakeDamage",
    label: "Khi đồng minh nhận damage (onAllyTakeDamage)",
  },
  { value: "onAllyAttack", label: "Khi đồng minh tấn công (onAllyAttack)" },
  {
    value: "onAllyUseSkill",
    label: "Khi đồng minh dùng kỹ năng (onAllyUseSkill)",
  },
  {
    value: "onEnemyUseSkill",
    label: "Khi địch dùng kỹ năng (onEnemyUseSkill)",
  },
  {
    value: "onEnemyCountBelowX",
    label: "Khi số lượng địch dưới X (onEnemyCountBelowX)",
  },
];

const effectTypes = [
  { value: "duel", label: "Duel (duel)" },
  { value: "damage", label: "Gây damage (damage)" },
  { value: "heal", label: "Hồi máu (heal)-ok" },
  { value: "buff", label: "Buff (buff)" },
  { value: "debuff", label: "Debuff (debuff)" },
  { value: "statusEffect", label: "Hiệu ứng xấu (statusEffect)-ok" },
  { value: "damageReflect", label: "Phản damage (damageReflect)-ok" },
  { value: "damageBoost", label: "Tăng damage (damageBoost)" },
  { value: "staminaSteal", label: "Hút stamina (staminaSteal)" },
  { value: "extraAction", label: "Thêm lượt hành động (extraAction)-ok" },
  { value: "reviveAlly", label: "Hồi sinh đồng minh (reviveAlly)" },
  { value: "aoeDamage", label: "Gây damage diện rộng (aoeDamage)" },
  { value: "immuneStatus", label: "Miễn nhiễm trạng thái (immuneStatus)" },
];

const statOptions = [
  { value: "Sức mạnh", label: "Sức mạnh" },
  { value: "Nhanh nhẹn", label: "Nhanh nhẹn" },
  { value: "Khéo léo", label: "Khéo léo" },
  { value: "May mắn", label: "May mắn" },
  { value: "Uy tín", label: "Uy tín" },
  { value: "Bền bỉ", label: "Bền bỉ" },
  { value: "agiPercent", label: "Tăng thanh tấn công" },
  { value: "bonusHits", label: "Số hit đánh thêm " },
  { value: "skillAmp", label: "Sát thương thêm " },
  { value: "evasion", label: "Né tránh" },
  { value: "defend", label: "Phòng thủ" },
  { value: "critRate", label: "Tỉ lệ chí mạng (critRate)" },
  { value: "critDamage", label: "Sát thương chí mạng " },
  { value: "regen", label: "Hồi phục mỗi lượt (regen)" },
  { value: "resistant", label: "Kháng hiệu ứng (resistant)" },
  { value: "extraAction", label: "Lượt hành động" },
  { value: "actionGauge", label: "Gauge hành động (actionGauge - chưa test)" },
];

const PassiveSkillForm = ({ passive, onChange }) => {
  const t = passive.trigger;
  const e = passive.effect;

  return (
    <>
      {/* Trigger */}
      <div className={styles.formGroup}>
        <label>Trigger type:</label>
        <select
          value={t.type}
          onChange={(e) => onChange("trigger", "type", e.target.value)}
        >
          <option value="">-- chọn --</option>
          {triggerTypes.map((tt) => (
            <option key={tt.value} value={tt.value}>
              {tt.label}
            </option>
          ))}
        </select>
      </div>
      {t.type === "onUseSpecificSkill" && (
        <div className={styles.formGroup}>
          <label>Tên kỹ năng cụ thể:</label>
          <input
            value={t.skillName}
            onChange={(e) => onChange("trigger", "skillName", e.target.value)}
          />
        </div>
      )}
      {["afterNDuels", "staminaLow"].includes(t.type) && (
        <div className={styles.formGroup}>
          <label>Giá trị điều kiện (value):</label>
          <input
            type="number"
            value={t.value}
            onChange={(e) => onChange("trigger", "value", +e.target.value)}
          />
        </div>
      )}
      {t.type === "staminaLow" && (
        <div className={styles.formGroup}>
          <label>Cooldown (số lượt chờ trước khi tái kích hoạt):</label>
          <input
            type="number"
            min={0}
            value={e.cooldown || 0}
            onChange={(e) =>
              onChange("effect", "cooldown", parseInt(e.target.value, 10))
            }
          />
        </div>
      )}
      <div className={styles.formGroup}>
        <label>Tỉ lệ xảy ra (%):</label>
        <input
          type="number"
          value={t.chance}
          onChange={(e) => onChange("trigger", "chance", +e.target.value)}
        />
      </div>

      {/* Effect */}
      <div className={styles.formGroup}>
        <label>Loại hiệu ứng:</label>
        <select
          value={e.type}
          onChange={(e) => onChange("effect", "type", e.target.value)}
        >
          <option value="">-- chọn --</option>
          {effectTypes.map((et) => (
            <option key={et.value} value={et.value}>
              {et.label}
            </option>
          ))}
        </select>
      </div>
      {/* Giá trị hiệu ứng - tùy theo loại */}
      {e.type === "damageReflect" ? (
        <div className={styles.formGroup}>
          <label>Phản damage (%):</label>
          <input
            type="number"
            min={1}
            max={100}
            value={e.value}
            onChange={(e) => onChange("effect", "value", +e.target.value)}
          />
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label>Giá trị hiệu ứng:</label>
          <input
            type="number"
            value={e.value}
            onChange={(e) => onChange("effect", "value", +e.target.value)}
          />
        </div>
      )}
      <div className={styles.formGroup}>
        <label>Target:</label>
        <select
          value={e.target}
          onChange={(e) => onChange("effect", "target", e.target.value)}
        >
          <option value="self">Bản thân</option>
          <option value="oneEnemy">1 đối thủ</option>
          <option value="allEnemies">Tất cả đối thủ</option>
          <option value="oneAlly">1 đồng minh</option>
          <option value="allAllies">Tất cả đồng minh</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Duration:</label>
        <input
          type="number"
          value={e.duration}
          onChange={(e) => onChange("effect", "duration", +e.target.value)}
        />
      </div>
      {(e.type === "buff" || e.type === "debuff") && (
        <>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={e.stackable || false}
                onChange={(ev) =>
                  onChange("effect", "stackable", ev.target.checked)
                }
              />
              &nbsp;Cho phép cộng dồn (stackable)
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={e.infiniteDuration || false}
                onChange={(ev) =>
                  onChange("effect", "infiniteDuration", ev.target.checked)
                }
              />
              &nbsp;Hiệu ứng vĩnh viễn (infinite duration)
            </label>
          </div>
        </>
      )}

      {(e.type === "buff" || e.type === "debuff") && (
        <div className={styles.formGroup}>
          <label>Chỉ số bị ảnh hưởng (stat):</label>
          <select
            value={e.stat || ""}
            onChange={(e) => onChange("effect", "stat", e.target.value)}
          >
            <option value="">-- chọn chỉ số --</option>
            {statOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {e.type === "statusEffect" && (
        <div className={styles.formGroup}>
          <label>Loại trạng thái:</label>
          <select
            value={e.status}
            onChange={(e) => onChange("effect", "status", e.target.value)}
          >
            <option value="">-- chọn --</option>
            <option value="stun">Stun</option>
            <option value="poison">Poison</option>
            <option value="silence">Silence</option>
            <option value="slow">Slow</option>
            <option value="blind">Blind</option>
          </select>
        </div>
      )}
    </>
  );
};

export default PassiveSkillForm;
