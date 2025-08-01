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
 * Locale type for internationalization
 */
export type Locale = keyof typeof Language;

/**
 * Generic ID type for entities
 */
export type EntityId = string;

/**
 * Timestamp type for consistent date handling
 */
export type Timestamp = string; // ISO 8601 format

/**
 * Theme type for application theming
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Status types for various entities
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

/**
 * Priority levels
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Pageable list interface (existing, enhanced with better typing)
 */
export interface PageableList<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
  first: boolean;
  last: boolean;
  empty: boolean;
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
 * Generic audit fields
 */
export interface AuditFields {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: EntityId;
  updatedBy?: EntityId;
}

/**
 * Generic entity with audit fields
 */
export interface BaseEntity extends AuditFields {
  id: EntityId;
  status: Status;
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

/**
 * File upload types
 */
export interface FileUpload {
  file: File;
  name: string;
  type: string;
  size: number;
}

export interface UploadedFile {
  id: EntityId;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Timestamp;
}

/**
 * Contact information
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
}

/**
 * Generic configuration object
 */
export interface Config<T = Record<string, unknown>> {
  [key: string]: T[keyof T];
}

/**
 * Generic key-value pair
 */
export interface KeyValuePair<K = string, V = unknown> {
  key: K;
  value: V;
}
