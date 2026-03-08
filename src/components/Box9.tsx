import React, { useState, useEffect, useRef } from 'react';
import './Box9.css';

/** Route opened when clicking Box9. Temporarily using PDF until project page is ready. */
const BOX9_PROJECT_URL = '/files/Kan_portfolio.pdf';
// const BOX9_PROJECT_URL = '/kan'; // Uncomment when ready to show project page

interface Box9Props {
  progress: number;
  onHoverChange?: (isHovered: boolean) => void;
}

const Box9: React.FC<Box9Props> = ({ progress, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [budgetPercentage, setBudgetPercentage] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Calculate fade-in opacity based on scroll progress
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  
  // Box9 is at row 1, col 4 (middle-right) - slides in from right
  const translateX = 30 * (1 - fadeOpacity);
  const translateY = 0;

  // Open Box9 project page in new tab when clicked
  const handleClick = () => {
    window.open(BOX9_PROJECT_URL, '_blank', 'noopener,noreferrer');
  };

  // Counter animation effect
  useEffect(() => {
    if (isHovered) {
      // Animate with pauses: 0→30% (0.8s), pause (0.5s), 30→60% (0.8s), pause (0.5s), 60→100% (0.8s)
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        let percentage = 0;
        
        if (elapsed < 800) {
          // First section: 0 to 30% (0-0.8s)
          percentage = (elapsed / 800) * 30;
        } else if (elapsed < 1300) {
          // Pause: stay at 30% (0.8-1.3s)
          percentage = 30;
        } else if (elapsed < 2100) {
          // Second section: 30 to 60% (1.3-2.1s)
          percentage = 30 + ((elapsed - 1300) / 800) * 30;
        } else if (elapsed < 2600) {
          // Pause: stay at 60% (2.1-2.6s)
          percentage = 60;
        } else if (elapsed < 3400) {
          // Third section: 60 to 100% (2.6-3.4s)
          percentage = 60 + ((elapsed - 2600) / 800) * 40;
        } else {
          percentage = 100;
        }
        
        setBudgetPercentage(Math.round(percentage));
        
        if (elapsed < 3400) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animate();
    } else {
      // Reverse animation
      const startValue = budgetPercentage;
      const startTime = Date.now();
      const duration = 1200; // Faster reverse but proportional to forward
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setBudgetPercentage(Math.round(startValue * (1 - progress)));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animate();
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered]);

  // On second view, when not hovered: pulse the percentage to emphasize link
  const isSecondView = progress >= 0.5;
  const showIdlePulse = isSecondView && !isHovered;

  return (
    <div 
      className={`box9-container ${isHovered ? 'hovered' : ''} ${showIdlePulse ? 'idle-pulse' : ''}`}
      style={{ 
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(false);
      }}
      onClick={handleClick}
    >
      <div className="budget-percentage-counter">
        {budgetPercentage}%
      </div>

      <img
        src="/logo/mck_logo.png"
        alt="McKinsey & Company"
        className="box9-mck-logo"
      />

      <div className="arrow-icon-wrapper">
        <img 
          src="/img/ArrowUpRight.svg" 
          alt="Arrow Up Right" 
          className="arrow-icon"
        />
      </div>
      
      <div className="budget-chart">
        <div className="budget-section debt-payment">
          <span className="budget-label">Fun money</span>
          <span className="budget-percentage">40%</span>
        </div>
        <div className="budget-section emergency-savings">
          <span className="budget-label">Savings</span>
          <span className="budget-percentage">30%</span>
        </div>
        <div className="budget-section fixed-expense">
          <span className="budget-label">Fixed expense</span>
          <span className="budget-percentage">30%</span>
        </div>
      </div>
    </div>
  );
};

export default Box9;
