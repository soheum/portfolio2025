import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';
import '../App.css';
import CenterCard from '../components/CenterCard';
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
  const [isBox2Hovered, setIsBox2Hovered] = useState(false);
  const [isBox9Hovered, setIsBox9Hovered] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const scrollShellRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });

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
    }, 1400);
    return () => clearTimeout(timer);
  }, []);
  
  // Set scrollProgress to 1 (grid view) permanently - no scrolling needed
  const scrollProgress = 1;

  const getBoxInteraction = (boxIndex: number, progress: number) => {
    switch (boxIndex) {
      case 0:
        return <Box1 progress={progress} />;
      case 1:
        return <Box2 progress={progress} onHoverChange={setIsBox2Hovered} />;
      case 2:
        return <Box3 progress={progress} />;
      case 8:
        return <Box9 progress={progress} onHoverChange={setIsBox9Hovered} />;
      case 9:
        return <Box10 progress={progress} />;
      case 11:
        return <Box12 progress={progress} />;
      case 15:
        return <Box10 progress={progress} />;
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
      5: '/img/Grid/Box9.jpg',   // Middle-left
      6: '/img/Grid/Box9.jpg',   // Middle-center-left
      7: '/img/Grid/Box9.jpg',   // Middle-center-right (to the right of center card)
      8: '/img/Grid/Box9.jpg',   // Middle-right (Box9 itself - won't show, this cell is excluded)
      9: '/img/Grid/Box9.jpg',   // Bottom-left
      10: '/img/Grid/Box9.jpg',  // Bottom-center-left
      11: '/img/Grid/Box9.jpg',  // Bottom-center-right (Box12)
      12: '/img/Grid/Box9_10_1.jpg',  // Bottom-right-left
      13: '/img/Grid/Box9.jpg',  // Bottom-right
      14: '/img/Grid/Box9.jpg',  // Center card position (separate from grid cells)
      15: '/img/Grid/Box9.jpg',  // New cell next to Box2
      16: '/img/Grid/Box9_5.jpg',  // New cell above Box9
      17: '/img/Grid/Box9_8.jpg',  // New cell immediately above index 16
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

  // Get animation delay for sequential box reveal
  // After line animation: Center card (0s) → Box2 (1s) → Box10 (1.2s) → Box1 (1.4s) → Box12 (1.6s) → Others (1.8s)
  const getBoxRevealDelay = (cellIndex: number): string => {
    const delayMap: { [key: number]: string } = {
      1: '0.8s',      // Box 2 - first box
      9: '1.2s',    // Box 10 - second box
      0: '1.4s',    // Box 1 - third box
      11: '1.6s',   // Box 12 - fourth box
    };
    return delayMap[cellIndex] || '1.8s'; // All other boxes appear last
  };

  // BOX 2 HOVER EFFECT
  // Define which image appears in each cell when Box2 is hovered
  // Box2 is at cell index 1
  // You can customize these images independently from Box9
  const getBox2FillImage = (cellIndex: number): string => {
    const imageMap: { [key: number]: string } = {
      0: '/img/Grid/Box9.jpg',   // Top-left
      1: '/img/Grid/Box9.jpg',   // Top-center-left (Box2 itself - won't show, this cell is excluded)
      2: '/img/Grid/Box9.jpg',   // Top-center-right
      3: '/img/Grid/Box9.jpg',   // Top-right-left
      4: '/img/Grid/Box9.jpg',   // Top-right
      5: '/img/Grid/Box9.jpg',   // Middle-left
      6: '/img/Grid/Box2_4.jpg',    // Middle-center-left
      7: '/img/Grid/Box2_3.jpg',    // Middle-center-right
      8: '/img/Grid/Box9.jpg',    // Middle-right (Box9)
      9: '/img/Grid/Box9.jpg',    // Bottom-left
      10: '/img/Grid/Box9.jpg',   // Bottom-center-left
      11: '/img/Grid/Box9.jpg',  // Bottom-center-right (Box12)
      12: '/img/Grid/Box9.jpg',   // Bottom-right-left
      13: '/img/Grid/Box9.jpg',   // Bottom-right
      14: '/img/Grid/Box9.jpg',  // Center card position
      15: '/img/Grid/Box2_2.jpg',  // New cell next to Box2
      16: '/img/Grid/Box9.jpg',  // New cell above Box9
      17: '/img/Grid/Box2_1.jpg',  // New cell immediately above index 16
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

  // 6x6 250px track map with a 2x2 center-card gap (500x500).
  // This keeps grid-cell placement aligned exactly to the drawn lines.
  const gridCells = [
    { row: 2, col: 0, index: 0 },  // Box1 moved two rows down
    { row: 1, col: 2, index: 1 },  // Box2 moved down and closer to center
    { row: 0, col: 2, index: 2 },
    { row: 0, col: 3, index: 3 },
    { row: 0, col: 4, index: 4 },
    { row: 0, col: 5, index: 5 },
    { row: 1, col: 0, index: 6 },
    { row: 1, col: 1, index: 7 },
    { row: 1, col: 3, index: 15 }, // New box right next to Box2
    { row: 1, col: 4, index: 17 }, // New box immediately above index 16
    { row: 2, col: 4, index: 16 }, // New box above Box9
    { row: 3, col: 4, index: 8 },  // Box9 moved to bottom-right of CenterCard
    { row: 1, col: 5, index: 9 },  // Box10
    { row: 4, col: 0, index: 10 },
    { row: 4, col: 1, index: 11 }, // Box12
    { row: 4, col: 4, index: 12 },
    { row: 4, col: 5, index: 13 },
  ];

  const centerCardWidth = 500;
  const centerCardHeight = 500;
  const gridSize = 250;
  const gridTrackCount = 6;
  const gridSpan = gridSize * gridTrackCount;
  const canvasPadding = gridSize; // Equal extra draggable space on all sides
  const cardScaledWidth = gridSize;
  const cardScaledHeight = gridSize;
  const viewportWidth = vw || (typeof window !== 'undefined' ? window.innerWidth : 1920);
  const viewportHeight = vh || (typeof window !== 'undefined' ? window.innerHeight : 1080);
  const canvasWidth = Math.max(viewportWidth, gridSpan + canvasPadding * 2);
  const canvasHeight = Math.max(viewportHeight, gridSpan + canvasPadding * 2);
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const lineOpacity = 0.7;
  const firstOpacity = 1 - scrollProgress;
  const secondOpacity = scrollProgress;

  const recenterToCard = () => {
    const shell = scrollShellRef.current;
    if (!shell) {
      return;
    }
    const targetLeft = centerX - shell.clientWidth / 2;
    const targetTop = centerY - shell.clientHeight / 2;
    shell.scrollLeft = Math.max(0, targetLeft);
    shell.scrollTop = Math.max(0, targetTop);
  };

  useEffect(() => {
    // Recenter immediately and once more on the next frame
    // to avoid drift after scrollbars/layout settle.
    recenterToCard();
    const rafId = window.requestAnimationFrame(() => {
      recenterToCard();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [centerX, centerY, canvasWidth, canvasHeight, isLoading]);

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const shell = scrollShellRef.current;
    if (!shell) {
      return;
    }
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: shell.scrollLeft,
      startScrollTop: shell.scrollTop,
    };
    setIsDraggingCanvas(true);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const shell = scrollShellRef.current;
    if (!shell || !dragStateRef.current.isDragging) {
      return;
    }
    event.preventDefault();
    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    shell.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    shell.scrollTop = dragStateRef.current.startScrollTop - deltaY;
  };

  const stopCanvasDrag = () => {
    if (!dragStateRef.current.isDragging) {
      return;
    }
    dragStateRef.current.isDragging = false;
    setIsDraggingCanvas(false);
  };

  const firstViewHorizontalLines = [
    { y: centerY - centerCardHeight / 2, length: canvasWidth, opacity: firstOpacity * lineOpacity },
    { y: centerY + centerCardHeight / 2, length: canvasWidth, opacity: firstOpacity * lineOpacity },
  ];

  const firstViewVerticalLines = [
    { x: 0, length: canvasHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX - centerCardWidth / 2 - gridSize, length: canvasHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX - centerCardWidth / 2, length: canvasHeight, opacity: firstOpacity * lineOpacity },
    { x: centerX + centerCardWidth / 2, length: canvasHeight, opacity: firstOpacity * lineOpacity },
  ];

  const secondViewHorizontalLines = [
    { y: 0, length: canvasWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY - centerCardHeight / 2, length: canvasWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY - centerCardHeight / 2 - gridSize, length: canvasWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY + centerCardHeight / 2 + gridSize, length: canvasWidth, opacity: secondOpacity * lineOpacity },
    { y: centerY + centerCardHeight / 2, length: canvasWidth, opacity: secondOpacity * lineOpacity },
    { y: canvasHeight, length: canvasWidth, opacity: secondOpacity * lineOpacity },
  ];

  // Segmented divider at the vertical midpoint:
  // split side areas into 250x250 while keeping the 500px center uninterrupted.
  const secondViewSplitHorizontalSegments = [
    { y: centerY, x1: 0, x2: centerX - centerCardWidth / 2, opacity: secondOpacity * lineOpacity },
    { y: centerY, x1: centerX + centerCardWidth / 2, x2: canvasWidth, opacity: secondOpacity * lineOpacity },
  ];

  const secondViewVerticalLines = [
    { x: centerX - centerCardWidth / 2 - gridSize, length: canvasHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX - centerCardWidth / 2, length: canvasHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX + centerCardWidth / 2, length: canvasHeight, opacity: secondOpacity * lineOpacity },
    { x: centerX + centerCardWidth / 2 + gridSize, length: canvasHeight, opacity: secondOpacity * lineOpacity },
  ];

  // Segmented divider at the horizontal midpoint:
  // split top/bottom areas into 250x250 while keeping the 500px center uninterrupted.
  const secondViewSplitVerticalSegments = [
    { x: centerX, y1: 0, y2: centerY - centerCardHeight / 2, opacity: secondOpacity * lineOpacity },
    { x: centerX, y1: centerY + centerCardHeight / 2, y2: canvasHeight, opacity: secondOpacity * lineOpacity },
  ];

  // Loading animation uses the grid layout (second view) lines
  const loadingHorizontalLines = [
    { y: 0, length: canvasWidth },
    { y: centerY - centerCardHeight / 2, length: canvasWidth },
    { y: centerY - centerCardHeight / 2 - gridSize, length: canvasWidth },
    { y: centerY + centerCardHeight / 2 + gridSize, length: canvasWidth },
    { y: centerY + centerCardHeight / 2, length: canvasWidth },
    { y: canvasHeight, length: canvasWidth },
  ];

  const loadingSplitHorizontalSegments = [
    { y: centerY, x1: 0, x2: centerX - centerCardWidth / 2 },
    { y: centerY, x1: centerX + centerCardWidth / 2, x2: canvasWidth },
  ];

  const loadingVerticalLines = [
    { x: centerX - centerCardWidth / 2 - gridSize, length: canvasHeight },
    { x: centerX - centerCardWidth / 2, length: canvasHeight },
    { x: centerX + centerCardWidth / 2, length: canvasHeight },
    { x: centerX + centerCardWidth / 2 + gridSize, length: canvasHeight },
  ];

  const loadingSplitVerticalSegments = [
    { x: centerX, y1: 0, y2: centerY - centerCardHeight / 2 },
    { x: centerX, y1: centerY + centerCardHeight / 2, y2: canvasHeight },
  ];

  return (
    <div
      ref={scrollShellRef}
      className={`home-scroll-shell ${isDraggingCanvas ? 'is-dragging' : ''}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={stopCanvasDrag}
      onMouseLeave={stopCanvasDrag}
    >
    <div
      className="app-root"
      style={{
        '--canvas-width': `${canvasWidth}px`,
        '--canvas-height': `${canvasHeight}px`,
      } as React.CSSProperties}
    >
      <div 
        className={`grid-background ${isLoading ? 'loading' : ''}`}
        style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}
      />
      
      <svg 
        className={`grid-lines-svg-loading ${!isLoading ? 'fade-out' : ''}`}
        width={canvasWidth}
        height={canvasHeight}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 6, pointerEvents: 'none' }}
      >
          <defs>
            <linearGradient id="horizontalGradientLoading" x1="0" y1="0" x2={canvasWidth} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#101010" stopOpacity="1" />
              <stop offset="50%" stopColor="#585858" stopOpacity="1" />
              <stop offset="100%" stopColor="#101010" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="verticalGradientLoading" x1="0" y1="0" x2="0" y2={canvasHeight} gradientUnits="userSpaceOnUse">
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
          {loadingSplitHorizontalSegments.map((line, index) => {
            const delay = 0.5;
            const segmentLength = Math.max(0, line.x2 - line.x1);
            return (
              <line
                key={`h-loading-split-${index}`}
                x1={line.x1}
                y1={line.y}
                x2={line.x2}
                y2={line.y}
                stroke="url(#horizontalGradientLoading)"
                strokeWidth="1"
                strokeOpacity={lineOpacity}
                strokeDasharray={segmentLength}
                strokeDashoffset={segmentLength}
                className="grid-line-horizontal"
                style={{
                  '--line-length': `${segmentLength}`,
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
          {loadingSplitVerticalSegments.map((line, index) => {
            const delay = 0;
            const segmentLength = Math.max(0, line.y2 - line.y1);
            return (
              <line
                key={`v-loading-split-${index}`}
                x1={line.x}
                y1={line.y1}
                x2={line.x}
                y2={line.y2}
                stroke="url(#verticalGradientLoading)"
                strokeWidth="1"
                strokeOpacity={lineOpacity}
                strokeDasharray={segmentLength}
                strokeDashoffset={segmentLength}
                className="grid-line-vertical"
                style={{
                  '--line-length': `${segmentLength}`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties}
              />
            );
          })}
      </svg>

      <svg 
        className={`grid-lines-svg-static ${!isLoading ? 'visible' : ''}`}
        width={canvasWidth}
        height={canvasHeight}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="horizontalGradient" x1="0" y1="0" x2={canvasWidth} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#101010" stopOpacity="1" />
            <stop offset="50%" stopColor="#585858" stopOpacity="1" />
            <stop offset="100%" stopColor="#101010" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="verticalGradient" x1="0" y1="0" x2="0" y2={canvasHeight} gradientUnits="userSpaceOnUse">
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
        {secondViewSplitHorizontalSegments.map((line, index) => (
          <line
            key={`h-second-split-${index}`}
            x1={line.x1}
            y1={line.y}
            x2={line.x2}
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
        {secondViewSplitVerticalSegments.map((line, index) => (
          <line
            key={`v-second-split-${index}`}
            x1={line.x}
            y1={line.y1}
            x2={line.x}
            y2={line.y2}
            stroke="url(#verticalGradient)"
            strokeWidth="1"
            strokeOpacity={line.opacity}
          />
        ))}
      </svg>
      
      <div 
        className={`grid-content-overlay ${!isLoading ? 'visible' : ''}`}
        style={{ 
          '--scroll-progress': scrollProgress,
          '--card-scaled-width': `${cardScaledWidth}px`,
          '--card-scaled-height': `${cardScaledHeight}px`,
          '--center-card-width': `${centerCardWidth}px`,
          '--center-card-height': `${centerCardHeight}px`,
          '--grid-size': `${gridSize}px`,
        } as React.CSSProperties}
      >
        {/* Center card fill layers - covers the CenterCard on hover */}
        {/* Box9 hover fill */}
        <div 
          className="center-card-fill-layer center-card-fill-layer--box9" 
          aria-hidden="true"
          style={{
            backgroundImage: 'none',
            transitionDelay: getCellTransitionDelay(14),
          }}
        />
        {/* Box2 hover fill */}
        <div 
          className="center-card-fill-layer center-card-fill-layer--box2" 
          aria-hidden="true"
          style={{
            backgroundImage: 'none',
            transitionDelay: getBox2TransitionDelay(14),
          }}
        />
        
        {gridCells.map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className={`grid-cell ${cell.index === 1 ? 'grid-cell--box2' : ''} ${cell.index === 8 ? 'grid-cell--box9' : ''} ${!isLoading ? 'grid-cell--reveal' : ''}`}
            style={{
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
              animationDelay: getBoxRevealDelay(cell.index),
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
            className={`center-card-wrapper ${!isLoading ? 'loaded' : 'loading'}`}
            style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}
          >
            <div
              style={{
                '--scroll-progress': scrollProgress,
                '--center-reveal-delay': '0.7s',
                '--center-name-opacity': 1,
                '--center-name-max-height': '6.25rem', /* 100px at 16px base */
                '--center-name-color': isBox2Hovered || isBox9Hovered ? '#000000' : '#ffffff',
                '--center-text-muted-color': '#000000',
                '--center-links-opacity': 1,
                '--center-links-max-height': '20rem',
              } as React.CSSProperties}
            >
              <CenterCard
                key="center-card-grid-view"
                startReveal
                highlightSegments={['Scarlet', 'Bank of England', 'McKinsey & Company']}
                focusLineIndex={isBox2Hovered ? 1 : isBox9Hovered ? 5 : null}
                text={
                  "[1] A strong believer that creativity thrives at the intersection of contrasting values\n[2] A digital designer, exploring how AI can help accelerate medical devices to market at Scarlet\n[3] A ceramist by practice, expressing creativity through material and form\n[4] A visual storyteller, curating thoughtfully designed spaces through photography and text\n[5] Previously a public sector product designer at the Bank of England, transforming regulatory data collection process\n[6] Previously a digital product designer at McKinsey & Company, helping clients to build digital businesses"
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}

export default HomePage;
