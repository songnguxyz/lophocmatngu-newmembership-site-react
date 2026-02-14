import React from "react";
import {
  getStatWithBuff,
  calculateMaxStamina,
  recalculateCurrentSpeed,
} from "../../abilityType/battleCalculator";

export const InfoTab = ({ selectedCard }) => {
  const stamina = calculateMaxStamina(selectedCard).toFixed(1);
  const speed = recalculateCurrentSpeed(selectedCard).toFixed(1);
  const strength = getStatWithBuff(selectedCard, "Sức mạnh");
  const intelligence = getStatWithBuff(selectedCard, "Trí lực");
  const dexterity = getStatWithBuff(selectedCard, "Khéo léo");
  const endurance = getStatWithBuff(selectedCard, "Bền bỉ");
  const luck = getStatWithBuff(selectedCard, "May mắn");
  const prestige = getStatWithBuff(selectedCard, "Uy tín");

  const accuracyBonus = getStatWithBuff(selectedCard, "accuracy") || 0;
  const accuracy = 0.95 + dexterity / 150 + accuracyBonus / 100;
  const evasion = (luck / 150) * 100;
  const critRateBase = (prestige / 3) * 10;
  const critRateBonus = getStatWithBuff(selectedCard, "critRate") || 0;
  const critRate = Math.min(critRateBase + critRateBonus, 100);
  const critDmg =
    150 + prestige + (getStatWithBuff(selectedCard, "critDamage") || 0);
  const def = endurance;
  const defensePercent = ((0.06 * def) / (1 + 0.06 * Math.abs(def))) * 100;

  let attackValue = 0;
  if (strength >= intelligence && strength >= dexterity) {
    attackValue = strength;
  } else if (intelligence >= strength && intelligence >= dexterity) {
    attackValue = intelligence;
  } else {
    attackValue = dexterity;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 14, color: "#f8fafc" }}>
          {selectedCard.characterName}
        </div>
        <div style={{ fontSize: 12, color: "#eab308" }}>
          {selectedCard.gameClass || selectedCard.class || "Unknown class"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          rowGap: 4,
          columnGap: 12,
          fontSize: 13,
          color: "#e2e8f0",
          lineHeight: 1.4,
        }}
      >
        <div>❤️ HP</div>
        <div>{stamina}</div>
        <div>⚔️ ATK</div>
        <div>{(3 + attackValue).toFixed(0)} dmg</div>
        <div>🛡️ DEF</div>
        <div>{defensePercent.toFixed(0)}%</div>
        <div>🎯 ACC</div>
        <div>{(accuracy * 100).toFixed(0)}%</div>
        <div>💨 EVA</div>
        <div>{evasion.toFixed(0)}%</div>
        <div>🎯 CRIT</div>
        <div>{critRate.toFixed(0)}%</div>
        <div>💥 CRIT DMG</div>
        <div>{critDmg.toFixed(0)}%</div>
        <div>⚡ SPD</div>
        <div>{speed}</div>
      </div>
    </>
  );
};
