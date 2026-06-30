import React from 'react';
import './GridPage.css';

interface GridTileProps {
  depth?: number;
  children?: React.ReactNode;
  label?: string;
}

const GridTile: React.FC<GridTileProps> = ({ depth = 0, children, label }) => {
  return (
    <article 
      className="tile" 
      style={{ '--parallax-depth': depth } as React.CSSProperties}
    >
      {label && <div className="tile-label">{label}</div>}
      {children}
    </article>
  );
};

export default GridTile;
