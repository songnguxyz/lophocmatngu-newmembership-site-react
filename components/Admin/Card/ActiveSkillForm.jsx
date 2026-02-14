// --- ActiveSkillForm.jsx ---
import React from "react";
import styles from "./AbilityManager.module.css";
import clsx from "clsx";

const ActiveSkillForm = ({ active, onChange, characterStats }) => {
  const handleInput =
    (key, isNumber = false) =>
    (e) => {
      const value = isNumber ? parseFloat(e.target.value) || 0 : e.target.value;
      onChange(key, value);
    };

  const targetOptions = [
    { value: "self", label: "Bản thân" },
    { value: "oneAlly", label: "Một đồng minh" },
    { value: "allAllies", label: "Tất cả đồng minh" },
    { value: "oneEnemy", label: "Một kẻ địch" },
    { value: "allEnemies", label: "Tất cả kẻ địch" },
  ];

  const typeOptions = [
    { value: "duel", label: "Duel", subtype: "" },
    { value: "damage", label: "Damage", subtype: "" },
    { value: "buff", label: "Buff Stat", subtype: "buffStat" },
    { value: "buff", label: "Buff Đặc biệt", subtype: "buffSpecial" },
    { value: "debuff", label: "Debuff Stat", subtype: "debuffStat" },
    { value: "debuff", label: "Debuff Status", subtype: "debuffStatus" },
  ];

  const isBuff = active.type === "buff";
  const isDebuff = active.type === "debuff";
  const isDuel = active.type === "duel" || active.type === "damage";
  const isBuffStat = active.subtype === "buffStat";
  const isBuffSpecial = active.subtype === "buffSpecial";
  const isDebuffStat = active.subtype === "debuffStat";
  const isDebuffStatus = active.subtype === "debuffStatus";

  const isOptionDimmed = (value) => {
    if (isDuel || active.type === "damage" || isDebuff) {
      return ["self", "oneAlly", "allAllies"].includes(value);
    }
    if (isBuff) {
      return ["oneEnemy", "allEnemies"].includes(value);
    }
    return false;
  };

  const renderSpecialEffectInput = () => {
    switch (active.specialEffect) {
      case "heal":
        return (
          <div className={styles.formGroup}>
            <label>Phục hồi (% HP):</label>
            <input
              type="number"
              value={active.healPercent || ""}
              onChange={handleInput("healPercent", true)}
            />
          </div>
        );
      case "extraAction":
        return (
          <div className={styles.formGroup}>
            <label>Số lượt hành động thêm:</label>
            <input
              type="number"
              value={active.extraActionCount || ""}
              onChange={handleInput("extraActionCount", true)}
            />
          </div>
        );
      case "bonusHits":
        return (
          <div className={styles.formGroup}>
            <label>Số đòn đánh thêm (bonusHits):</label>
            <input
              type="number"
              value={active.bonusHits || ""}
              onChange={handleInput("bonusHits", true)}
            />
          </div>
        );
      case "regen":
        return (
          <div className={styles.formGroup}>
            <label>Regen (% mỗi lượt):</label>
            <input
              type="number"
              value={active.regenPercent || ""}
              onChange={handleInput("regenPercent", true)}
            />
          </div>
        );
      case "critRate":
        return (
          <div className={styles.formGroup}>
            <label>Tăng tỉ lệ chí mạng (%):</label>
            <input
              type="number"
              value={active.critRateBonus || ""}
              onChange={handleInput("critRateBonus", true)}
            />
          </div>
        );
      case "critDamage":
        return (
          <div className={styles.formGroup}>
            <label>Tăng sát thương chí mạng (%):</label>
            <input
              type="number"
              value={active.critDamageBonus || ""}
              onChange={handleInput("critDamageBonus", true)}
            />
          </div>
        );
      case "resistant":
        return (
          <div className={styles.formGroup}>
            <label>Kháng hiệu ứng (%):</label>
            <input
              type="number"
              value={active.resistant || ""}
              onChange={handleInput("resistant", true)}
            />
          </div>
        );
      case "actionGauge":
        return (
          <div className={styles.formGroup}>
            <label>Tăng Action Gauge (%):</label>
            <input
              type="number"
              value={active.actionGauge || ""}
              onChange={handleInput("actionGauge", true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusEffectInput = () => {
    switch (active.status) {
      case "poison":
        return (
          <div className={styles.formGroup}>
            <label>Poison Damage (% mỗi lượt):</label>
            <input
              type="number"
              value={active.poisonPercent || ""}
              onChange={handleInput("poisonPercent", true)}
            />
          </div>
        );
      case "slow":
        return (
          <>
            <div className={styles.formGroup}>
              <label>Giảm Action Gauge (%):</label>
              <input
                type="number"
                value={active.actionGauge || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  onChange("actionGauge", -Math.abs(value)); // đảm bảo là số âm
                  onChange("specialEffect", "actionGauge"); // đặt specialEffect đúng loại
                }}
              />
            </div>
          </>
        );
      case "blind":
        return (
          <div className={styles.formGroup}>
            <label>Tỉ lệ trượt đòn (%):</label>
            <input
              type="number"
              value={active.blindPercent || ""}
              onChange={handleInput("blindPercent", true)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.formGroup}>
        <label>Loại kỹ năng:</label>
        <select
          value={active.type + ":" + (active.subtype || "")}
          onChange={(e) => {
            const [type, subtype] = e.target.value.split(":");
            onChange("type", type);
            onChange("subtype", subtype);
          }}
        >
          {typeOptions.map((opt) => (
            <option key={opt.label} value={`${opt.value}:${opt.subtype}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Vùng ảnh hưởng:</label>
        <select value={active.area} onChange={handleInput("area")}>
          {targetOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={isOptionDimmed(opt.value)}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset
        className={clsx(styles.section, {
          [styles.dimmed]: !(isDuel || isBuffStat || isDebuffStat),
        })}
      >
        <legend>Chỉ số chính (Stat-based)</legend>
        <div className={styles.formGroup}>
          <label>Chỉ số dựa theo:</label>
          <select value={active.stat} onChange={handleInput("stat")}>
            <option value="">-- chọn --</option>
            {characterStats.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Giá trị (value):</label>
          <input
            type="number"
            value={active.value || ""}
            onChange={handleInput("value", true)}
          />
        </div>

        {(active.type === "duel" || active.type === "damage") && (
          <>
            <div className={styles.formGroup}>
              <label>Số lần đánh (hitCount):</label>
              <input
                type="number"
                value={active.hitCount || 1}
                onChange={(e) => onChange("hitCount", +e.target.value)}
                min={1}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Skill AMP:</label>
              <input
                type="number"
                value={active.multiplier || 0.5}
                onChange={(e) => onChange("multiplier", +e.target.value)}
                step={0.1}
                min={0}
              />
            </div>
          </>
        )}
      </fieldset>

      <fieldset
        className={clsx(styles.section, {
          [styles.dimmed]: !isDebuffStatus,
        })}
      >
        <legend>Debuff / Status Effect</legend>
        <div className={styles.formGroup}>
          <label>Status Effect:</label>
          <select value={active.status || ""} onChange={handleInput("status")}>
            <option value="">-- None --</option>
            <option value="stun">Stun</option>
            <option value="poison">Poison</option>
            <option value="silence">Silence</option>
            <option value="slow">Slow</option>
            <option value="blind">Blind</option>
            <option value="cancelBuff">Cancel Buff</option>
          </select>
        </div>
        {renderStatusEffectInput()}
      </fieldset>

      <fieldset
        className={clsx(styles.section, {
          [styles.dimmed]: !isBuffSpecial,
        })}
      >
        <legend>Buff Đặc biệt</legend>
        <div className={styles.formGroup}>
          <label>Buff Đặc biệt:</label>
          <select
            value={active.specialEffect || ""}
            onChange={handleInput("specialEffect")}
          >
            <option value="">-- None --</option>
            <option value="heal">Heal</option>
            <option value="cleanse">Cleanse</option>
            <option value="extraAction">Extra Action</option>
            <option value="bonusHits">Bonus Hits</option>
            <option value="regen">Regen</option>
            <option value="critRate">Crit Rate</option>
            <option value="critDamage">Crit Damage</option>
            <option value="resistant">Resistant</option>
            <option value="actionGauge">Action Gauge</option>
          </select>
        </div>
        {renderSpecialEffectInput()}
      </fieldset>

      <div className={styles.formGroup}>
        <label>Cooldown (lượt):</label>
        <input
          type="number"
          value={active.cooldown || 0}
          onChange={handleInput("cooldown", true)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Hiệu lực (duration):</label>
        <input
          type="number"
          value={active.duration || 0}
          onChange={handleInput("duration", true)}
        />
      </div>
    </>
  );
};

export default ActiveSkillForm;
