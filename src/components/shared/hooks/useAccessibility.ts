import { useCallback, useEffect, useRef } from 'react';

export interface AccessibilityOptions {
  announcements?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

/**
 * Hook for managing accessibility features
 */
export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    announcements = true,
    focusManagement = true,
    keyboardNavigation = true,
  } = options;

  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create screen reader announcement area
  useEffect(() => {
    if (!announcements) return;

    const announcementArea = document.createElement('div');
    announcementArea.setAttribute('aria-live', 'polite');
    announcementArea.setAttribute('aria-atomic', 'true');
    announcementArea.className = 'sr-only';
    announcementArea.id = 'accessibility-announcements';

    document.body.appendChild(announcementArea);
    announcementRef.current = announcementArea;

    return () => {
      if (announcementArea.parentNode) {
        announcementArea.parentNode.removeChild(announcementArea);
      }
    };
  }, [announcements]);

  // Announce message to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcements || !announcementRef.current) return;

      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;

      // Clear message after it's announced
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    },
    [announcements]
  );

  // Focus management utilities
  const focusTrap = useCallback(
    (container: HTMLElement) => {
      if (!focusManagement) return () => {};

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => {
        container.removeEventListener('keydown', handleKeyDown);
      };
    },
    [focusManagement]
  );

  // Auto-focus first interactive element
  const autoFocus = useCallback(
    (container: HTMLElement) => {
      if (!focusManagement) return;

      const focusableElement = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      focusableElement?.focus();
    },
    [focusManagement]
  );

  // Skip to content functionality
  const skipToContent = useCallback(
    (targetId: string) => {
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announce(
          `Skipped to ${target.getAttribute('aria-label') || 'main content'}`
        );
      }
    },
    [announce]
  );

  // Keyboard navigation helpers
  const handleArrowNavigation = useCallback(
    (
      e: KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      onIndexChange: (index: number) => void
    ) => {
      if (!keyboardNavigation) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          onIndexChange(nextIndex);
          items[nextIndex]?.focus();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex =
            currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          onIndexChange(prevIndex);
          items[prevIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          onIndexChange(0);
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          const lastIndex = items.length - 1;
          onIndexChange(lastIndex);
          items[lastIndex]?.focus();
          break;
      }
    },
    [keyboardNavigation]
  );

  // ARIA helpers
  const setAriaExpanded = useCallback(
    (element: HTMLElement, expanded: boolean) => {
      element.setAttribute('aria-expanded', expanded.toString());
    },
    []
  );

  const setAriaPressed = useCallback(
    (element: HTMLElement, pressed: boolean) => {
      element.setAttribute('aria-pressed', pressed.toString());
    },
    []
  );

  const setAriaSelected = useCallback(
    (element: HTMLElement, selected: boolean) => {
      element.setAttribute('aria-selected', selected.toString());
    },
    []
  );

  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement, id: string) => {
    element.setAttribute('aria-describedby', id);
  }, []);

  // High contrast mode detection
  const isHighContrastMode = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    return mediaQuery.matches;
  }, []);

  // Reduced motion detection
  const prefersReducedMotion = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  }, []);

  return {
    announce,
    focusTrap,
    autoFocus,
    skipToContent,
    handleArrowNavigation,
    setAriaExpanded,
    setAriaPressed,
    setAriaSelected,
    setAriaLabel,
    setAriaDescribedBy,
    isHighContrastMode,
    prefersReducedMotion,
  };
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
      previouslyFocusedElement.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for managing live regions
 */
export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    liveRegionRef.current = region;

    return () => {
      if (region.parentNode) {
        region.parentNode.removeChild(region);
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!liveRegionRef.current) return;

      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;

      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    },
    []
  );

  return { announce };
}
