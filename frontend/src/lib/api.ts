// API configuration utility
// Handles different API base URLs for desktop vs cloud mode

const MODE = import.meta.env.VITE_MODE || 'desktop';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const isCloudMode = MODE === 'cloud';
export const isDesktopMode = MODE === 'desktop';

/**
 * Get the full API URL for a given endpoint
 * In desktop mode: uses relative paths (/api/...)
 * In cloud mode: uses absolute URL (https://api.omnitrack.com/api/...)
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (isCloudMode) {
    // Cloud mode: use absolute URL
    return `${API_BASE_URL}${path}`;
  } else {
    // Desktop mode: use relative path (proxied by Vite or served by Electron)
    return path;
  }
}

/**
 * Get headers for API requests
 * In cloud mode: includes JWT token from localStorage
 */
export function getApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (isCloudMode) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Enhanced fetch wrapper that handles API base URL and authentication
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getApiHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Store JWT token (cloud mode only)
 */
export function setAuthToken(token: string): void {
  if (isCloudMode) {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Remove JWT token (cloud mode only)
 */
export function clearAuthToken(): void {
  if (isCloudMode) {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Get stored JWT token (cloud mode only)
 */
export function getAuthToken(): string | null {
  if (isCloudMode) {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export const apiConfig = {
  mode: MODE,
  baseUrl: API_BASE_URL,
  isCloud: isCloudMode,
  isDesktop: isDesktopMode,
};
