'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

/**
 * TopLoader
 * A lightweight top-of-page progress bar for SPA navigations.
 *
 * Notes (App Router):
 * - App Router does not expose routeChangeStart/Complete events globally.
 * - We approximate navigation by observing pathname + search params changes.
 * - The bar animates quickly to provide visual feedback without being intrusive.
 */
export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeKey = useMemo(() => {
    const q = searchParams?.toString();
    return `${pathname ?? ''}${q ? `?${q}` : ''}`;
  }, [pathname, searchParams]);

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const trickleTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (trickleTimer.current) window.clearInterval(trickleTimer.current);
      if (finishTimer.current) window.clearTimeout(finishTimer.current);
    };
  }, []);

  const start = () => {
    if (visible) return; // already running
    setVisible(true);
    setProgress(0.08);

    // Trickle towards 80%
    trickleTimer.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 0.8) return p;
        // small easing increments
        const increment = (0.8 - p) * 0.15; // ease towards 0.8
        return Math.min(p + increment, 0.8);
      });
    }, 200);
  };

  const finish = (delay = 250) => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
    finishTimer.current = window.setTimeout(() => {
      // Complete to 100%
      setProgress(1);
      // Hide after transition completes
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
        if (trickleTimer.current) {
          window.clearInterval(trickleTimer.current);
          trickleTimer.current = null;
        }
      }, 200);
    }, delay);
  };

  // Avoid showing on the very first mount
  const firstLoad = useRef(true);

  // When route (URL) changes, start and then finish shortly after
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    start();
    // If navigation is fast, complete quickly; if not, the trickle keeps animating
    finish(350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  // Do not render when not visible
  const opacity = visible ? 1 : 0;
  const width = `${Math.max(0, Math.min(progress, 1)) * 100}%`;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-[9999]"
      style={{ opacity, transition: 'opacity 150ms ease-out' }}
    >
      <div
        className="h-1 bg-primary/80"
        style={{ width, transition: 'width 200ms ease-out' }}
      >
        {/* Shimmer */}
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/70 via-primary/0 to-transparent">
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopLoader;
