'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/web-vitals';

/**
 * Client component for Web Vitals tracking
 * Must be imported and used in a client component or layout
 */
export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  
  return null;
}
