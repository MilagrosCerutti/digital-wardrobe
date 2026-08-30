import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Toggles the `dw-reveal-in` class once the element scrolls into view,
 * matching the approved HomePage's scroll-triggered reveal pattern.
 */
export function useScrollReveal<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  isRevealed: boolean;
} {
  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (isRevealed) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isRevealed]);

  return { ref, isRevealed };
}
