import React from 'react';
import './Box10.css';

interface Box10Props {
  progress: number;
}

/**
 * Box10 – empty placeholder for now.
 * Keeps the same progress-based fade/slide so it fits the grid layout.
 */
const Box10: React.FC<Box10Props> = ({ progress }) => {
  // Same fade/slide as before so layout and scroll behavior stay consistent
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = 30 * (1 - fadeOpacity);

  return (
    <div
      className="box10-container"
      style={{
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}
    />
  );
};

export default Box10;
