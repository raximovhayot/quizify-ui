import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: Orientation;
  touchDevice: boolean;
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

function getResponsiveState(): ResponsiveState {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const height = typeof window !== 'undefined' ? window.innerHeight : 768;
  const breakpoint = getBreakpoint(width);

  return {
    breakpoint,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    touchDevice: typeof window !== 'undefined' && 'ontouchstart' in window,
  };
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(getResponsiveState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setState(getResponsiveState());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setState(getResponsiveState());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return state;
}

/**
 * Hook to check if current breakpoint matches given breakpoint(s)
 */
export function useBreakpoint(breakpoint: Breakpoint | Breakpoint[]): boolean {
  const { breakpoint: currentBreakpoint } = useResponsive();

  if (Array.isArray(breakpoint)) {
    return breakpoint.includes(currentBreakpoint);
  }

  return currentBreakpoint === breakpoint;
}

/**
 * Hook to check if screen width is at least the given breakpoint
 */
export function useMinBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= breakpoints[breakpoint];
}

/**
 * Hook to check if screen width is below the given breakpoint
 */
export function useMaxBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width < breakpoints[breakpoint];
}

/**
 * Hook for viewport-specific values
 */
export function useViewport<T>(
  values: Partial<Record<Breakpoint, T>>
): T | undefined {
  const { breakpoint } = useResponsive();

  // Check current breakpoint first, then fallback to smaller breakpoints
  const orderedBreakpoints: Breakpoint[] = [
    '2xl',
    'xl',
    'lg',
    'md',
    'sm',
    'xs',
  ];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
    const bp = orderedBreakpoints[i];
    if (bp !== undefined && values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
}

/**
 * Hook for conditional rendering based on device capabilities
 */
export function useDeviceCapabilities() {
  const { touchDevice, isMobile } = useResponsive();

  const [supportsHover, setSupportsHover] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highDPI, setHighDPI] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check hover support
    setSupportsHover(window.matchMedia('(hover: hover)').matches);

    // Check motion preference
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    // Check DPI
    setHighDPI(window.devicePixelRatio > 1);
  }, []);

  return {
    touchDevice,
    isMobile,
    supportsHover,
    prefersReducedMotion,
    highDPI,
  };
}
