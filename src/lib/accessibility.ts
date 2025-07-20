/**
 * Accessibility utilities and helpers for WCAG 2.1 compliance
 */

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
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

    container.addEventListener('keydown', handleTabKey);

    // Focus the first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Restore focus to a previously focused element
   */
  static restoreFocus(element: HTMLElement | null) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for lists
   */
  static handleArrowNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Announce a message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create a visually hidden element for screen readers
   */
  static createScreenReaderOnly(text: string): HTMLSpanElement {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  private static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    // This is a simplified implementation
    // In a real app, you'd want a more robust color parsing library
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  static meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Check if contrast ratio meets WCAG AAA standards
   */
  static meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Form accessibility utilities
 */
export class FormAccessibility {
  /**
   * Associate label with form control
   */
  static associateLabel(labelElement: HTMLLabelElement, controlElement: HTMLElement) {
    const controlId = controlElement.id || `control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    controlElement.id = controlId;
    labelElement.setAttribute('for', controlId);
  }

  /**
   * Add error message to form control
   */
  static addErrorMessage(controlElement: HTMLElement, errorMessage: string) {
    const errorId = `${controlElement.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'text-sm text-destructive mt-1';
      errorElement.setAttribute('role', 'alert');
      controlElement.parentNode?.insertBefore(errorElement, controlElement.nextSibling);
    }

    errorElement.textContent = errorMessage;
    controlElement.setAttribute('aria-describedby', errorId);
    controlElement.setAttribute('aria-invalid', 'true');
  }

  /**
   * Remove error message from form control
   */
  static removeErrorMessage(controlElement: HTMLElement) {
    const errorId = `${controlElement.id}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.remove();
    }

    controlElement.removeAttribute('aria-describedby');
    controlElement.removeAttribute('aria-invalid');
  }
}

/**
 * Motion and animation utilities for accessibility
 */
export class MotionAccessibility {
  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Apply animation only if user doesn't prefer reduced motion
   */
  static conditionalAnimation(element: HTMLElement, animationClass: string) {
    if (!this.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  }

  /**
   * Create a media query listener for reduced motion preference
   */
  static onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    
    // Call immediately with current value
    callback(mediaQuery.matches);

    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handler);
  }
}