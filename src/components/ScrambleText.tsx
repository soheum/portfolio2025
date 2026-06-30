import React, { useState, useRef, useCallback, useEffect } from 'react';

/** Characters used for the random scramble effect (capital letters only) */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

interface ScrambleTextProps {
  /** The final text to show when not scrambling and after the effect ends */
  children: string;
  /** Optional class name for the wrapper span */
  className?: string;
  /** How long to scramble in ms before revealing the final text (default 500) */
  duration?: number;
  /** Interval in ms between random updates (default 100) */
  interval?: number;
}

/**
 * Wraps text in a span. On hover, each character scrambles randomly for a set
 * duration, then resolves to the correct text.
 */
const ScrambleText: React.FC<ScrambleTextProps> = ({
  children,
  className,
  duration = 500,
  interval = 100,
}) => {
  const finalText = String(children);
  const [displayText, setDisplayText] = useState(finalText);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runEffect = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsActive(true);

    const tick = () => {
      setDisplayText(
        finalText
          .split('')
          .map((char) => (char === ' ' ? ' ' : randomChar()))
          .join('')
      );
    };

    tick();
    intervalRef.current = setInterval(tick, interval);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplayText(finalText);
      setIsActive(false);
    }, duration);
  }, [finalText, duration, interval]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span className={className} onMouseEnter={runEffect}>
      {isActive ? displayText : finalText}
    </span>
  );
};

export default ScrambleText;
