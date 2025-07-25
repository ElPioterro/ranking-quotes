// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TournamentPage from "./Tournament";
import RankingPage from "./Ranking";
import type { Image } from "./types";
import { calculateElo } from "./utils/elo";
import "./App.css";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Image[][]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem("elo-ranking-state");
    if (savedState) {
      setImages(JSON.parse(savedState));
      setIsLoading(false);
      return;
    }

    // Ta logika jest już poprawna - wczytuje dane z pliku json
    fetch("/images.json")
      .then((res) => res.json())
      .then((data: Image[]) => {
        setImages(data); // Używamy danych z pliku, włącznie z ELO 1500
      })
      .catch(() => setError("Nie udało się załadować cytatów."))
      .finally(() => setIsLoading(false));
  }, []);

  const saveState = (newState: Image[]) => {
    setImages(newState);
    localStorage.setItem("elo-ranking-state", JSON.stringify(newState));
  };

  const handleVote = (winnerId: number, loserId: number) => {
    setHistory((prev) => [...prev, images]);
    const winner = images.find((img) => img.id === winnerId);
    const loser = images.find((img) => img.id === loserId);
    if (!winner || !loser) return;
    const { newRatingA, newRatingB } = calculateElo(winner.elo, loser.elo, 1);
    const newState = images.map((img) => {
      if (img.id === winnerId) return { ...img, elo: newRatingA };
      if (img.id === loserId) return { ...img, elo: newRatingB };
      return img;
    });
    saveState(newState);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    saveState(lastState);
    setHistory((prev) => prev.slice(0, -1));
  };

  if (isLoading) return <div>Ładowanie rankingu...</div>;
  if (error) return <div>Błąd: {error}</div>;

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
        </header>

        <main>
          <Routes>
            {/* ZMIANA: Odwrócone trasy */}
            <Route path="/" element={<RankingPage images={images} />} />
            <Route
              path="/tournament"
              element={
                <TournamentPage
                  images={images}
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
