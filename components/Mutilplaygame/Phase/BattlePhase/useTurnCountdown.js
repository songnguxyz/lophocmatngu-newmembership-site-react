import { useEffect, useRef } from "react";

export function useTurnCountdown({ roomData, setCountdown, handleSkipTurn }) {
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!roomData?.currentActorId || roomData?.winner || roomData?.isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    const allCards = [
      ...(roomData.hostCards || []),
      ...(roomData.guestCards || []),
    ];
    const currentCard = allCards.find(
      (c) => c.ownedCardId === roomData.currentActorId
    );

    if (!currentCard) return;

    const isDead = currentCard.stamina <= 0 || currentCard.respawnCounter > 0;
    const isStunned = currentCard.statusEffects?.some((e) => e.type === "stun");

    if (isDead || isStunned) {
      handleSkipTurn();
      return;
    }

    const COUNTDOWN_LIMIT = 60;
    startTimeRef.current = Date.now();
    setCountdown(COUNTDOWN_LIMIT);

    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      const remaining = COUNTDOWN_LIMIT - elapsedSeconds;

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        handleSkipTurn();
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [roomData?.currentActorId, roomData?.winner, roomData?.isPaused]);
}
