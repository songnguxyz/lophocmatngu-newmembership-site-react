export function toggleCard({ card, selectedCards, setSelectedCards }) {
  const isSelected = selectedCards.find(
    (c) => c.ownedCardId === card.ownedCardId
  );
  if (isSelected) {
    setSelectedCards((prev) =>
      prev.filter((c) => c.ownedCardId !== card.ownedCardId)
    );
  } else {
    if (selectedCards.length < 5) {
      setSelectedCards((prev) => [...prev, card]);
    } else {
      alert("Chỉ được chọn tối đa 5 thẻ!");
    }
  }
}
