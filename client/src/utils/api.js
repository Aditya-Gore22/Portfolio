export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return String(window.__API_URL__).replace(/\/$/, '');
  }
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('portfolio_api_base_url');
    if (saved) return saved.replace(/\/$/, '');
  }
  return '';
};

export const setApiBaseUrl = (url) => {
  if (typeof localStorage !== 'undefined') {
    if (url) {
      localStorage.setItem('portfolio_api_base_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('portfolio_api_base_url');
    }
  }
};

export const apiUrl = (endpoint) => {
  if (!endpoint) return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${clean}`;
};

/**
 * Resolves an image URL so it works seamlessly on Vercel, Render, or localhost.
 * - Handles data: URLs (Base64)
 * - Handles full external URLs (http/https)
 * - Handles static /images/... paths bundled with client
 * - Handles /uploads/... from the Render backend
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '/images/02_construction_project.png';

  // Data URLs (Base64) or external URLs (Imgur, Cloudinary, etc.)
  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Static images bundled in client/public/images/
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  // Dynamic uploads from backend (/uploads/...)
  if (imagePath.startsWith('/uploads/')) {
    const base = getApiBaseUrl();
    if (base) {
      return `${base}${imagePath}`;
    }
  }

  return imagePath;
};

export default apiUrl;
