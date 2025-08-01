/**
 * Component optimization utilities
 * Provides patterns and utilities for optimizing React component performance
 */

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Enhanced React.memo with deep comparison
 * Useful for components that receive complex objects as props
 */
export function memoWithDeepComparison<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
) {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

/**
 * Memo with custom comparison function
 */
export function memoWithComparison<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  areEqual: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * Memo for form components - only re-renders when form state changes
 */
export function memoFormComponent<T extends FieldValues, P extends { form: UseFormReturn<T> }>(
  Component: React.ComponentType<P>
) {
  return memo(Component, (prevProps, nextProps) => {
    // Compare form state
    const prevFormState = prevProps.form.formState;
    const nextFormState = nextProps.form.formState;
    
    // Check if form state has changed
    const formStateChanged = 
      prevFormState.isDirty !== nextFormState.isDirty ||
      prevFormState.isValid !== nextFormState.isValid ||
      prevFormState.isSubmitting !== nextFormState.isSubmitting ||
      JSON.stringify(prevFormState.errors) !== JSON.stringify(nextFormState.errors);
    
    if (formStateChanged) {
      return false; // Re-render
    }
    
    // Compare other props (excluding form)
    const { form: _prevForm, ...prevOtherProps } = prevProps;
    const { form: _nextForm, ...nextOtherProps } = nextProps;
    
    return JSON.stringify(prevOtherProps) === JSON.stringify(nextOtherProps);
  });
}

/**
 * Memo for list item components - only re-renders when item data changes
 */
export function memoListItem<T extends { id: string | number }>(
  Component: React.ComponentType<{ item: T; [key: string]: unknown }>
) {
  return memo(Component, (prevProps, nextProps) => {
    // Quick check: if IDs are different, definitely re-render
    if (prevProps.item.id !== nextProps.item.id) {
      return false;
    }
    
    // Deep compare the item data
    if (JSON.stringify(prevProps.item) !== JSON.stringify(nextProps.item)) {
      return false;
    }
    
    // Compare other props
    const { item: _prevItem, ...prevOtherProps } = prevProps;
    const { item: _nextItem, ...nextOtherProps } = nextProps;
    
    return JSON.stringify(prevOtherProps) === JSON.stringify(nextOtherProps);
  });
}

/**
 * Hook for stable callback references
 * Prevents unnecessary re-renders caused by callback prop changes
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Hook for stable object references
 * Prevents unnecessary re-renders caused by object prop changes
 */
export function useStableObject<T extends Record<string, unknown>>(
  obj: T,
  deps: React.DependencyList
): T {
  return useMemo(() => obj, deps);
}

/**
 * Hook for stable array references
 * Prevents unnecessary re-renders caused by array prop changes
 */
export function useStableArray<T>(
  array: T[],
  deps: React.DependencyList
): T[] {
  return useMemo(() => array, deps);
}

/**
 * Hook for memoizing expensive computations
 */
export function useExpensiveComputation<T>(
  computation: () => T,
  deps: React.DependencyList
): T {
  return useMemo(computation, deps);
}

/**
 * Hook for debounced values to reduce re-renders
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled values to reduce re-renders
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * Hook for preventing unnecessary re-renders when props haven't changed
 */
export function useShallowMemo<T extends Record<string, unknown>>(props: T): T {
  const prevPropsRef = useRef<T>(props);
  
  return useMemo(() => {
    const prevProps = prevPropsRef.current;
    let hasChanged = false;
    
    // Check if any prop has changed (shallow comparison)
    for (const key in props) {
      if (props[key] !== prevProps[key]) {
        hasChanged = true;
        break;
      }
    }
    
    // Check if any prop was removed
    if (!hasChanged) {
      for (const key in prevProps) {
        if (!(key in props)) {
          hasChanged = true;
          break;
        }
      }
    }
    
    if (hasChanged) {
      prevPropsRef.current = props;
      return props;
    }
    
    return prevProps;
  }, [props]);
}

/**
 * Performance monitoring hook for development
 */
export function usePerformanceMonitor(componentName: string, props?: Record<string, unknown>) {
  const renderCount = useRef(0);
  const startTime = useRef(0);
  
  // Track render count
  renderCount.current += 1;
  
  // Track render time
  useEffect(() => {
    startTime.current = performance.now();
  });
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    // Only log in development and for slow renders
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && renderTime > 16) {
      console.warn(
        `[Performance] ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`,
        props ? { props } : ''
      );
    }
  });
}

/**
 * Hook for optimizing form field re-renders
 */
export function useOptimizedFormField<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: keyof T
) {
  const fieldValue = form.watch(fieldName as string);
  const fieldError = form.formState.errors[fieldName];
  const isFieldTouched = form.formState.touchedFields[fieldName];
  
  return useMemo(() => ({
    value: fieldValue,
    error: fieldError,
    touched: isFieldTouched,
    register: form.register(fieldName as string),
  }), [fieldValue, fieldError, isFieldTouched, form, fieldName]);
}

/**
 * Higher-order component for adding performance monitoring
 */
export function withPerformanceMonitoring<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const WrappedComponent = (props: T) => {
    usePerformanceMonitor(componentName || Component.displayName || Component.name, props);
    return Component(props);
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Optimization utilities for common patterns
 */
export const optimizationUtils = {
  /**
   * Create a memoized selector for complex state
   */
  createSelector: <TState, TResult>(
    selector: (state: TState) => TResult,
    equalityFn: (a: TResult, b: TResult) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  ) => {
    let lastState: TState;
    let lastResult: TResult;
    
    return (state: TState): TResult => {
      if (state !== lastState) {
        const newResult = selector(state);
        if (!equalityFn(lastResult, newResult)) {
          lastResult = newResult;
        }
        lastState = state;
      }
      return lastResult;
    };
  },
  
  /**
   * Create stable event handlers (returns a hook function)
   */
  createStableHandlers: <T extends Record<string, (...args: unknown[]) => unknown>>(
    handlers: T
  ) => {
    return (deps: React.DependencyList): T => {
      return useMemo(() => handlers, deps);
    };
  },
  
  /**
   * Batch state updates to reduce re-renders
   */
  batchUpdates: (callback: () => void) => {
    // Use React's automatic batching (React 18+)
    callback();
  },
};