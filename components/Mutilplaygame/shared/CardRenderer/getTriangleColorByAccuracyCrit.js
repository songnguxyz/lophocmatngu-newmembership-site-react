// utils/getTriangleColorByAccuracyCrit.js
import { getStatWithBuff } from "../../abilityType/battleCalculator";

export function getTriangleColorByAccuracyCrit(attacker, defender) {
  try {
    const dex = getStatWithBuff(attacker, "Khéo léo");
    const luck = getStatWithBuff(attacker, "May mắn");
    const agi = getStatWithBuff(defender, "Nhanh nhẹn");

    const acc = 0.7 + dex * 0.05;
    const evasion = agi * 0.01;
    const hitChance = Math.max(0, acc - evasion);
    const critChance = Math.min((luck / 3) * 10, 100); // Tối đa 100%

    const hit = hitChance * 100;
    const crit = critChance;

    if (hit >= 90 && crit >= 30) return "#16a34a"; // xanh đậm
    if (hit >= 80 && crit >= 15) return "#4ade80"; // xanh nhạt
    if (hit >= 65) return "#facc15"; // vàng
    if (hit >= 50) return "#f97316"; // cam
    return "#ef4444"; // đỏ
  } catch (e) {
    console.warn("❌ Cannot estimate triangle color", e);
    return "#f9a8d4"; // fallback: hồng nhạt
  }
}
