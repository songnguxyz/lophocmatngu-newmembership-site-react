import React, { memo } from "react";
import { CardContainer } from "./CardContainer";
import { AbilityIcons } from "./AbilityIcons";
import { FlagDisplay } from "./FlagDisplay";
import { EffectDisplayGroup } from "./EffectDisplayGroup";
import { StaminaBar } from "./StaminaBar";
import { ActionGaugeBar } from "./ActionGaugeBar";
import { ActionPointBar } from "./ActionPointBar";

const CardRenderer = (props) => {
  const {
    card,
    isMine,
    roomData,
    myCards,
    opponentCards,
    floatingDamages = [],
    hoveredAbility,
    setHoveredAbility,
    setTooltipPosition,
    tooltipPosition
  } = props;

  const myDamageList = floatingDamages.filter(
    (d) => d.cardId === card.ownedCardId
  );

  const currentActor = [...myCards, ...opponentCards].find(
    (c) => c.ownedCardId === roomData?.currentActorId
  );

  return (
    <CardContainer
      {...props}
      myDamageList={myDamageList}
      selectedAbility={props.selectedAbility}
      selectedCard={props.selectedCard}
      selectedCardId={props.selectedCardId}
      handleCardClick={props.handleCardClick}
      setSelectedTargetId={props.setSelectedTargetId}
      roomData={roomData}
    >
      <StaminaBar card={card} />
      <ActionGaugeBar card={card} isMine={isMine} />
      <ActionPointBar actionCount={card.actionCount} />
      <EffectDisplayGroup card={card} roomData={roomData} />
    </CardContainer>
  );
};

export const CardRendererMemo = memo(CardRenderer); // 👈 Đổi tên rõ ràng
export { CardRendererMemo as CardRenderer }; // 👈 Giữ nguyên tên khi import
