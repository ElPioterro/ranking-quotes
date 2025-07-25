// src/utils/elo.ts

/**
 * Oblicza nową punktację Elo dla dwóch graczy na podstawie wyniku pojedynku.
 *
 * @param ratingA - Obecna punktacja gracza A (w naszym przypadku, wygranego).
 * @param ratingB - Obecna punktacja gracza B (przegranego).
 * @param scoreA - Wynik gracza A. Używamy 1 dla wygranej, 0.5 dla remisu, 0 dla przegranej. W naszym przypadku to będzie zawsze 1.
 * @param k - Współczynnik K. Określa "wagę" pojedynku. Wyższa wartość oznacza większe zmiany w rankingu. 32 to popularna wartość.
 * @returns Obiekt zawierający nowe rankingi dla obu graczy.
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  scoreA: 1 | 0.5 | 0, // Wynik gracza A
  k: number = 32
): { newRatingA: number; newRatingB: number } {
  // 1. Obliczamy "oczekiwany" wynik dla gracza A.
  // Jest to prawdopodobieństwo wygranej gracza A, oparte na różnicy w rankingu.
  // Jeśli rankingi są równe, oczekiwany wynik to 0.5 (50% szans).
  const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

  // 2. Obliczamy "oczekiwany" wynik dla gracza B.
  const expectedScoreB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

  // Rzeczywisty wynik gracza B to odwrotność wyniku A
  const scoreB = 1 - scoreA;

  // 3. Obliczamy nowe rankingi.
  // Wzór: Nowy Ranking = Stary Ranking + K * (Rzeczywisty Wynik - Oczekiwany Wynik)
  const newRatingA = Math.round(ratingA + k * (scoreA - expectedScoreA));
  const newRatingB = Math.round(ratingB + k * (scoreB - expectedScoreB));

  return { newRatingA, newRatingB };
}
