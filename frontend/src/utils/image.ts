export function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const isElectron = window.location.protocol === 'file:';
  const isCloud = import.meta.env.VITE_MODE === 'cloud';
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
  const BASE_URL = isCloud ? apiUrl : (isElectron ? 'http://localhost:5055' : '');
  
  // If it's a relative path like ./logo.png in electron, leave it alone
  if (path.startsWith('./')) return path;
  
  // If it's an absolute path (like /uploads/...) prepend BASE_URL
  if (path.startsWith('/')) return BASE_URL + path;
  
  return path;
}
