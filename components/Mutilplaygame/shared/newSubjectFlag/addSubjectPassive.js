// 📁 shared/newSubjectFlag/addSubjectPassive.js
import { SUBJECT_RECIPES } from "./Recipes";

export function addSubjectPassiveToAbilitiesMap({
  subjectName,
  myCards,
  availableAbilitiesMap,
  setAvailableAbilitiesMap,
}) {
  if (!Array.isArray(myCards)) return;

  const subject = SUBJECT_RECIPES.find((s) => s.name === subjectName);
  if (!subject?.passive) return;

  const updatedMap = { ...availableAbilitiesMap };

  myCards.forEach((card) => {
    const cardId = card.ownedCardId?.trim?.();
    if (!cardId) return;

    if (!updatedMap[cardId]) updatedMap[cardId] = [];

    const alreadyHas = updatedMap[cardId].some(
      (a) => a.name === subject.passive.name
    );
    console.log("✅ Gắn passive môn học vào", cardId, subject.passive.name);
    if (!alreadyHas) {
      const passive = subject.passive;

      updatedMap[cardId].push({
        name: passive.name,
        skillCategory: "passive",
        passive: {
          trigger: passive.trigger,
          effect: passive.effect,
        },
        meta: {
          name: passive.name,
          skillCategory: "passive",
          description: passive.description,
          trigger: passive.trigger,
          effect: { ...passive.effect },
        },
      });
    }
  });

  setAvailableAbilitiesMap(updatedMap);
}
