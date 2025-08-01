/**
 * Bundle optimization utilities
 * Provides patterns for code splitting, lazy loading, and import optimization
 */

import { lazy, ComponentType } from 'react';

/**
 * Dynamic import wrapper with error handling
 */
export async function dynamicImport<T = unknown>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (i === retries - 1) break;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError!;
}

/**
 * Create a lazy component with error boundary and retry logic
 */
export function createLazyComponent<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    retries?: number;
    delay?: number;
    fallback?: ComponentType;
    errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  }
) {
  const { retries = 3, delay = 1000, fallback, errorFallback } = options || {};
  
  const LazyComponent = lazy(() => dynamicImport(importFn, retries, delay));
  
  return {
    Component: LazyComponent,
    preload: () => importFn(),
    fallback,
    errorFallback,
  };
}

/**
 * Preload components for better performance
 */
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();
  
  static preload(
    componentName: string,
    importFn: () => Promise<unknown>
  ): Promise<unknown> {
    if (this.preloadedComponents.has(componentName)) {
      return Promise.resolve();
    }
    
    this.preloadedComponents.add(componentName);
    return importFn().catch(error => {
      // Remove from preloaded set on error so it can be retried
      this.preloadedComponents.delete(componentName);
      throw error;
    });
  }
  
  static isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }
  
  static clear(): void {
    this.preloadedComponents.clear();
  }
}

/**
 * Route-based code splitting utilities
 */
export const routeComponents = {
  /**
   * Create lazy route component
   */
  createRoute: <T extends Record<string, unknown>>(
    importFn: () => Promise<{ default: ComponentType<T> }>
  ) => {
    return createLazyComponent(importFn, {
      retries: 2,
      delay: 500,
    });
  },
  
  /**
   * Preload route components based on user interaction
   */
  preloadOnHover: (
    element: HTMLElement,
    importFn: () => Promise<unknown>,
    componentName: string
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        ComponentPreloader.preload(componentName, importFn);
      }, 100); // Small delay to avoid preloading on quick hovers
    };
    
    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  },
  
  /**
   * Preload route components on viewport intersection
   */
  preloadOnIntersection: (
    element: HTMLElement,
    importFn: () => Promise<unknown>,
    componentName: string,
    options?: IntersectionObserverInit
  ) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ComponentPreloader.preload(componentName, importFn);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );
    
    observer.observe(element);
    
    // Return cleanup function
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  },
};

/**
 * Import optimization utilities
 */
export const importOptimization = {
  /**
   * Tree-shakable import helper
   */
  createTreeShakableImport: <T extends Record<string, unknown>>(
    modulePath: string,
    namedExports: (keyof T)[]
  ) => {
    return async (): Promise<Pick<T, keyof T>> => {
      const importedModule = await import(modulePath);
      const result = {} as Pick<T, keyof T>;
      
      namedExports.forEach(exportName => {
        if (exportName in importedModule) {
          result[exportName] = importedModule[exportName as string];
        }
      });
      
      return result;
    };
  },
  
  /**
   * Conditional import based on feature flags or conditions
   */
  conditionalImport: async <T>(
    condition: boolean | (() => boolean),
    importFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> => {
    const shouldImport = typeof condition === 'function' ? condition() : condition;
    
    if (shouldImport) {
      return await importFn();
    }
    
    return fallback;
  },
  
  /**
   * Batch import multiple modules
   */
  batchImport: async <T extends Record<string, () => Promise<unknown>>>(
    imports: T
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> => {
    const entries = Object.entries(imports);
    const results = await Promise.allSettled(
      entries.map(([_, importFn]) => importFn())
    );
    
    const batchResult = {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
    
    entries.forEach(([key], index) => {
      const result = results[index];
      if (result?.status === 'fulfilled') {
        batchResult[key as keyof T] = result.value as Awaited<ReturnType<T[keyof T]>>;
      }
    });
    
    return batchResult;
  },
};

/**
 * Asset optimization utilities
 */
export const assetOptimization = {
  /**
   * Preload critical images
   */
  preloadImage: (src: string, crossOrigin?: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      
      img.src = src;
    });
  },
  
  /**
   * Preload multiple images
   */
  preloadImages: async (
    sources: string[],
    options?: { crossOrigin?: string; concurrent?: number }
  ): Promise<HTMLImageElement[]> => {
    const { crossOrigin, concurrent = 3 } = options || {};
    const results: HTMLImageElement[] = [];
    
    // Process images in batches to avoid overwhelming the browser
    for (let i = 0; i < sources.length; i += concurrent) {
      const batch = sources.slice(i, i + concurrent);
      const batchResults = await Promise.allSettled(
        batch.map(src => assetOptimization.preloadImage(src, crossOrigin))
      );
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
    }
    
    return results;
  },
  
  /**
   * Lazy load images with intersection observer
   */
  createLazyImageLoader: (options?: IntersectionObserverInit) => {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );
    
    return {
      observe: (img: HTMLImageElement) => imageObserver.observe(img),
      unobserve: (img: HTMLImageElement) => imageObserver.unobserve(img),
      disconnect: () => imageObserver.disconnect(),
    };
  },
  
  /**
   * Preload fonts
   */
  preloadFont: (href: string, type = 'font/woff2'): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  },
};

/**
 * Bundle analysis utilities for development
 */
export const bundleAnalysis = {
  /**
   * Log import timing in development
   */
  logImportTiming: async <T>(
    importName: string,
    importFn: () => Promise<T>
  ): Promise<T> => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const startTime = performance.now();
      const result = await importFn();
      const endTime = performance.now();
      
      console.log(`[Bundle] ${importName} loaded in ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    }
    
    return importFn();
  },
  
  /**
   * Track bundle size impact
   */
  trackBundleSize: (componentName: string, estimatedSize: number) => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log(`[Bundle] ${componentName} estimated size: ${(estimatedSize / 1024).toFixed(2)}KB`);
    }
  },
};