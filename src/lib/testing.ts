/**
 * Testing utilities and helpers for component and integration testing
 */

/**
 * Test utilities for internationalization
 */
export class TestI18nUtils {
  /**
   * Create test messages for internationalization
   */
  static createTestMessages(locale: string = 'en') {
    const messages = {
      en: {
        common: {
          loading: 'Loading...',
          error: 'An error occurred',
          success: 'Success',
          cancel: 'Cancel',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          create: 'Create',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          submit: 'Submit'
        },
        auth: {
          login: {
            title: 'Sign In',
            button: 'Sign In',
            phone: 'Phone Number',
            password: 'Password'
          },
          register: {
            title: 'Sign Up',
            button: 'Sign Up',
            firstName: 'First Name',
            lastName: 'Last Name'
          }
        },
        dashboard: {
          title: 'Dashboard',
          welcome: 'Welcome back',
          stats: {
            totalQuizzes: 'Total Quizzes',
            activeAssignments: 'Active Assignments',
            totalStudents: 'Total Students',
            averageScore: 'Average Score'
          }
        }
      },
      ru: {
        common: {
          loading: 'Загрузка...',
          error: 'Произошла ошибка',
          success: 'Успешно',
          cancel: 'Отмена',
          save: 'Сохранить',
          delete: 'Удалить',
          edit: 'Редактировать',
          create: 'Создать',
          back: 'Назад',
          next: 'Далее',
          previous: 'Предыдущий',
          submit: 'Отправить'
        }
      },
      uz: {
        common: {
          loading: 'Yuklanmoqda...',
          error: 'Xatolik yuz berdi',
          success: 'Muvaffaqiyatli',
          cancel: 'Bekor qilish',
          save: 'Saqlash',
          delete: 'O\'chirish',
          edit: 'Tahrirlash',
          create: 'Yaratish',
          back: 'Orqaga',
          next: 'Keyingi',
          previous: 'Oldingi',
          submit: 'Yuborish'
        }
      }
    };

    return messages[locale as keyof typeof messages] || messages.en;
  }
}


/**
 * Test helpers for async operations
 */
export class AsyncTestUtils {
  /**
   * Wait for a specific condition to be true
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) {
        return;
      }
      await this.sleep(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Sleep for a specified duration
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a promise that resolves after a delay
   */
  static delayed<T>(value: T, delay: number = 100): Promise<T> {
    return new Promise(resolve => {
      setTimeout(() => resolve(value), delay);
    });
  }

  /**
   * Create a promise that rejects after a delay
   */
  static delayedReject(error: Error, delay: number = 100): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay);
    });
  }
}

/**
 * DOM testing utilities
 */
export class DOMTestUtils {
  /**
   * Check if element is visible
   */
  static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  }

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  /**
   * Simulate keyboard event
   */
  static simulateKeyboard(element: HTMLElement, key: string, options?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }) {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: options?.ctrlKey || false,
      shiftKey: options?.shiftKey || false,
      altKey: options?.altKey || false,
      metaKey: options?.metaKey || false,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(event);
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime
    };
  }

  /**
   * Check if execution time is within acceptable limits
   */
  static async expectExecutionTime<T>(
    fn: () => T | Promise<T>,
    maxDuration: number
  ): Promise<T> {
    const { result, duration } = await this.measureExecutionTime(fn);
    
    if (duration > maxDuration) {
      throw new Error(`Execution took ${duration}ms, expected less than ${maxDuration}ms`);
    }
    
    return result;
  }

  /**
   * Measure memory usage (if available)
   */
  static measureMemoryUsage(): { used?: number; total?: number; limit?: number } | null {
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number } }).memory;
      return {
        used: memory?.usedJSHeapSize,
        total: memory?.totalJSHeapSize,
        limit: memory?.jsHeapSizeLimit
      };
    }
    return null;
  }
}

/**
 * API testing utilities
 */
export class ApiTestUtils {
  /**
   * Mock fetch for testing API calls
   */
  static mockFetch(response: unknown, status: number = 200): void {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
      })
    ) as jest.Mock;
  }

  /**
   * Mock fetch with error
   */
  static mockFetchError(error: Error): void {
    global.fetch = jest.fn(() => Promise.reject(error)) as jest.Mock;
  }

  /**
   * Restore original fetch
   */
  static restoreFetch(): void {
    if (global.fetch && 'mockRestore' in global.fetch) {
      (global.fetch as jest.Mock).mockRestore();
    }
  }

  /**
   * Create mock API client
   */
  static createMockApiClient() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };
  }
}