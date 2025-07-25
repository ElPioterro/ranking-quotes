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
  useEffect(() => {
    if (images.length > 0) {
      setPair(getTwoRandomImages(images));
    }
  }, []);

  if (!pair) {
    return <div>Ładowanie...</div>;
  }

  const [image1, image2] = pair;

  const handleVoteAndGetNewPair = (winner: Image, loser: Image) => {
    if (!pair) return;

    // 1. Zapisz aktualną parę do LOKALNEJ historii par.
    setPairHistory((prev) => [...prev, pair]);

    // 2. Wywołaj funkcję z App.tsx, aby zaktualizować ELO.
    onVote(winner.id, loser.id);

    // 3. Wylosuj i ustaw nową parę.
    // Przekazujemy `images` bezpośrednio, bo stan zaktualizuje się dopiero przy następnym renderze.
    setPair(getTwoRandomImages(images));
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

  return (
    <div className="tournament-container">
      <h2>Który cytat jest lepszy? Kliknij, aby wybrać.</h2>

      {/* Kontener flex, który ułoży obrazki obok siebie */}
      <div className="comparison-area">
        {/* ZMIANA: Używamy nowej funkcji do obsługi głosowania */}
        <ImageCard
          imageUrl={image1.url}
          onImageClick={() => handleVoteAndGetNewPair(image1, image2)}
        />
        <div className="vs-separator">VS</div>
        <ImageCard
          imageUrl={image2.url}
          onImageClick={() => handleVoteAndGetNewPair(image2, image1)}
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
