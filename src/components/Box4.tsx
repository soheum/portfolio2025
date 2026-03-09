import React from 'react';
import './Box4.css';

interface Box4Props {
  progress: number;
}

/**
 * Box4 – at row 4, col 1.
 * Placeholder with same progress-based fade/slide as other boxes.
 */
const Box4: React.FC<Box4Props> = ({ progress }) => {
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = 30 * (1 - fadeOpacity);

  return (
    <div
      className="box4-container"
      style={{
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}
    />
  );
};

export default Box4;
