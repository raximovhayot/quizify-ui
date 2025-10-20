/**
 * Web Vitals metric type from Next.js
 */
export interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

/**
 * Report Web Vitals metrics for performance monitoring
 * 
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * 
 * Other metrics:
 * - TTFB (Time to First Byte): Server response time
 * - FCP (First Contentful Paint): Initial render
 * - INP (Interaction to Next Paint): Responsiveness
 */
export function reportWebVitals(metric: Metric) {
  // Log to console in development
  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  }

  // In production, send to analytics service
  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'production') {
    // Option 1: Send to Google Analytics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Option 2: Send to custom analytics endpoint
    // Uncomment and configure if you have a custom endpoint
    /*
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      }),
    }).catch((error) => {
      console.error('Failed to send web vitals:', error);
    });
    */
  }
}
