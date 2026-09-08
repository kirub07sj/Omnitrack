import { isCloudMode, apiConfig } from '@/lib/api';

export function getImageUrl(path?: string): string {
  if (!path) return '';
  
  // Base64 data URIs
  if (path.startsWith('data:')) return path;
  
  // Strip old legacy absolute localhost URLs from the database
  if (path.includes('localhost:5000') && path.includes('/uploads')) {
    path = path.substring(path.indexOf('/uploads'));
  } else if (path.includes('localhost:5055') && path.includes('/uploads')) {
    path = path.substring(path.indexOf('/uploads'));
  }
  
  // If it's still a valid external http(s) URL (like Cloudinary), return it
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const isElectron = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const apiUrl = apiConfig.baseUrl || 'https://omnitrack-cloud-backend.vercel.app';
  const BASE_URL = isCloudMode ? apiUrl : (isElectron ? 'http://localhost:5055' : '');
  
  // If it's a relative path like ./logo.png in electron, leave it alone
  if (path.startsWith('./')) return path;
  
  // If it's an absolute path (like /uploads/...) prepend BASE_URL
  if (path.startsWith('/')) return BASE_URL + path;
  
  return path;
}
