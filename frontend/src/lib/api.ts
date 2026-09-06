// API configuration utility
// Handles different API base URLs for desktop vs cloud mode

const isElectron = typeof window !== 'undefined' && (window.location.protocol === 'file:' || !!(window as any).api);
const isVercelDomain = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') || 
  window.location.hostname.includes('omnitrack-portal')
);

// If on Vercel or browser web, default to cloud mode unless in Electron desktop app
const MODE = isElectron ? 'desktop' : (import.meta.env.VITE_MODE || (isVercelDomain ? 'cloud' : 'desktop'));
const DEFAULT_CLOUD_API = 'https://omnitrack-cloud-backend.vercel.app';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== '/api' 
  ? import.meta.env.VITE_API_BASE_URL 
  : (isVercelDomain ? DEFAULT_CLOUD_API : (import.meta.env.VITE_API_BASE_URL || '/api'));

export const isCloudMode = !isElectron && (MODE === 'cloud' || isVercelDomain);
export const isDesktopMode = !isCloudMode;

/**
 * Get the full API URL for a given endpoint
 * In desktop mode: uses relative paths (/api/...)
 * In cloud mode: uses absolute URL (https://api.omnitrack.com/api/...)
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (isCloudMode) {
    // Cloud mode: use absolute URL if provided, otherwise default to cloud backend
    const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : DEFAULT_CLOUD_API;
    return `${base}${path}`;
  } else {
    // Desktop mode: In development Vite proxies '/api', but in production Electron (file:// protocol) we must hit localhost:5055 directly
    const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
    if (isFileProtocol) {
      return `http://localhost:5055${path}`;
    }
    return `${API_BASE_URL === '/api' ? '' : API_BASE_URL}${path}`;
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
    credentials: 'include',
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
