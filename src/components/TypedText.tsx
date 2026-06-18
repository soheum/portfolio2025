import React, { useEffect } from 'react';
import './TypedText.css';

export interface TypedTextProps {
  text: string;
  charDelay?: number;
  startDelay?: number;
  pauseAfterIndex?: number;
  pauseDuration?: number;
  className?: string;
  onComplete?: () => void;
}

const TYPED_CHAR_ANIMATION_MS = 100;

const TypedText: React.FC<TypedTextProps> = ({
  text,
  charDelay = 40,
  startDelay = 0,
  pauseAfterIndex,
  pauseDuration = 0,
  className,
  onComplete,
}) => {
  useEffect(() => {
    if (!onComplete || text.length === 0) return;

    const lastIndex = text.length - 1;
    const extra =
      pauseAfterIndex !== undefined && lastIndex > pauseAfterIndex ? pauseDuration : 0;
    const totalDelay = startDelay + lastIndex * charDelay + extra + TYPED_CHAR_ANIMATION_MS;

    const timer = window.setTimeout(onComplete, totalDelay);
    return () => window.clearTimeout(timer);
  }, [text, charDelay, startDelay, pauseAfterIndex, pauseDuration, onComplete]);

  return (
    <span className={className}>
      {Array.from(text).map((char, i) => {
        const extra = pauseAfterIndex !== undefined && i > pauseAfterIndex ? pauseDuration : 0;
        return (
          <span
            key={i}
            className="typed-char"
            style={{ animationDelay: `${startDelay + i * charDelay + extra}ms` } as React.CSSProperties}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default TypedText;
