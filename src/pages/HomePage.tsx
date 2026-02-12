import React, { useState, useEffect } from 'react';
import '../styles.css';
import '../App.css';
import CenterCard from '../components/CenterCard';
import { useScrollProgress } from '../hooks/useScrollProgress';
import Box1 from '../components/Box1';
import Box2 from '../components/Box2';
import Box3 from '../components/Box3';
import Box9 from '../components/Box9';
import Box10 from '../components/Box10';
import Box12 from '../components/Box12';

function HomePage() {
  const [vh, setVh] = useState(0);
  const [vw, setVw] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Always start at the top when this page is shown (refresh or navigating back from another page).
  // Without this, the browser can restore the previous scroll position and you’d land on the “second” view.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);
  
  const scrollProgress = useScrollProgress(0, vh * 0.4);

  const getBoxInteraction = (boxIndex: number, progress: number) => {
    switch (boxIndex) {
      case 0:
        return <Box1 progress={progress} />;
      case 1:
        return <Box2 progress={progress} />;
      case 2:
        return <Box3 progress={progress} />;
      case 8:
        return <Box9 progress={progress} />;
      case 9:
        return <Box10 progress={progress} />;
      case 11:
        return <Box12 progress={progress} />;
      default:
        return null;
    }
  };

  // Define which image appears in each cell when Box9 is hovered
  // You can customize this to show different images per cell
  // Cell indices: 0-4 (top row), 5-8 (middle row, excluding center), 9-13 (bottom row)
  // Index 14 is reserved for the center card position
  // Note: Index 8 (Box9's own cell) won't show because it's excluded from the effect
  const getCellFillImage = (cellIndex: number): string => {
    const imageMap: { [key: number]: string } = {
      0: '/img/Grid/Box9.jpg',   // Top-left
      1: '/img/Grid/Box9.jpg',   // Top-center-left (Box2)
      2: '/img/Grid/Box9.jpg',   // Top-center-right
      3: '/img/Grid/Box9.jpg',   // Top-right-left
      4: '/img/Grid/Box9.jpg',   // Top-right
      5: '/img/Grid/Box9_10_1.jpg',   // Middle-left
      6: '/img/Grid/Box9_5.jpg',   // Middle-center-left
      7: '/img/Grid/Box9_9.jpg',   // Middle-center-right (to the right of center card)
      8: '/img/Grid/Box9_8.jpg',   // Middle-right (Box9 itself - won't show, this cell is excluded)
      9: '/img/Grid/Box9.jpg',   // Bottom-left
      10: '/img/Grid/Box9.jpg',  // Bottom-center-left
      11: '/img/Grid/Box9.jpg',  // Bottom-center-right (Box12)
      12: '/img/Grid/Box9.jpg',  // Bottom-right-left
      13: '/img/Grid/Box9.jpg',  // Bottom-right
      14: '/img/Grid/Box9_8.jpg',  // Center card position (separate from grid cells)
    };
    
    // Return the mapped image or a default image if not specified
    return imageMap[cellIndex] || '/img/Scarlet/01-1.jpg';
  };

  // Get transition delay for staggered animation (5 → 6 → 14 → 7)
  const getCellTransitionDelay = (cellIndex: number): string => {
    const delayMap: { [key: number]: string } = {
      5: '0s',      // First (leftmost)
      6: '0.15s',   // Second
      14: '0.3s',   // Third (center card)
      7: '0.45s',   // Fourth (rightmost)
    };
    return delayMap[cellIndex] || '0s'; // All other cells have no delay
  };

  // BOX 2 HOVER EFFECT
  // Define which image appears in each cell when Box2 is hovered
  // Box2 is at cell index 1
  // You can customize these images independently from Box9
  const getBox2FillImage = (cellIndex: number): string => {
    const imageMap: { [key: number]: string } = {
      0: '/img/Grid/Box2_1.jpg',   // Top-left
      1: '/img/Scarlet/01-1.jpg',   // Top-center-left (Box2 itself - won't show, this cell is excluded)
      2: '/img/Grid/Box2_2.jpg',   // Top-center-right
      3: '/img/Grid/Box2_3.jpg',   // Top-right-left
      4: '/img/Grid/Box2_4.jpg',   // Top-right
      5: '/img/Grid/Box9.jpg',   // Middle-left
      6: '/img/Grid/Box9.jpg',    // Middle-center-left
      7: '/img/Grid/Box9.jpg',    // Middle-center-right
      8: '/img/Grid/Box9.jpg',    // Middle-right (Box9)
      9: '/img/Grid/Box9.jpg',    // Bottom-left
      10: '/img/Grid/Box9.jpg',   // Bottom-center-left
      11: '/img/Grid/Box9.jpg',  // Bottom-center-right (Box12)
      12: '/img/Grid/Box9.jpg',   // Bottom-right-left
      13: '/img/Grid/Box9.jpg',   // Bottom-right
      14: '/img/Grid/Box9.jpg',  // Center card position
    };
    
    return imageMap[cellIndex] || '/img/Scarlet/01-1.jpg';
  };

  // Get transition delay for Box2 staggered animation (0 → 2 → 3 → 4)
  // Sequential reveal of the top row cells
  const getBox2TransitionDelay = (cellIndex: number): string => {
    const delayMap: { [key: number]: string } = {
      0: '0s',      // First (leftmost)
      2: '0.15s',   // Second (after Box2, to the right of it)
      3: '0.3s',    // Third
      4: '0.45s',   // Fourth (rightmost)
    };
    return delayMap[cellIndex] || '0s';
  };

  const gridCells = [];
  const totalRows = 3;
  const totalCols = 5;
  let cellIndex = 0;
  
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      const isCenterCard = row === 1 && col === 2;
      if (!isCenterCard) {
        gridCells.push({ row, col, index: cellIndex });
        cellIndex++;
      }
    }
  }

  const cardWidth = 600;
  const gridSize = 300;
  const cardScale = 1 - scrollProgress * 0.5;
  const cardScaledWidth = cardWidth * cardScale;
  const cardScaledHeight = cardWidth * cardScale;
  const viewportWidth = vw || (typeof window !== 'undefined' ? window.innerWidth : 1920);
  const viewportHeight = vh || (typeof window !== 'undefined' ? window.innerHeight : 1080);
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const lineOpacity = 0.7;
  const firstOpacity = 1 - scrollProgress;
  const secondOpacity = scrollProgress;

  const firstViewHorizontalLines = [
    { y: centerY - cardScaledHeight / 2, length: viewportWidth, opacity: firstOpacity * lineOpacity },
    { y: centerY + cardScaledHeight / 2, length: viewportWidth, opacity: firstOpacity * lineOpacity },
  ];

  const firstViewVerticalLines = [
    { x: 0, length: viewportHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX - cardScaledWidth / 2 - gridSize, length: viewportHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX - cardScaledWidth / 2, length: viewportHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX + cardScaledWidth / 2, length: viewportHeight, opacity: firstOpacity * lineOpacity },
  ];

  const secondViewHorizontalLines = [
    { y: 0, length: viewportWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY - cardScaledHeight / 2, length: viewportWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY - cardScaledHeight / 2 - cardScaledHeight, length: viewportWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY + cardScaledHeight / 2 + cardScaledHeight, length: viewportWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY + cardScaledHeight / 2, length: viewportWidth, opacity: secondOpacity * lineOpacity },
    { y: viewportHeight, length: viewportWidth, opacity: secondOpacity * lineOpacity },
  ];

  const secondViewVerticalLines = [
    { x: centerX - cardScaledWidth * 1 - cardScaledWidth / 2, length: viewportHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX - cardScaledWidth / 2, length: viewportHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX + cardScaledWidth / 2, length: viewportHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX + cardScaledWidth / 2 + cardScaledWidth, length: viewportHeight, opacity: secondOpacity * lineOpacity },
  ];

  const loadingCardWidth = 600;
  const loadingCardHeight = 600;
  const loadingHorizontalLines = [
    { y: centerY - loadingCardHeight / 2, length: viewportWidth },
    { y: centerY + loadingCardHeight / 2, length: viewportWidth },
  ];

  const loadingVerticalLines = [
    { x: 0, length: viewportHeight },
    { x: centerX - loadingCardWidth / 2 - gridSize, length: viewportHeight },
    { x: centerX - loadingCardWidth / 2, length: viewportHeight },
    { x: centerX + loadingCardWidth / 2, length: viewportHeight },
  ];

  return (
    <div className="app-root">
      <div 
        className={`grid-background ${isLoading ? 'loading' : ''}`}
        style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}
      />
      
      <svg 
        className={`grid-lines-svg-loading ${!isLoading ? 'fade-out' : ''}`}
        width={viewportWidth}
        height={viewportHeight}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 6, pointerEvents: 'none' }}
      >
          <defs>
            <linearGradient id="horizontalGradientLoading" x1="0" y1="0" x2={viewportWidth} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#101010" stopOpacity="1" />
              <stop offset="50%" stopColor="#585858" stopOpacity="1" />
              <stop offset="100%" stopColor="#101010" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="verticalGradientLoading" x1="0" y1="0" x2="0" y2={viewportHeight} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#101010" stopOpacity="1" />
              <stop offset="50%" stopColor="#585858" stopOpacity="1" />
              <stop offset="100%" stopColor="#101010" stopOpacity="1" />
            </linearGradient>
          </defs>
          {loadingHorizontalLines.map((line, index) => {
            const delay = 0.5;
            return (
              <line
                key={`h-loading-${index}`}
                x1="0"
                y1={line.y}
                x2={line.length}
                y2={line.y}
                stroke="url(#horizontalGradientLoading)"
                strokeWidth="1"
                strokeOpacity={lineOpacity}
                strokeDasharray={line.length}
                strokeDashoffset={line.length}
                className="grid-line-horizontal"
                style={{
                  '--line-length': `${line.length}`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties}
              />
            );
          })}
          {loadingVerticalLines.map((line, index) => {
            const delay = 0;
            return (
              <line
                key={`v-loading-${index}`}
                x1={line.x}
                y1="0"
                x2={line.x}
                y2={line.length}
                stroke="url(#verticalGradientLoading)"
                strokeWidth="1"
                strokeOpacity={lineOpacity}
                strokeDasharray={line.length}
                strokeDashoffset={line.length}
                className="grid-line-vertical"
                style={{
                  '--line-length': `${line.length}`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties}
              />
            );
          })}
      </svg>

      <svg 
        className={`grid-lines-svg-static ${!isLoading ? 'visible' : ''}`}
        width={viewportWidth}
        height={viewportHeight}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="horizontalGradient" x1="0" y1="0" x2={viewportWidth} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#101010" stopOpacity="1" />
            <stop offset="50%" stopColor="#585858" stopOpacity="1" />
            <stop offset="100%" stopColor="#101010" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="verticalGradient" x1="0" y1="0" x2="0" y2={viewportHeight} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#101010" stopOpacity="1" />
            <stop offset="50%" stopColor="#585858" stopOpacity="1" />
            <stop offset="100%" stopColor="#101010" stopOpacity="1" />
          </linearGradient>
        </defs>
        {firstViewHorizontalLines.map((line, index) => (
          <line
            key={`h-first-${index}`}
            x1="0"
            y1={line.y}
            x2={line.length}
            y2={line.y}
            stroke="url(#horizontalGradient)"
            strokeWidth="1"
            strokeOpacity={line.opacity}
          />
        ))}
        {firstViewVerticalLines.map((line, index) => (
          <line
            key={`v-first-${index}`}
            x1={line.x}
            y1="0"
            x2={line.x}
            y2={line.length}
            stroke="url(#verticalGradient)"
            strokeWidth="1"
            strokeOpacity={line.opacity}
          />
        ))}
        {secondViewHorizontalLines.map((line, index) => (
          <line
            key={`h-second-${index}`}
            x1="0"
            y1={line.y}
            x2={line.length}
            y2={line.y}
            stroke="url(#horizontalGradient)"
            strokeWidth="1"
            strokeOpacity={line.opacity}
          />
        ))}
        {secondViewVerticalLines.map((line, index) => (
          <line
            key={`v-second-${index}`}
            x1={line.x}
            y1="0"
            x2={line.x}
            y2={line.length}
            stroke="url(#verticalGradient)"
            strokeWidth="1"
            strokeOpacity={line.opacity}
          />
        ))}
      </svg>
      
      <div 
        className="grid-content-overlay"
        style={{ 
          '--scroll-progress': scrollProgress,
          '--card-scaled-width': `${cardScaledWidth}px`,
          '--card-scaled-height': `${cardScaledHeight}px`,
          '--grid-size': `${gridSize}px`,
        } as React.CSSProperties}
      >
        {/* Center card fill layers - covers the CenterCard on hover */}
        {/* Box9 hover fill */}
        <div 
          className="center-card-fill-layer center-card-fill-layer--box9" 
          aria-hidden="true"
          style={{
            backgroundImage: `url(${getCellFillImage(14)})`,
            transitionDelay: getCellTransitionDelay(14),
          }}
        />
        {/* Box2 hover fill */}
        <div 
          className="center-card-fill-layer center-card-fill-layer--box2" 
          aria-hidden="true"
          style={{
            backgroundImage: `url(${getBox2FillImage(14)})`,
            transitionDelay: getBox2TransitionDelay(14),
          }}
        />
        
        {gridCells.map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className={`grid-cell ${cell.index === 1 ? 'grid-cell--box2' : ''} ${cell.index === 8 ? 'grid-cell--box9' : ''}`}
            style={{
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
            }}
          >
            {/* Box9 hover fill layer */}
            <div 
              className="grid-cell-image-fill grid-cell-image-fill--box9" 
              aria-hidden="true"
              style={{
                backgroundImage: `url(${getCellFillImage(cell.index)})`,
                transitionDelay: getCellTransitionDelay(cell.index),
              }}
            />
            
            {/* Box2 hover fill layer */}
            <div 
              className="grid-cell-image-fill grid-cell-image-fill--box2" 
              aria-hidden="true"
              style={{
                backgroundImage: `url(${getBox2FillImage(cell.index)})`,
                transitionDelay: getBox2TransitionDelay(cell.index),
              }}
            />
            
            <div className="grid-cell-content">
              {getBoxInteraction(cell.index, scrollProgress)}
            </div>
          </div>
        ))}
      </div>
      
      <section className="pinned-section">
        <div className="pinned-content">
          <div 
            className="center-card-wrapper"
            style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}
          >
            {scrollProgress < 0.5 ? (
              <div
                style={{
                  '--scroll-progress': scrollProgress,
                  '--center-reveal-delay': '0.7s',
                  '--center-name-opacity': 1 - Math.min(1, Math.max(0, scrollProgress * 2)),
                  '--center-name-max-height': `${100 * (1 - Math.min(1, Math.max(0, scrollProgress * 2)))}px`,
                  '--center-links-opacity': Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2)),
                  '--center-links-max-height': `${100 * Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2))}px`,
                } as React.CSSProperties}
              >
                <CenterCard
                  key="center-card-first"
                  startReveal
                  scrollHint="Scroll down"
                  highlightSegments={["Scarlet", "Bank of England", "McKinsey Design"]}
                  text={
                    "Currently designing digital experiences to accelerate medical software devices to market at Scarlet.\nPreviously at the Bank of England and McKinsey Design."
                  }
                />
              </div>
            ) : (
              <div
                style={{
                  '--scroll-progress': scrollProgress,
                  '--center-reveal-delay': '0s',
                  '--center-text-color': '#ffffff',
                  '--center-name-opacity': 1 - Math.min(1, Math.max(0, scrollProgress * 2)),
                  '--center-name-max-height': `${100 * (1 - Math.min(1, Math.max(0, scrollProgress * 2)))}px`,
                  '--center-links-opacity': Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2)),
                  '--center-links-max-height': `${100 * Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2))}px`,
                } as React.CSSProperties}
              >
                <CenterCard
                  key="center-card-second"
                  startReveal
                  text={
                    "Designing digital products\nat the intersection of\nUX, healthcare and AI"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
