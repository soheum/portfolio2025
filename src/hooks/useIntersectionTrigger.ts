import { useEffect, useState, useRef, RefObject } from 'react';

export interface IntersectionOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

/**
 * Hook that uses IntersectionObserver to trigger animations when elements enter viewport
 * Independent of scroll step size - works with any scroll jump
 * 
 * @param options - IntersectionObserver options
 * @returns [ref, isIntersecting, intersectionRatio]
 */
export function useIntersectionTrigger(
  options: IntersectionOptions = {}
): [RefObject<HTMLDivElement | null>, boolean, number] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      threshold = 0.1,
      rootMargin = '0px',
      root = null,
      triggerOnce = false,
    } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isCurrentlyIntersecting = entry.isIntersecting;
          const ratio = entry.intersectionRatio;

          setIntersectionRatio(ratio);
          
          if (triggerOnce && hasTriggeredRef.current) {
            return;
          }

          setIsIntersecting(isCurrentlyIntersecting);
          
          if (isCurrentlyIntersecting && triggerOnce) {
            hasTriggeredRef.current = true;
          }
        });
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isIntersecting, intersectionRatio];
}

/**
 * Hook that provides intersection state for multiple thresholds
 * Useful for creating multi-stage animations
 * 
 * @param thresholds - Array of threshold values (0-1)
 * @param rootMargin - Root margin for IntersectionObserver
 * @returns [ref, activeThreshold] - activeThreshold is the highest threshold currently met
 */
export function useMultiThresholdIntersection(
  thresholds: number[] = [0.1, 0.25, 0.5, 0.75, 1],
  rootMargin: string = '0px'
): [RefObject<HTMLDivElement | null>, number] {
  const [activeThreshold, setActiveThreshold] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create observers for each threshold
    const observers: IntersectionObserver[] = [];
    const thresholdStates = new Map<number, boolean>();

    thresholds.forEach((threshold) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            thresholdStates.set(threshold, entry.isIntersecting);
            
            // Find the highest threshold that's currently intersecting
            const active = Math.max(
              ...Array.from(thresholdStates.entries())
                .filter(([_, isIntersecting]) => isIntersecting)
                .map(([thresh]) => thresh),
              0
            );
            
            setActiveThreshold(active);
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [thresholds, rootMargin]);

  return [elementRef, activeThreshold];
}
