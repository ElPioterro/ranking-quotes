import React from "react";

// Definiujemy, jakie propsy komponent PRZYJMUJE
interface ImageCardProps {
  imageUrl: string;
  onImageClick: () => void; // Prop, który jest funkcją, nie przyjmuje argumentów i nic nie zwraca
}

// React.FC oznacza "React Functional Component"
// W nawiasach <> podajemy typ jego propsów
const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, onImageClick }) => {
  return (
    <div onClick={onImageClick} style={{ cursor: "pointer" }}>
      <img
        src={imageUrl}
        alt="cytat"
        style={{ width: "300px", height: "300px", objectFit: "cover" }}
      />
    </div>
  );
};

export default ImageCard;
