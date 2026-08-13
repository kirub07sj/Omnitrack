export function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const isElectron = window.location.protocol === 'file:';
  const BASE_URL = isElectron ? 'http://localhost:5000' : '';
  
  // If it's a relative path like ./logo.png in electron, leave it alone
  if (path.startsWith('./')) return path;
  
  // If it's an absolute path (like /uploads/...) prepend BASE_URL
  if (path.startsWith('/')) return BASE_URL + path;
  
  return path;
}
