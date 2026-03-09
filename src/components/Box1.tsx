import React, { useState, useEffect, useRef } from 'react';
import './Box1.css';

interface Box1Props {
  progress: number;
}

const Box1: React.FC<Box1Props> = ({ progress }) => {
  const [count, setCount] = useState(0);
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [, setTextClicked] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const badgeNumRef = useRef<HTMLSpanElement>(null);
  const ringProgressRef = useRef<SVGCircleElement>(null);

  const BADGE_DELAY = 500;

  // Initialize character spans on mount
  useEffect(() => {
    if (!textRef.current) return;
    
    const textElement = textRef.current;
    const raw = textElement.textContent || 'click me';
    textElement.textContent = '';
    
    Array.from(raw).forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.setProperty('--i', i.toString());
      textElement.appendChild(span);
    });
  }, []);

  // Helper to reset animation
  const resetAnimation = (element: HTMLElement | null, className: string) => {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth; // Force reflow
    element.classList.add(className);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClick = () => {
    if (!badgeRef.current || !badgeNumRef.current || !textRef.current) return;

    setTextClicked(true);
    resetAnimation(textRef.current, 'letters-animate');

    const firstTime = !isBadgeVisible;
    if (firstTime) {
      setIsBadgeVisible(true);
      setCount(1);
      if (badgeNumRef.current) {
        badgeNumRef.current.textContent = '1';
      }
    }

    // Reset and animate ring
    resetAnimation(badgeRef.current, 'ring-animate');

    // Handle ring animation end
    const onRingEnd = (e: AnimationEvent) => {
      if (e.target === ringProgressRef.current && e.animationName === 'ringFill') {
        if (!firstTime) {
          const newCount = count + 1;
          setCount(newCount);
          if (badgeNumRef.current) {
            badgeNumRef.current.textContent = newCount.toString();
          }
        }
        // Delay before badge bounce
        setTimeout(() => {
          resetAnimation(badgeRef.current, 'badge-animate');
        }, BADGE_DELAY);
        badgeRef.current?.removeEventListener('animationend', onRingEnd);
      }
    };
    badgeRef.current.addEventListener('animationend', onRingEnd);
  };

  // Calculate fade-in opacity based on scroll progress
  // Start fading in at progress 0.3, fully visible at progress 0.7
  const fadeOpacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.4));
  
  // Box1 is at row 0, col 0 (top-left) - slides in from top-left
  const translateX = -30 * (1 - fadeOpacity);
  const translateY = -30 * (1 - fadeOpacity);

  return (
    <div 
      className="box1-container"
      style={{ 
        opacity: fadeOpacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
      }}
    >
    
    </div>
  );
};

export default Box1;
