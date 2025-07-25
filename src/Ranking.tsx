// src/Ranking.tsx
import React from "react";
import type { Image } from "./types";

interface RankingPageProps {
  images: Image[];
}

const RankingPage: React.FC<RankingPageProps> = ({ images }) => {
  const sortedImages = [...images].sort((a, b) => b.elo - a.elo);
  // .slice(0, 10);

  return (
    // Używamy diva jako głównego kontenera zamiast tabeli
    <div className="ranking-container">
      <h2>Pełny ranking ({images.length} cytatów)</h2>

      {/* Siatka do wyświetlania rankingu */}
      <div className="ranking-list">
        {/* Nagłówek naszej siatki */}
        <div className="ranking-header">
          <div>Miejsce</div>
          <div>Podgląd</div>
          <div>ELO</div>
        </div>

        {/* Mapowanie przez posortowane obrazki */}
        {sortedImages.map((image, index) => (
          // Każdy wiersz z danymi
          <div key={image.id} className="ranking-row">
            {/* Komórka z miejscem w rankingu */}
            <div className="ranking-cell-place">{index + 1}</div>

            {/* Komórka z obrazkiem */}
            <div className="ranking-cell-image">
              <img src={image.url} alt={`Cytat ${image.id}`} />
            </div>

            {/* Komórka z punktami ELO */}
            <div className="ranking-cell-elo">{image.elo}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPage;
