import React from 'react';
import './Box2.css';

interface Box2Props {
  progress: number;
  onHoverChange?: (isHovered: boolean) => void;
  isHovered?: boolean;
}

const Box2: React.FC<Box2Props> = ({ progress, onHoverChange, isHovered = false }) => {
  const handleClick = () => {
    window.open('/project', '_blank', 'noopener,noreferrer');
  };

  // Calculate fade-in opacity based on scroll progress
  // Start fading in at progress 0.3, fully visible at progress 0.7
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  
  // Box2 animation - adjust as needed based on grid position
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = -30 * (1 - fadeOpacity);

  // Second view = scroll past middle (where Box2 is emphasized)
  const isSecondView = progress >= 0.5;

  return (
    <div 
      className={`box2-container ${isSecondView ? 'second-view' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      style={{ 
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
      }}
    >
      <>
        <img
          src="/logo/scarlet_logo.svg"
          alt="Scarlet"
          className="box2-scarlet-logo"
        />
        <div className="arrow-icon-wrapper">
          <img 
            src="/img/ArrowUpRight.svg" 
            alt="Arrow Up Right" 
            className="arrow-icon"
          />
        </div>

        <div className="file-stack">
          {/* Back file - rotates -9.81 degrees */}
          <div className="file-component file-back-2">
            <img 
              src="/img/FileText.svg" 
              alt="file icon" 
              className="file-icon"
            />
            <span className="file-name">Submission Report.pdf</span>
          </div>
          
          {/* Middle file - rotates -2.91 degrees */}
          <div className="file-component file-back-1">
            <img 
              src="/img/FileText.svg" 
              alt="file icon" 
              className="file-icon"
            />
            <span className="file-name">Submission Report.pdf</span>
          </div>
          
          {/* Front file - rotates 8 degrees */}
          <div className="file-component file-front">
            <img 
              src="/img/FileText.svg" 
              alt="file icon" 
              className="file-icon"
            />
            <span className="file-name">Submission Report.pdf</span>
          </div>
        </div>
      </>
    </div>
  );
};

export default Box2;
