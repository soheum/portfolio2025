import React, { useEffect, useRef } from 'react';
import IntroCard from './IntroCard';
import GridTile from './GridTile';
import './GridPage.css';

const GridPage: React.FC = () => {
  const gridRef = useRef<HTMLElement>(null);
  const scrollValueRef = useRef<number>(0);
  const isTickingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isTickingRef.current) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          scrollValueRef.current = scrollY;
          
          // Update CSS variable on the grid container
          if (gridRef.current) {
            // Scale the scroll offset for subtle parallax (max ~30px movement)
            const scaledOffset = scrollY * 0.05;
            gridRef.current.style.setProperty('--scroll-offset', `${scaledOffset}px`);
          }
          
          isTickingRef.current = false;
        });
        
        isTickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Generate tile data with varying depths
  const tiles = [
    { depth: 0.08, label: 'Project 1' },
    { depth: -0.05, label: 'Project 2' },
    { depth: 0.12, label: 'Project 3' },
    { depth: 0.03, label: 'Project 4' },
    { depth: -0.08, label: 'Project 5' },
    { depth: 0.06, label: 'Project 6' },
    { depth: 0.1, label: 'Project 7' },
    { depth: -0.03, label: 'Project 8' },
    { depth: 0.05, label: 'Project 9' },
    { depth: 0.09, label: 'Project 10' },
    { depth: -0.06, label: 'Project 11' },
    { depth: 0.04, label: 'Project 12' },
  ];

  return (
    <main className="grid-page">
      <section ref={gridRef} className="grid-container">
        <IntroCard depth={0.05} />
        {tiles.map((tile, index) => (
          <GridTile key={index} depth={tile.depth} label={tile.label} />
        ))}
      </section>
    </main>
  );
};

export default GridPage;
