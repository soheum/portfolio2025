import React, { useState } from 'react';
import PhotoCloud3D from './PhotoCloud3D';
import './Box5.css';

const slideImages = [
  '/img/vinyl/slide-01.jpg',
  '/img/vinyl/slide-02.jpg',
  '/img/vinyl/slide-03.jpg',
  '/img/vinyl/slide-04.jpg',
  '/img/vinyl/slide-05.jpg',
  '/img/vinyl/slide-06.jpg',
  '/img/vinyl/slide-07.jpg',
  '/img/vinyl/slide-08.jpg',
];

interface Box5Props {
  progress: number;
  onHoverChange?: (isHovered: boolean) => void;
  isHovered?: boolean;
}

/**
 * Box5 – left of center card, top-left (row 2, col 1).
 * Embeds the PhotoCloud3D (3D vinyl carousel).
 */
const Box5: React.FC<Box5Props> = ({ progress, onHoverChange, isHovered = false }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = 0;

  return (
    <div
      className={`box5-container ${isHovered ? 'hovered' : ''} ${isOverlayOpen ? 'overlay-open' : ''}`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => {
        if (!isOverlayOpen) onHoverChange?.(false);
      }}
      style={{
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}
    >
      <div className="box5-hover-hint">scroll through the images from left to right</div>
      <div className="box5-photo-cloud-wrap">
        <PhotoCloud3D
          images={slideImages}
          onOverlayChange={(open) => {
            setIsOverlayOpen(open);
            if (!open) onHoverChange?.(false);
          }}
        />
      </div>
    </div>
  );
};

export default Box5;
