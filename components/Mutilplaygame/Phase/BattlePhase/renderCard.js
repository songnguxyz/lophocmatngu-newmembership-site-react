import {CardRenderer} from "../../shared/CardRenderer/CardRenderer";

export function renderCard({
  card,
  isMine,
  selectedCardId,
  selectedTargetId,
  selectedAbility,
  selectedCard,
  selectedTargetCard,
  availableAbilitiesMap,
  chosenSubject,
  roomData,
  handleCardClick,
  setSelectedCardId,
  setSelectedAbility,
  setSelectedTargetId,
  setChosenSubject,
  myCards,
  opponentCards,
  role,
  opponentRole,
  roomId,
  forceCooldown,
  handleSkip,
  floatingDamages,
  hoveredAbility,
  setHoveredAbility,
  setTooltipPosition,
  isMobile,
}) {
  const isSelected = selectedCardId === card.ownedCardId;
  const isTarget = selectedTargetId === card.ownedCardId;
  const abilities = availableAbilitiesMap[card.characterId] || [];

  return (
    <CardRenderer
      key={card.ownedCardId}
      card={card}
      isMine={isMine}
      isSelected={isSelected}
      isTarget={isTarget}
      selectedAbility={selectedAbility}
      selectedCardId={selectedCardId}
      chosenSubject={chosenSubject}
      selectedCard={selectedCard}
      selectedTargetCard={selectedTargetCard}
      roomData={roomData}
      availableAbilities={abilities}
      handleCardClick={(c) =>
        handleCardClick({
          card: c,
          isMine,
          selectedAbility,
          selectedCardId,
          roomData,
          setSelectedCardId,
          setSelectedTargetId,
        })
      }
      setSelectedCardId={setSelectedCardId}
      setSelectedAbility={setSelectedAbility}
      setSelectedTargetId={setSelectedTargetId}
      setChosenSubject={setChosenSubject}
      myCards={myCards}
      opponentCards={opponentCards}
      role={role}
      opponentRole={opponentRole}
      roomId={roomId}
      forceCooldown={forceCooldown}
      handleSkip={handleSkip}
      floatingDamages={floatingDamages}
      hoveredAbility={hoveredAbility}
      setHoveredAbility={setHoveredAbility}
      setTooltipPosition={setTooltipPosition}
      isMobile={isMobile}
    />
  );
}
