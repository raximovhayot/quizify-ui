import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions
  extends IntersectionObserverInit {
  enabled?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { enabled = true, ...observerOptions } = options;
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!enabled || !target || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setInView(entry.isIntersecting);
          setEntry(entry);
        }
      },
      {
        threshold: 0,
        rootMargin: '100px',
        ...observerOptions,
      }
    );

    observer.observe(target);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, observerOptions]);

  return {
    ref: targetRef,
    inView,
    entry,
  };
}
