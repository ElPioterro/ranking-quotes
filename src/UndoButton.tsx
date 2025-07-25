// src/UndoButton.tsx

import React from "react";

// 1. Zdefiniuj typy dla propsów, które komponent będzie przyjmował.
//    Nazwy muszą pasować do tych używanych w TournamentPage.
interface UndoButtonProps {
  onUndo: () => void; // Oczekujemy funkcji o nazwie 'onUndo'
  disabled: boolean; // Oczekujemy wartości boolean o nazwie 'disabled'
}

// 2. Użyj zdefiniowanego interfejsu, aby otypować propsy komponentu.
const UndoButton: React.FC<UndoButtonProps> = ({ onUndo, disabled }) => {
  return (
    // 3. Przypisz otrzymane propsy do odpowiednich atrybutów elementu <button>.
    //    Ważne: atrybut HTML nazywa się `onClick`, więc przypisujemy do niego
    //    naszą funkcję otrzymaną w propsie `onUndo`.
    <button onClick={onUndo} disabled={disabled} style={{ marginTop: "1rem" }}>
      Cofnij ostatni głos
    </button>
  );
};

export default UndoButton;
