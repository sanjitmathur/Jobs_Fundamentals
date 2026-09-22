import { ApiErrorDetail, ApiErrorResponse } from '../../types/api';
import { API_BASE_URL } from '../constants';

export class ApiError extends Error {
  public statusCode: number;
  public details?: ApiErrorDetail[];
  public code?: string;

  constructor(statusCode: number, message: string, details?: ApiErrorDetail[], code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

const TOKEN_KEY = 'jobs_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedCallback = handler;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {};

  if (!(customConfig.body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const mergedHeaders = {
    ...reqHeaders,
    ...(headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: mergedHeaders,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuth) {
      setStoredToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    let errorData: ApiErrorResponse = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || 'An unexpected error occurred' };
    }

    let errorMessage =
      errorData.message ||
      errorData.error ||
      `Request failed with status ${response.status}`;

    if (errorData.details && errorData.details.length > 0) {
      const detailsList = errorData.details.map((d) => `${d.field ? d.field + ': ' : ''}${d.message}`).join(', ');
      errorMessage = `${errorMessage}: ${detailsList}`;
    }

    throw new ApiError(response.status, errorMessage, errorData.details, errorData.code);
  }

  return response.json() as Promise<T>;
}
