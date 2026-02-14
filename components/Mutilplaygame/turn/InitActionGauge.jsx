import { useEffect } from "react";
import { recalculateCurrentSpeed } from "../abilityType/battleCalculator";

/**
 * Khởi tạo actionGauge và tốc độ CHỈ MỘT LẦN duy nhất khi bắt đầu trận
 */
export default function InitActionGauge({ cards, setCards }) {
  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Nếu tất cả card đã có actionGauge, không cần làm lại
    const alreadyInitialized = cards.every(
      (c) => typeof c.actionGauge === "number"
    );
    if (alreadyInitialized) return;

    const initializedCards = cards.map((card) => {
      const agility = card.stats?.["Nhanh nhẹn"] || 0;
      const randomBonus = Math.random() * 10;

      const startGauge = Math.min(100, agility * 4 + randomBonus);
      const baseSpeed = recalculateCurrentSpeed(card);

      return {
        ...card,
        actionGauge: startGauge,
        baseSpeed,
        currentSpeed: baseSpeed,
      };
    });

    setCards(initializedCards);
  }, [cards, setCards]);

  return null;
}
