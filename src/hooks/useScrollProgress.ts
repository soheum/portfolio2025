import { useEffect, useState } from 'react';

/**
 * Simple hook that tracks scroll progress from 0 to 1
 * Maps scroll position to a normalized progress value
 * 
 * @param startOffset - Scroll position where progress starts (default: 0)
 * @param endOffset - Scroll position where progress ends (default: scrollable height)
 * @returns Progress value between 0 and 1
 */
export function useScrollProgress(
  startOffset: number = 0,
  endOffset?: number
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const maxScroll = endOffset ?? document.documentElement.scrollHeight - window.innerHeight;
      const scrollRange = maxScroll - startOffset;
      
      if (scrollRange <= 0) {
        setProgress(0);
        return;
      }

      // Formula: clamp((scrollY - start) / (end - start), 0, 1)
      const rawProgress = (scrollY - startOffset) / scrollRange;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      
      setProgress(clampedProgress);
    };

    // Initial update
    updateProgress();

    // Listen to scroll events
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [startOffset, endOffset]);

  return progress;
}
