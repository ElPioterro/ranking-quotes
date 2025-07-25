// src/Tournament.tsx
import React, { useState, useEffect } from "react";
import type { Image } from "./types";
import ImageCard from "./ImageCard";
import UndoButton from "./UndoButton";

interface TournamentPageProps {
  images: Image[];
  onVote: (winnerId: number, loserId: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

// Funkcja pomocnicza do losowania pary
const getTwoRandomImages = (images: Image[]): [Image, Image] | null => {
  if (images.length < 2) return null;
  const firstIndex = Math.floor(Math.random() * images.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * images.length);
  } while (firstIndex === secondIndex);

  return [images[firstIndex], images[secondIndex]];
};
// KLUCZOWA ZMIANA: Cały komponent jest teraz znacznie prostszy
const TournamentPage: React.FC<TournamentPageProps> = ({
  images,
  onVote,
  onUndo,
  canUndo,
}) => {
  const [pair, setPair] = useState<[Image, Image] | null>(null);

  const [pairHistory, setPairHistory] = useState<[Image, Image][]>([]);

  // NOWY STAN 1: Zarządza cyklem animacji: 'entering', 'idle', 'decided'
  const [animationState, setAnimationState] = useState<
    "entering" | "idle" | "decided"
  >("entering");

  // NOWY STAN 2: Przechowuje informację o tym, kto wygrał, a kto przegrał
  const [selection, setSelection] = useState<{
    winnerId: number | null;
    loserId: number | null;
  }>({ winnerId: null, loserId: null });

  // Ten useEffect zarządza pojawianiem się nowej pary
  useEffect(() => {
    if (images.length > 0) {
      const newPair = getTwoRandomImages(images);
      setPair(newPair);
      setAnimationState("entering"); // 1. Ustaw stan na 'wchodzenie'

      // 2. Po krótkiej chwili zmień stan na 'idle', aby animacja wejścia się zakończyła
      const timer = setTimeout(() => {
        setAnimationState("idle");
      }, 100); // 100ms to wystarczająco dużo czasu na rozpoczęcie przejścia

      return () => clearTimeout(timer);
    }
  }, [images]); // Zmieniamy parę tylko, gdy zmieni się globalny stan `images` (po głosie lub cofnięciu)

  const handleVote = (winner: Image, loser: Image) => {
    if (animationState !== "idle" || !pair) return;
    setPairHistory((prev) => [...prev, pair]);
    setSelection({ winnerId: winner.id, loserId: loser.id });
    setAnimationState("decided");

    const voteTimer = setTimeout(() => {
      // --- POCZĄTEK KLUCZOWEJ ZMIANY ---

      // 1. WYCZYŚĆ WIDOK!
      // To jest najważniejsza część poprawki. Ustawiając parę na `null`,
      // zmuszamy Reacta do usunięcia starych komponentów `ImageCard` z drzewa DOM.
      // Widok staje się "czysty" i na chwilę pokaże "Wybieranie przeciwników...".
      setPair(null);

      // 2. DOPIERO TERAZ WYKONAJ GŁOS
      // Ponieważ widok jest już pusty, ta operacja nie spowoduje wyścigu.
      // Zmiana propsa `images` uruchomi `useEffect`, który na czystym widoku
      // rozpocznie animację wejścia nowej pary.
      onVote(winner.id, loser.id);

      // --- KONIEC KLUCZOWEJ ZMIANY ---
    }, 600);

    return () => clearTimeout(voteTimer);
  };

  const handleUndoClick = () => {
    // Sprawdź, czy jest co cofać
    if (pairHistory.length === 0) return;

    // 1. Wywołaj globalną funkcję onUndo, aby przywrócić rankingi ELO.
    onUndo();

    // 2. Pobierz ostatnią parę z lokalnej historii.
    const lastPair = pairHistory[pairHistory.length - 1];
    setPair(lastPair);

    // 3. Usuń ostatnią parę z lokalnej historii.
    setPairHistory((prev) => prev.slice(0, -1));
  };

  if (!pair) {
    return <div>Ładowanie...</div>;
  }

  const [image1, image2] = pair;

  // Funkcja pomocnicza do budowania dynamicznych klas CSS
  const getCardClassName = (cardId: number, position: "left" | "right") => {
    let classes = "image-card-container";

    if (animationState === "entering") classes += " entering";
    if (animationState === "idle" || animationState === "decided")
      classes += " visible";

    if (animationState === "decided") {
      if (cardId === selection.winnerId) classes += " winner";
      if (cardId === selection.loserId) {
        classes += " loser";
        classes += position === "left" ? " throw-left" : " throw-right";
      }
    }
    return classes;
  };

  return (
    <div className="tournament-container">
      <h2>Który cytat jest lepszy? Kliknij, aby wybrać.</h2>

      <div className="comparison-area">
        <ImageCard
          imageUrl={image1.url}
          onImageClick={() => handleVote(image1, image2)}
          className={getCardClassName(image1.id, "left")}
        />
        <div className="vs-separator">VS</div>
        <ImageCard
          imageUrl={image2.url}
          onImageClick={() => handleVote(image2, image1)}
          className={getCardClassName(image2.id, "right")}
        />
      </div>

      <div className="undo-area">
        <UndoButton
          onUndo={handleUndoClick}
          disabled={!canUndo || pairHistory.length === 0}
        />
      </div>
    </div>
  );
};
export default TournamentPage;
