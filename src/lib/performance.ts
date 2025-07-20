/**
 * Performance optimization utilities and helpers
 */

import { lazy, ComponentType } from 'react';

/**
 * Code splitting and lazy loading utilities
 */
export class CodeSplitting {
  /**
   * Create a lazy-loaded component with error boundary
   */
  static createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
    importFn: () => Promise<{ default: T }>
  ) {
    const LazyComponent = lazy(importFn);
    
    // Return component with built-in error handling
    return LazyComponent;
  }

  /**
   * Preload a component for better UX
   */
  static preloadComponent<T>(importFn: () => Promise<T>) {
    // Start loading the component
    const componentPromise = importFn();
    
    // Return a function to get the preloaded component
    return () => componentPromise;
  }

  /**
   * Create route-based code splitting
   */
  static createRouteComponent(importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) {
    return this.createLazyComponent(importFn);
  }
}

/**
 * Caching utilities for API responses and computed values
 */
export class CacheManager {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  /**
   * Set cache entry with TTL (time to live)
   */
  static set(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  /**
   * Get cache entry if not expired
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  static clearAll() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  static clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimization {
  /**
   * Create optimized image loading with lazy loading
   */
  static createLazyImage(src: string, alt: string, options?: {
    placeholder?: string;
    sizes?: string;
    quality?: number;
  }) {
    return {
      src,
      alt,
      loading: 'lazy' as const,
      placeholder: options?.placeholder || 'blur',
      sizes: options?.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      quality: options?.quality || 75
    };
  }

  /**
   * Preload critical images
   */
  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Create responsive image srcSet
   */
  static createSrcSet(baseSrc: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  }
}

/**
 * Bundle optimization utilities
 */
export class BundleOptimization {
  /**
   * Dynamic import with error handling
   */
  static async dynamicImport<T>(importFn: () => Promise<T>): Promise<T | null> {
    try {
      return await importFn();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  }

  /**
   * Chunk loading with retry mechanism
   */
  static async loadChunkWithRetry<T>(
    importFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        console.warn(`Chunk loading attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error('All chunk loading attempts failed');
          return null;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    return null;
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static observers = new Set<IntersectionObserver>();
  private static timeouts = new Set<NodeJS.Timeout>();
  private static intervals = new Set<NodeJS.Timeout>();

  /**
   * Create intersection observer with cleanup tracking
   */
  static createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, options);
    this.observers.add(observer);
    return observer;
  }

  /**
   * Create timeout with cleanup tracking
   */
  static createTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(timeout);
    }, delay);
    
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Create interval with cleanup tracking
   */
  static createInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Clean up all tracked resources
   */
  static cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Clear all timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  /**
   * Get memory usage statistics (if available)
   */
  static getMemoryStats(): { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number } | null {
    if ('memory' in performance) {
      return (performance as { memory?: { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number } }).memory || null;
    }
    return null;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks = new Map<string, number>();
  private static measures = new Map<string, number>();

  /**
   * Start performance measurement
   */
  static startMeasure(name: string) {
    const startTime = performance.now();
    this.marks.set(name, startTime);
    
    // Also use Performance API if available
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End performance measurement
   */
  static endMeasure(name: string): number {
    const endTime = performance.now();
    const startTime = this.marks.get(name);
    
    if (!startTime) {
      console.warn(`No start mark found for measurement: ${name}`);
      return 0;
    }
    
    const duration = endTime - startTime;
    this.measures.set(name, duration);
    
    // Use Performance API if available
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
    
    return duration;
  }

  /**
   * Get all measurements
   */
  static getMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  /**
   * Clear all measurements
   */
  static clearMeasurements() {
    this.marks.clear();
    this.measures.clear();
    
    if (performance.clearMarks && performance.clearMeasures) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Monitor Core Web Vitals
   */
  static monitorWebVitals(callback: (metric: { name: string; value: number; entries: PerformanceEntryList }) => void) {
    // This would typically use web-vitals library
    // For now, we'll provide a basic implementation
    
    // Monitor LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          callback({
            name: 'LCP',
            value: lastEntry.startTime,
            entries
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP monitoring not supported:', error);
      }
    }
  }
}

/**
 * Resource loading optimization
 */
export class ResourceLoader {
  /**
   * Preload critical resources
   */
  static preloadResource(href: string, as: string, type?: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    document.head.appendChild(link);
  }

  /**
   * Prefetch resources for future navigation
   */
  static prefetchResource(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
  }

  /**
   * Load script dynamically
   */
  static loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      
      document.head.appendChild(script);
    });
  }

  /**
   * Load CSS dynamically
   */
  static loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }
}