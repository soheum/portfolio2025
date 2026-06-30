import React from 'react';
import './Box12.css';

interface Box12Props {
  progress: number;
}

const Box12: React.FC<Box12Props> = ({ progress }) => {
  // Calculate fade-in opacity based on scroll progress
  // Start fading in at progress 0.3, fully visible at progress 0.7
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  
  // Box12 is at row 2, col 0 (bottom-left) - slides in from left
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = 0;

  return (
    <div 
      className="card"
      style={{ 
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
      }}
    />
  );
};

export default Box12;
