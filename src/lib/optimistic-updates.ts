/**
 * Optimistic updates utilities for better user experience
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Types for optimistic update operations
 */
export interface OptimisticOperation<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  timestamp: number;
}

export interface OptimisticState<T> {
  items: T[];
  pendingOperations: OptimisticOperation<T>[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing optimistic updates
 */
export function useOptimisticUpdates<T extends { id: string }>(
  initialItems: T[] = [],
  apiCall: (operation: OptimisticOperation<T>) => Promise<T>
) {
  const [state, setState] = useState<OptimisticState<T>>({
    items: initialItems,
    pendingOperations: [],
    isLoading: false,
    error: null,
  });

  const operationIdRef = useRef(0);

  const generateOperationId = useCallback(() => {
    operationIdRef.current += 1;
    return `op-${operationIdRef.current}-${Date.now()}`;
  }, []);

  // Apply optimistic update immediately
  const applyOptimisticUpdate = useCallback((operation: OptimisticOperation<T>) => {
    setState(prev => {
      let newItems = [...prev.items];
      
      switch (operation.type) {
        case 'create':
          newItems.push(operation.data);
          break;
        case 'update':
          newItems = newItems.map(item => 
            item.id === operation.data.id ? { ...item, ...operation.data } : item
          );
          break;
        case 'delete':
          newItems = newItems.filter(item => item.id !== operation.data.id);
          break;
      }

      return {
        ...prev,
        items: newItems,
        pendingOperations: [...prev.pendingOperations, operation],
        isLoading: true,
        error: null,
      };
    });
  }, []);

  // Confirm optimistic update after API success
  const confirmOptimisticUpdate = useCallback((operationId: string, result?: T) => {
    setState(prev => {
      const operation = prev.pendingOperations.find(op => op.id === operationId);
      if (!operation) return prev;

      let newItems = [...prev.items];
      
      // If we have a result from the API, use it to update the item
      if (result && (operation.type === 'create' || operation.type === 'update')) {
        newItems = newItems.map(item => 
          item.id === operation.data.id ? result : item
        );
      }

      return {
        ...prev,
        items: newItems,
        pendingOperations: prev.pendingOperations.filter(op => op.id !== operationId),
        isLoading: prev.pendingOperations.length <= 1,
      };
    });
  }, []);

  // Revert optimistic update on API failure
  const revertOptimisticUpdate = useCallback((operationId: string, error: string) => {
    setState(prev => {
      const operation = prev.pendingOperations.find(op => op.id === operationId);
      if (!operation) return prev;

      let newItems = [...prev.items];
      
      // Revert the optimistic change
      switch (operation.type) {
        case 'create':
          newItems = newItems.filter(item => item.id !== operation.data.id);
          break;
        case 'update':
          // We would need the original data to revert properly
          // For now, we'll just remove the pending operation
          break;
        case 'delete':
          // Re-add the deleted item
          newItems.push(operation.data);
          break;
      }

      return {
        ...prev,
        items: newItems,
        pendingOperations: prev.pendingOperations.filter(op => op.id !== operationId),
        isLoading: prev.pendingOperations.length <= 1,
        error,
      };
    });
  }, []);

  // Execute optimistic operation
  const executeOptimisticOperation = useCallback(async (
    type: OptimisticOperation<T>['type'],
    data: T,
    successMessage?: string,
    errorMessage?: string
  ) => {
    const operation: OptimisticOperation<T> = {
      id: generateOperationId(),
      type,
      data,
      timestamp: Date.now(),
    };

    // Apply optimistic update immediately
    applyOptimisticUpdate(operation);

    try {
      // Execute the actual API call
      const result = await apiCall(operation);
      
      // Confirm the optimistic update
      confirmOptimisticUpdate(operation.id, result);
      
      // Show success message
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      // Revert the optimistic update
      const errorMsg = error instanceof Error ? error.message : 'Operation failed';
      revertOptimisticUpdate(operation.id, errorMsg);
      
      // Show error message
      if (errorMessage) {
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [apiCall, generateOperationId, applyOptimisticUpdate, confirmOptimisticUpdate, revertOptimisticUpdate]);

  // Convenience methods for common operations
  const optimisticCreate = useCallback((data: T, successMessage?: string, errorMessage?: string) => {
    return executeOptimisticOperation('create', data, successMessage, errorMessage);
  }, [executeOptimisticOperation]);

  const optimisticUpdate = useCallback((data: T, successMessage?: string, errorMessage?: string) => {
    return executeOptimisticOperation('update', data, successMessage, errorMessage);
  }, [executeOptimisticOperation]);

  const optimisticDelete = useCallback((data: T, successMessage?: string, errorMessage?: string) => {
    return executeOptimisticOperation('delete', data, successMessage, errorMessage);
  }, [executeOptimisticOperation]);

  // Reset state
  const reset = useCallback((newItems: T[] = []) => {
    setState({
      items: newItems,
      pendingOperations: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    pendingOperations: state.pendingOperations,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    reset,
  };
}

/**
 * Utility for creating optimistic UI feedback
 */
export function createOptimisticFeedback(
  operation: 'create' | 'update' | 'delete',
  itemName: string = 'item'
) {
  const messages = {
    create: {
      optimistic: `Creating ${itemName}...`,
      success: `${itemName} created successfully`,
      error: `Failed to create ${itemName}`,
    },
    update: {
      optimistic: `Updating ${itemName}...`,
      success: `${itemName} updated successfully`,
      error: `Failed to update ${itemName}`,
    },
    delete: {
      optimistic: `Deleting ${itemName}...`,
      success: `${itemName} deleted successfully`,
      error: `Failed to delete ${itemName}`,
    },
  };

  return messages[operation];
}

/**
 * Hook for optimistic form submissions
 */
export function useOptimisticForm<T extends { id: string }>(
  onSubmit: (data: T) => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const submitOptimistically = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setOptimisticData(data);

    try {
      const result = await onSubmit(data);
      setOptimisticData(null);
      onSuccess?.(result);
      return result;
    } catch (error) {
      setOptimisticData(null);
      const err = error instanceof Error ? error : new Error('Submission failed');
      onError?.(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onSuccess, onError]);

  return {
    isSubmitting,
    optimisticData,
    submitOptimistically,
  };
}

/**
 * Utility for debounced optimistic updates (useful for search, auto-save, etc.)
 */
export function useDebouncedOptimisticUpdate<T>(
  callback: (value: T) => Promise<void>,
  delay: number = 500
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedUpdate = useCallback((value: T) => {
    setIsUpdating(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await callback(value);
      } catch (error) {
        console.error('Debounced update failed:', error);
      } finally {
        setIsUpdating(false);
      }
    }, delay);
  }, [callback, delay]);

  return {
    isUpdating,
    debouncedUpdate,
  };
}