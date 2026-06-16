import React from 'react';
import './TypedText.css';

export interface TypedTextProps {
  text: string;
  charDelay?: number;
  startDelay?: number;
  pauseAfterIndex?: number;
  pauseDuration?: number;
  className?: string;
}

const TypedText: React.FC<TypedTextProps> = ({
  text,
  charDelay = 40,
  startDelay = 0,
  pauseAfterIndex,
  pauseDuration = 0,
  className,
}) => (
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

export default TypedText;
