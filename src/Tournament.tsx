// src/Tournament.tsx
import React, { useState, useEffect, useRef } from "react"; // POPRAWKA: Zaimportuj useRef
import type { Image } from "./types";
import ImageCard from "./ImageCard";
import UndoButton from "./UndoButton";

interface TournamentPageProps {
  images: Image[];
  onVote: (winnerId: number, loserId: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const getTwoSmartImages = (images: Image[]): [Image, Image] | null => {
  if (images.length < 2) return null;
  const minGamesPlayed = Math.min(...images.map((p) => p.gamesPlayed));
  const leastPlayedPool = images.filter(
    (p) => p.gamesPlayed === minGamesPlayed
  );
  const firstImage =
    leastPlayedPool[Math.floor(Math.random() * leastPlayedPool.length)];
  const opponentPool = images.filter((p) => p.id !== firstImage.id);
  if (opponentPool.length === 0) return null;
  const secondImage =
    opponentPool[Math.floor(Math.random() * opponentPool.length)];
  return [firstImage, secondImage];
};

const TournamentPage: React.FC<TournamentPageProps> = ({
  images,
  onVote,
  onUndo,
  canUndo,
}) => {
  const [pair, setPair] = useState<[Image, Image] | null>(null);
  const [pairHistory, setPairHistory] = useState<[Image, Image][]>([]);
  const [animationState, setAnimationState] = useState<
    "entering" | "idle" | "decided"
  >("entering");
  const [selection, setSelection] = useState<{
    winnerId: number | null;
    loserId: number | null;
  }>({ winnerId: null, loserId: null });

  // POPRAWKA 1: Dodajemy ref, który będzie flagą informującą o operacji cofania.
  // Używamy ref, ponieważ jego zmiana nie powoduje ponownego renderowania komponentu.
  const isUndoing = useRef(false);

  useEffect(() => {
    // POPRAWKA 2: Sprawdzamy flagę na początku efektu.
    // Jeśli ten render był spowodowany operacją cofania, resetujemy flagę i przerywamy działanie efektu,
    // aby nie wylosował on nowej pary.
    if (isUndoing.current) {
      isUndoing.current = false;
      return;
    }

    if (images.length > 0) {
      const newPair = getTwoSmartImages(images);
      setPair(newPair);
      setAnimationState("entering");
      const timer = setTimeout(() => {
        setAnimationState("idle");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [images]); // Zależność od `images` pozostaje bez zmian.

  const handleVote = (winner: Image, loser: Image) => {
    if (animationState !== "idle" || !pair) return;
    setPairHistory((prev) => [...prev, pair]);
    setSelection({ winnerId: winner.id, loserId: loser.id });
    setAnimationState("decided");

    const voteTimer = setTimeout(() => {
      setPair(null);
      onVote(winner.id, loser.id);
    }, 600);

    return () => clearTimeout(voteTimer);
  };

  // POPRAWKA 3: Całkowicie nowa logika dla `handleUndoClick`.
  const handleUndoClick = () => {
    if (pairHistory.length === 0) return;

    // 1. Ustaw flagę `isUndoing` na `true`. To poinformuje nadchodzący `useEffect`, aby nic nie robił.
    isUndoing.current = true;

    // 2. Pobierz ostatnią parę z lokalnej historii.
    const lastPair = pairHistory[pairHistory.length - 1];

    // 3. Natychmiast przywróć poprzednią parę do widoku.
    setPair(lastPair);

    // 4. Zresetuj stan animacji, aby para nie była oznaczona jako "wygrany/przegrany".
    setAnimationState("idle");
    setSelection({ winnerId: null, loserId: null });

    // 5. Usuń ostatnią parę z lokalnej historii.
    setPairHistory((prev) => prev.slice(0, -1));

    // 6. Na samym końcu wywołaj globalną funkcję onUndo. Spowoduje to re-render z poprzednim
    // stanem `images`, ale nasz `useEffect` zostanie zablokowany przez flagę `isUndoing`.
    onUndo();
  };

  if (!pair) {
    return <div>Wybieranie przeciwników...</div>;
  }

  const [image1, image2] = pair;

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
