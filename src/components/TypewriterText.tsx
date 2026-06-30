import React, { useEffect, useRef, useState } from 'react';
import './TypewriterText.css';

export interface TypewriterTextProps {
  text: string;
  charDelay?: number;
  startDelay?: number;
  className?: string;
  active?: boolean;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  charDelay = 30,
  startDelay = 150,
  className,
  active = true,
  onComplete,
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);
  onCompleteRef.current = onComplete;
  const complete = visibleCount >= text.length;

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      hasCompletedRef.current = false;
      return;
    }

    setVisibleCount(0);
    hasCompletedRef.current = false;
  }, [text, active]);

  useEffect(() => {
    if (!active) return;

    if (complete) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    const delay = visibleCount === 0 ? startDelay : charDelay;
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, visibleCount, text.length, charDelay, startDelay, complete]);

  if (!active) return null;

  return (
    <span className={className}>
      <span className="typewriter-text__content">{text.slice(0, visibleCount)}</span>
      <span
        className={`typewriter-text__cursor${complete ? ' typewriter-text__cursor--hidden' : ''}`}
        aria-hidden="true"
      />
    </span>
  );
};

export default TypewriterText;
