// src/App.tsx
import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TournamentPage from "./Tournament";
import RankingPage from "./Ranking";
import type { Image } from "./types";
import { calculateElo } from "./utils/elo";
import "./App.css";

// --- Ustawienia Turnieju ---
const MIN_GAMES_PER_QUOTE = 3; // Ile razy każdy cytat musi być oceniony w eliminacjach
const FINALISTS_COUNT = 32; // Ilu najlepszych przechodzi do finału

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { images: Image[]; phase: "elimination" | "finals" }[]
  >([]);
  const [currentPhase, setCurrentPhase] = useState<"elimination" | "finals">(
    "elimination"
  );

  useEffect(() => {
    const savedState = localStorage.getItem("elo-ranking-state");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Sprawdzamy, czy wczytane dane są w nowym formacie (obiekt z właściwością 'images')
      if (
        parsedState &&
        typeof parsedState === "object" &&
        Array.isArray(parsedState.images)
      ) {
        // Nowy format - wszystko jest OK
        setImages(parsedState.images);
        setCurrentPhase(parsedState.phase || "elimination");
      } else if (Array.isArray(parsedState)) {
        // Stary format - wczytaliśmy samą tablicę.
        // Użyjmy jej i ustawmy domyślną fazę.
        setImages(parsedState);
        setCurrentPhase("elimination");
      }
      setIsLoading(false);
      return;
    }

    // Ta logika jest już poprawna - wczytuje dane z pliku json
    fetch("/images.json")
      .then((res) => res.json())
      .then((data: Image[]) => {
        // Przy pierwszym ładowaniu dodajemy gamesPlayed = 0
        const initialImages = data.map((img) => ({ ...img, gamesPlayed: 0 }));
        setImages(initialImages); // Używamy danych z pliku, włącznie z ELO 1500
      })
      .catch(() => setError("Nie udało się załadować cytatów."))
      .finally(() => setIsLoading(false));
  }, []);

  const saveState = (newState: Image[], newPhase: "elimination" | "finals") => {
    setImages(newState);
    setCurrentPhase(newPhase);
    localStorage.setItem(
      "elo-ranking-state",
      JSON.stringify({ images: newState, phase: newPhase })
    );
  };

  const handleVote = (winnerId: number, loserId: number) => {
    setHistory((prev) => [...prev, { images: images, phase: currentPhase }]);
    const winner = images.find((img) => img.id === winnerId);
    const loser = images.find((img) => img.id === loserId);
    if (!winner || !loser) return;
    const { newRatingA, newRatingB } = calculateElo(winner.elo, loser.elo, 1);
    const newState = images.map((img) => {
      if (img.id === winnerId)
        return { ...img, elo: newRatingA, gamesPlayed: img.gamesPlayed + 1 };
      if (img.id === loserId)
        return { ...img, elo: newRatingB, gamesPlayed: img.gamesPlayed + 1 };
      return img;
    });
    saveState(newState, currentPhase); // Zapisz nowy stan, zachowując aktualną fazę
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastFullState = history[history.length - 1];
    saveState(lastFullState.images, lastFullState.phase);
    setHistory((prev) => prev.slice(0, -1));
  };

  // --- Logika i dane pochodne do zarządzania fazami (używamy useMemo dla optymalizacji) ---
  const { completedCount, isEliminationComplete, finalists } = useMemo(() => {
    const completed = images.filter(
      (img) => img.gamesPlayed >= MIN_GAMES_PER_QUOTE
    );
    const sorted = [...images].sort((a, b) => b.elo - a.elo);
    return {
      completedCount: completed.length,
      isEliminationComplete:
        completed.length === images.length && images.length > 0,
      finalists: sorted.slice(0, FINALISTS_COUNT),
    };
  }, [images]);

  const startFinals = () => {
    if (!isEliminationComplete) return;
    saveState(images, "finals"); // Zapisujemy aktualne rankingi i zmieniamy fazę na "finały"
  };

  const resetProgress = () => {
    if (
      window.confirm(
        "Czy na pewno chcesz zresetować cały ranking i zacząć od nowa?"
      )
    ) {
      localStorage.removeItem("elo-ranking-state");
      window.location.reload(); // Przeładuj stronę, aby wczytać dane z pliku
    }
  };

  if (isLoading) return <div>Ładowanie rankingu...</div>;
  if (error) return <div>Błąd: {error}</div>;

  // --- Dynamiczne renderowanie w zależności od fazy ---
  const imagesForTournament =
    currentPhase === "elimination" ? images : finalists;

  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Ranking Cytatów</h1>
          <nav>
            {/* ZMIANA: Zaktualizowane linki nawigacji */}
            <Link to="/tournament">Głosowanie 1vs1</Link>
            <Link to="/">Pełny Ranking</Link>
            <button
              onClick={resetProgress}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Resetuj Ranking
            </button>
          </nav>
          {/* Wyświetlaj postęp tylko w fazie eliminacji */}
          {currentPhase === "elimination" && images.length > 0 && (
            <div className="progress-container">
              <h3>Postęp Eliminacji</h3>
              <progress value={completedCount} max={images.length}></progress>
              <span>
                {completedCount} / {images.length} (każdy oceniony min.{" "}
                {MIN_GAMES_PER_QUOTE} razy)
              </span>
              {isEliminationComplete && (
                <button onClick={startFinals} className="start-finals-button">
                  Rozpocznij Finały Top {FINALISTS_COUNT}!
                </button>
              )}
            </div>
          )}
          {currentPhase === "finals" && (
            <h2 style={{ color: "#61dafb" }}>Faza Finałowa!</h2>
          )}
        </header>

        <main>
          <Routes>
            {/* ZMIANA: Odwrócone trasy */}
            <Route
              path="/"
              element={
                <RankingPage
                  images={images}
                  finalists={finalists}
                  phase={currentPhase}
                />
              }
            />
            <Route
              path="/tournament"
              element={
                <TournamentPage
                  images={imagesForTournament} // Przekazujemy odpowiednią pulę obrazków
                  onVote={handleVote}
                  onUndo={handleUndo}
                  canUndo={history.length > 0}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
