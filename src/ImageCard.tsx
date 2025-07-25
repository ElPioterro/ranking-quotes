// src/ImageCard.tsx
import React from "react";

interface ImageCardProps {
  imageUrl: string;
  onImageClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, onImageClick }) => {
  return (
    // Ten div to nasz "duży pojemnik". Jest elastyczny.
    <div className="image-card-container" onClick={onImageClick}>
      <img src={imageUrl} alt="cytat" className="image-card-content" />
    </div>
  );
};

export default ImageCard;
