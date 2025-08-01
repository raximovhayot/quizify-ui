/**
 * Common types used across the application
 * Provides consistent type definitions for shared concepts
 */

/**
 * Language enum based on backend-filesystem MCP server
 */
export enum Language {
  EN = 'en',
  RU = 'ru',
  UZ = 'uz',
}

/**
 * Pageable list interface (existing, enhanced with better typing)
 */
export interface PageableList<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

/**
 * Generic search parameters
 */
export interface SearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Generic option type for dropdowns/selects
 */
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}
