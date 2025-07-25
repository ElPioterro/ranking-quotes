// src/ImageCard.tsx
import React from "react";

interface ImageCardProps {
  imageUrl: string;
  onImageClick: () => void;
  className: string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  onImageClick,
  className,
}) => {
  return (
    // Po prostu użyj className, które przekazuje rodzic. Nic więcej.
    <div className={className} onClick={onImageClick}>
      <img src={imageUrl} alt="cytat" className="image-card-content" />
    </div>
  );
};

export default ImageCard;
