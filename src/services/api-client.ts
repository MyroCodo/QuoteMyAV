import { supabase } from './supabase';

// API base URL - defaults to Vercel deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Check if API is configured
export const isApiConfigured = Boolean(API_BASE_URL);

// API Error class
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Response wrapper type
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Make authenticated API request
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // Handle no-content responses
  if (response.status === 204) {
    return {};
  }

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || response.statusText,
      json.error?.details
    );
  }

  return json;
}

/**
 * GET request helper
 */
export function apiGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  let url = path;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return apiFetch<T>(url, { method: 'GET' });
}

/**
 * POST request helper
 */
export function apiPost<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: 'DELETE' });
}
