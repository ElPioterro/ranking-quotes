import { useState, useEffect } from "react";
import "./App.css"; // Domyślne style, możesz je później zmienić
import type { Image } from "./types"; // Importujemy nasz typ!

function App() {
  // Stan do przechowywania naszej listy obrazków.
  // useState<Image[]>([]) oznacza: "tworzę stan, który będzie tablicą obiektów typu Image, a na początku jest pustą tablicą".
  const [images, setImages] = useState<Image[]>([]);

  // Stan do śledzenia, czy dane się jeszcze ładują. Dobre praktyka!
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stan do przechowywania ewentualnych błędów pobierania.
  const [error, setError] = useState<string | null>(null);

  // Hook useEffect do wykonywania "efektów ubocznych" - w tym przypadku pobierania danych.
  // Pusta tablica [] na końcu oznacza, że efekt wykona się tylko raz, po zamontowaniu komponentu.
  useEffect(() => {
    // Używamy natywnego API przeglądarki 'fetch' do pobrania naszego pliku.
    fetch("/images.json") // Vite serwuje folder 'public' pod adresem '/'
      .then((response) => {
        // Jeśli odpowiedź serwera nie jest OK (np. błąd 404), rzucamy błędem.
        if (!response.ok) {
          throw new Error(
            "Nie udało się pobrać danych. Sprawdź, czy plik images.json jest w folderze public."
          );
        }
        return response.json(); // Konwertujemy odpowiedź na format JSON
      })
      .then((data: Image[]) => {
        // Tutaj mówimy TypeScriptowi, że dane ('data') które otrzymaliśmy, to tablica obiektów typu Image.
        setImages(data); // Zapisujemy pobrane dane w naszym stanie
      })
      .catch((err) => {
        // Jeśli gdzieś po drodze wystąpił błąd, łapiemy go tutaj.
        setError(err.message);
      })
      .finally(() => {
        // Ta część wykona się zawsze - niezależnie czy był sukces, czy błąd.
        setIsLoading(false); // Kończymy ładowanie
      });
  }, []);

  // --- Wyświetlanie (Renderowanie) ---

  // Jeśli dane się jeszcze ładują, pokaż komunikat.
  if (isLoading) {
    return <div>Ładowanie rankingu...</div>;
  }

  // Jeśli wystąpił błąd, pokaż informację o błędzie.
  if (error) {
    return <div>Błąd: {error}</div>;
  }

  // Jeśli wszystko jest OK, wyświetl listę obrazków.
  return (
    <div className="App">
      <header>
        <h1>Wszystkie Cytaty</h1>
        <p>
          Wczytano {images.length} obrazków. Sprawdź czy wszystko się zgadza.
        </p>
      </header>
      <main className="image-grid">
        {/* Metoda .map() tworzy nowy element JSX dla każdego obiektu w tablicy 'images' */}
        {images.map((image) => (
          // 'key' jest specjalnym propsem w React. Musi być unikalny dla każdego elementu na liście.
          // Używamy tu ID obrazka, co jest idealnym rozwiązaniem.
          <div key={image.id} className="image-container">
            <img src={image.url} alt={`Cytat numer ${image.id}`} />
            <p>ELO: {image.elo}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
