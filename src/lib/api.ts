import { env } from '@/env.mjs';
import { IApiError, IApiResponse } from '@/types/api';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ParseMode = 'json' | 'blob' | 'text' | 'auto';

interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  timeout?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  parseAs?: ParseMode;
  // URL building options
  params?: Record<string, string | number>;
  query?: Record<string, unknown>;
}

interface RequestContext {
  url: string;
  options: RequestInit;
}

type RequestInterceptor = (
  context: RequestContext
) => Promise<RequestContext> | RequestContext;
type ResponseInterceptor = <T>(
  response: IApiResponse<T>
) => Promise<IApiResponse<T>> | IApiResponse<T>;

interface TimeoutController {
  controller: AbortController;
  timerId: ReturnType<typeof setTimeout>;
  wasTimedOut: () => boolean;
}

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class ApiClient {
  private readonly baseUrl: string;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly defaultTimeout = 30000;
  private authToken?: string;
  private tokenRefreshHandler?: () => Promise<string | null | undefined>;
  private refreshPromise?: Promise<string | null | undefined>;

  constructor(baseUrl: string = env.NEXT_PUBLIC_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /** Set or clear the current auth token used for requests */
  setAuthToken(token: string | null | undefined) {
    this.authToken = token || undefined;
  }

  /** Get the current auth token (if set) */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /** Set a handler to refresh the auth token on 401 responses */
  setTokenRefreshHandler(
    handler: () => Promise<string | null | undefined>
  ): void {
    this.tokenRefreshHandler = handler;
  }

  /** Perform a single-flight token refresh */
  private async tryRefreshToken(): Promise<string | null | undefined> {
    if (!this.tokenRefreshHandler) return null;
    if (!this.refreshPromise) {
      this.refreshPromise = this.tokenRefreshHandler()
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = undefined;
        });
    }
    return this.refreshPromise;
  }

  // =============================================================================
  // URL BUILDING METHODS (Integrated)
  // =============================================================================

  /**
   * Replace ":param" segments in a path with provided values
   */
  private fillPathParams(
    path: string,
    params?: Record<string, string | number>
  ): string {
    if (!params) return path;

    return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => {
      const value = params[key];
      if (value === undefined || value === null) {
        throw new Error(`Missing path parameter: ${key}`);
      }
      return encodeURIComponent(String(value));
    });
  }

  /**
   * Build a query string from a flat object
   */
  private buildQueryString(query?: Record<string, unknown>): string {
    if (!query) return '';

    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      const normalizedValue =
        value instanceof Date ? value.toISOString() : value;

      if (Array.isArray(normalizedValue)) {
        normalizedValue.forEach((item) => {
          if (item !== undefined && item !== null) {
            const itemValue =
              item instanceof Date ? item.toISOString() : String(item);
            params.append(key, itemValue);
          }
        });
      } else if (typeof normalizedValue === 'object') {
        params.append(key, JSON.stringify(normalizedValue));
      } else {
        params.append(key, String(normalizedValue));
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Append query string to URL
   */
  private appendQuery(url: string, query?: Record<string, unknown>): string {
    const queryString = this.buildQueryString(query);
    if (!queryString) return url;

    const separator = url.includes('?') ? '&' : '';
    return `${url}${separator}${queryString.slice(1)}`;
  }

  /**
   * Build complete URL with base URL, path params, and query string
   */
  private buildCompleteUrl(
    endpoint: string,
    options?: {
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
    }
  ): string {
    // Fill path parameters first
    const pathWithParams = this.fillPathParams(endpoint, options?.params);

    // Add base URL
    const fullUrl = `${this.baseUrl}${pathWithParams}`;

    // Add query string
    return this.appendQuery(fullUrl, options?.query);
  }

  // =============================================================================
  // INTERCEPTOR MANAGEMENT
  // =============================================================================

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // =============================================================================
  // CORE REQUEST METHOD
  // =============================================================================

  async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<IApiResponse<T>> {
    const config = this.buildRequestConfig(endpoint, options);
    const timeoutCtrl = this.createTimeoutController(config.timeout);
    const cleanup = this.setupSignalHandling(config.signal, timeoutCtrl);

    try {
      const context = await this.applyRequestInterceptors({
        url: config.url,
        options: config.requestOptions,
      });

      // First attempt
      let response = await fetch(context.url, context.options);

      // If unauthorized, try to refresh token once and retry
      if (response.status === 401 && this.tokenRefreshHandler) {
        const newToken = await this.tryRefreshToken();
        if (newToken) {
          // update stored token
          this.setAuthToken(newToken ?? null);
          // rebuild request config forcing the fresh token to be used
          const retryConfig = this.buildRequestConfig(endpoint, {
            ...options,
            token: newToken ?? undefined,
          });
          const retryContext = await this.applyRequestInterceptors({
            url: retryConfig.url,
            options: retryConfig.requestOptions,
          });
          response = await fetch(retryContext.url, retryContext.options);
        }
      }

      const result = await this.processResponse<T>(response, config.parseAs);
      return await this.applyResponseInterceptors(result);
    } catch (error) {
      return this.handleRequestError(error, timeoutCtrl);
    } finally {
      this.cleanupRequest(timeoutCtrl.timerId, cleanup);
    }
  }

  // =============================================================================
  // HTTP METHOD SHORTCUTS (Enhanced with URL building)
  // =============================================================================

  async get<T>(
    endpoint: string,
    options?: {
      token?: string;
      signal?: AbortSignal;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      credentials?: RequestCredentials;
    }
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: {
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
    }
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: {
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
    }
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: {
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
    }
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: {
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
    }
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
      ...options,
    });
  }

  // =============================================================================
  // SPECIALIZED RESPONSE TYPE METHODS
  // =============================================================================

  async getBlob(
    endpoint: string,
    options?: {
      token?: string;
      signal?: AbortSignal;
      credentials?: RequestCredentials;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
    }
  ): Promise<IApiResponse<Blob>> {
    return this.request<Blob>(endpoint, {
      method: 'GET',
      parseAs: 'blob',
      ...options,
    });
  }

  async getText(
    endpoint: string,
    options?: {
      token?: string;
      signal?: AbortSignal;
      credentials?: RequestCredentials;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
    }
  ): Promise<IApiResponse<string>> {
    return this.request<string>(endpoint, {
      method: 'GET',
      parseAs: 'text',
      ...options,
    });
  }

  // =============================================================================
  // PROGRESS-AWARE METHODS
  // =============================================================================

  async downloadWithProgress(
    endpoint: string,
    options?: {
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
      timeout?: number;
      signal?: AbortSignal;
      credentials?: RequestCredentials;
      onProgress?: (info: {
        receivedBytes: number;
        totalBytes: number | null;
        percent: number | null;
      }) => void;
    }
  ): Promise<IApiResponse<Blob>> {
    const {
      token,
      params,
      query,
      headers = {},
      timeout = this.defaultTimeout,
      signal,
      credentials,
      onProgress,
    } = options || {};

    const url = this.buildCompleteUrl(endpoint, { params, query });
    const requestHeaders = this.buildHeaders(headers, undefined, token);

    const timeoutCtrl = this.createTimeoutController(timeout);
    const cleanup = this.setupSignalHandling(signal, timeoutCtrl);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
        credentials,
        signal: timeoutCtrl.controller.signal,
      });

      if (!response.ok) {
        return this.handleHttpError<Blob>(response);
      }

      const totalBytesHeader = response.headers.get('content-length');
      const totalBytes = totalBytesHeader
        ? parseInt(totalBytesHeader, 10)
        : null;

      if (!response.body) {
        const blob = await response.blob();
        return { data: blob, errors: [] };
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          if (onProgress) {
            onProgress({
              receivedBytes,
              totalBytes,
              percent: totalBytes
                ? Math.round((receivedBytes / totalBytes) * 100)
                : null,
            });
          }
        }
      }

      const blob = new Blob(chunks as unknown as BlobPart[]);
      return { data: blob, errors: [] };
    } catch (error) {
      return this.handleRequestError<Blob>(error, timeoutCtrl);
    } finally {
      this.cleanupRequest(timeoutCtrl.timerId, cleanup);
    }
  }

  async uploadWithProgress<T = unknown>(
    endpoint: string,
    body: FormData | Blob | File | ArrayBuffer | Uint8Array | string,
    options?: {
      method?: 'POST' | 'PUT' | 'PATCH';
      token?: string;
      params?: Record<string, string | number>;
      query?: Record<string, unknown>;
      headers?: Record<string, string>;
      timeout?: number;
      signal?: AbortSignal;
      onProgress?: (info: {
        loaded: number;
        total: number | null;
        percent: number | null;
      }) => void;
    }
  ): Promise<IApiResponse<T>> {
    const {
      method = 'POST',
      token,
      params,
      query,
      headers = {},
      timeout = this.defaultTimeout,
      signal,
      onProgress,
    } = options || {};

    const url = this.buildCompleteUrl(endpoint, { params, query });

    // Build headers (will include Authorization)
    // Avoid setting Content-Type for FormData
    const builtHeaders = this.buildHeaders(
      headers,
      body instanceof FormData ? body : undefined,
      token
    );

    return new Promise<IApiResponse<T>>((resolve) => {
      const xhr = new XMLHttpRequest();
      const timer = setTimeout(() => {
        xhr.abort();
      }, timeout);

      if (signal) {
        if (signal.aborted) {
          clearTimeout(timer);
          resolve({
            data: null as T,
            errors: [{ code: 'CANCELED', message: 'Request canceled' }],
          });
          return;
        }
        const onAbort = () => xhr.abort();
        signal.addEventListener('abort', onAbort, { once: true });
      }

      xhr.open(method, url, true);

      Object.entries(builtHeaders).forEach(([key, value]) => {
        try {
          xhr.setRequestHeader(key, value);
        } catch {}
      });

      xhr.upload.onprogress = (evt) => {
        if (!onProgress) return;
        const total = evt.lengthComputable ? evt.total : null;
        const percent = total ? Math.round((evt.loaded / total) * 100) : null;
        onProgress({ loaded: evt.loaded, total, percent });
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          clearTimeout(timer);
          const contentType = xhr.getResponseHeader('content-type') || '';
          const status = xhr.status;

          if (status >= 200 && status < 300) {
            if (contentType.includes('application/json')) {
              try {
                const json = JSON.parse(xhr.responseText) as IApiResponse<T>;
                resolve(json);
                return;
              } catch {}
            }
            resolve({ data: null as T, errors: [] });
          } else {
            const message =
              xhr.responseText || xhr.statusText || 'Upload failed';
            resolve({
              data: null as T,
              errors: [{ code: `HTTP_${status}`, message }],
            });
          }
        }
      };

      xhr.onerror = () => {
        clearTimeout(timer);
        resolve({
          data: null as T,
          errors: [
            { code: 'NETWORK_ERROR', message: 'Network request failed' },
          ],
        });
      };

      // Send body
      if (body instanceof FormData) {
        xhr.send(body);
      } else if (typeof body === 'string') {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
      } else if (body instanceof Blob) {
        xhr.send(body);
      } else if (body instanceof ArrayBuffer) {
        xhr.send(body);
      } else if (body instanceof Uint8Array) {
        // Convert Uint8Array<ArrayBufferLike> to ArrayBuffer for XHR compatibility
        const ab = new ArrayBuffer(body.byteLength);
        new Uint8Array(ab).set(body);
        xhr.send(ab);
      } else {
        // Fallback: stringify
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));
      }
    });
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private buildRequestConfig(endpoint: string, options: ApiRequestOptions) {
    const {
      method = 'GET',
      headers = {},
      body,
      token,
      timeout = this.defaultTimeout,
      signal,
      credentials,
      parseAs = 'auto',
      params,
      query,
    } = options;

    // Build complete URL with path params and query string
    const url = this.buildCompleteUrl(endpoint, { params, query });
    const requestHeaders = this.buildHeaders(headers, body, token);
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials,
      ...(this.shouldIncludeBody(body, method) && {
        body: this.serializeBody(body),
      }),
    };

    return { url, requestOptions, timeout, signal, parseAs };
  }

  private buildHeaders(
    headers: Record<string, string>,
    body: unknown,
    token?: string
  ): Record<string, string> {
    const requestHeaders: Record<string, string> = { ...headers };

    // Set Content-Type only if not FormData (FormData sets its own boundary)
    if (!(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Prefer explicit token passed to the request
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else if (!requestHeaders.Authorization && this.authToken) {
      // Fallback to stored auth token (set via setAuthToken)
      requestHeaders.Authorization = `Bearer ${this.authToken}`;
    }

    return requestHeaders;
  }

  private shouldIncludeBody(body: unknown, method: string): boolean {
    return body !== undefined && method !== 'GET';
  }

  private serializeBody(body: unknown): string | FormData {
    return body instanceof FormData ? body : JSON.stringify(body);
  }

  private createTimeoutController(timeout: number): TimeoutController {
    let timedOut = false;
    const controller = new AbortController();
    const timerId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);

    return {
      controller,
      timerId,
      wasTimedOut: () => timedOut,
    };
  }

  private setupSignalHandling(
    signal: AbortSignal | undefined,
    timeoutCtrl: TimeoutController
  ): (() => void) | undefined {
    if (!signal) return undefined;

    if (signal.aborted) {
      timeoutCtrl.controller.abort();
      return undefined;
    }

    const onAbort = () => timeoutCtrl.controller.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    return () => signal.removeEventListener('abort', onAbort);
  }

  private async applyRequestInterceptors(
    context: RequestContext
  ): Promise<RequestContext> {
    let result = context;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    if (context.options.signal) {
      result.options.signal = context.options.signal;
    }
    return result;
  }

  private async processResponse<T>(
    response: Response,
    parseAs: ParseMode
  ): Promise<IApiResponse<T>> {
    if (!response.ok) {
      return this.handleHttpError<T>(response);
    }

    const contentType = response.headers.get('content-type') || '';
    const isNoContent = this.isNoContentResponse(response);

    if (isNoContent) {
      return { data: null as T, errors: [] };
    }

    return this.parseResponseBody<T>(response, parseAs, contentType);
  }

  private async handleHttpError<T>(
    response: Response
  ): Promise<IApiResponse<T>> {
    const errorMessage = await this.extractErrorMessage(response);
    const error: IApiError = {
      code: `HTTP_${response.status}`,
      message:
        errorMessage || `HTTP ${response.status}: ${response.statusText}`,
    };

    return { data: null as T, errors: [error] };
  }

  private isNoContentResponse(response: Response): boolean {
    const contentLength = response.headers.get('content-length');
    return (
      response.status === 204 ||
      response.status === 205 ||
      contentLength === '0'
    );
  }

  private async parseResponseBody<T>(
    response: Response,
    parseAs: ParseMode,
    contentType: string
  ): Promise<IApiResponse<T>> {
    switch (parseAs) {
      case 'blob':
        return { data: (await response.blob()) as unknown as T, errors: [] };

      case 'text':
        return { data: (await response.text()) as unknown as T, errors: [] };

      case 'json':
        return (await response.json()) as IApiResponse<T>;

      case 'auto':
        if (contentType.includes('application/json')) {
          return (await response.json()) as IApiResponse<T>;
        }
        return { data: null as T, errors: [] };

      default:
        return { data: null as T, errors: [] };
    }
  }

  private async extractErrorMessage(
    response: Response
  ): Promise<string | null> {
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) return null;

      const errorResponse = await response.json();

      // Try multiple common error message patterns
      const errorPaths = ['errors.0.message', 'message', 'error', 'detail'];

      for (const path of errorPaths) {
        const message = this.getNestedProperty(errorResponse, path);
        if (message) return String(message);
      }

      return null;
    } catch {
      return null;
    }
  }

  private getNestedProperty(
    obj: Record<string, unknown>,
    path: string
  ): unknown {
    return path.split('.').reduce((current, key) => {
      if (RegExp(/^\d+$/).exec(key)) {
        const index = parseInt(key, 10);
        return Array.isArray(current) ? current[index] : undefined;
      }
      return current?.[key];
    }, obj);
  }

  private async applyResponseInterceptors<T>(
    response: IApiResponse<T>
  ): Promise<IApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private handleRequestError<T>(
    error: unknown,
    timeoutCtrl: TimeoutController
  ): IApiResponse<T> {
    const errorDetails = this.categorizeError(error, timeoutCtrl);
    const apiError: IApiError = {
      code: errorDetails.code,
      message: errorDetails.message,
    };

    return { data: null as T, errors: [apiError] };
  }

  private categorizeError(
    error: unknown,
    timeoutCtrl: TimeoutController
  ): { code: string; message: string } {
    if (error instanceof Error && error.name === 'AbortError') {
      return timeoutCtrl.wasTimedOut()
        ? { code: 'TIMEOUT_ERROR', message: 'Request timeout' }
        : { code: 'CANCELED', message: 'Request canceled' };
    }

    return {
      code: 'NETWORK_ERROR',
      message:
        error instanceof Error ? error.message : 'Network request failed',
    };
  }

  private cleanupRequest(
    timerId: ReturnType<typeof setTimeout>,
    removeAbortListener?: () => void
  ): void {
    clearTimeout(timerId);
    removeAbortListener?.();
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const apiClient = new ApiClient();
