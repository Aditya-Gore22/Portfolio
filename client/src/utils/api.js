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
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://') || endpoint.startsWith('data:')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${clean}`;
};

/**
 * Resolves an image URL so it works seamlessly on Vercel, Render, or localhost.
 * - Handles data: URLs (Base64) with auto-healing
 * - Handles full external URLs (http/https)
 * - Handles static /images/... paths bundled with client
 * - Handles /uploads/... from the Render backend
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '/images/02_construction_project.png';

  // Handle data URLs or accidentally mangled data URLs
  if (imagePath.startsWith('data:') || imagePath.includes(';base64,') || imagePath.startsWith('/data') || imagePath.startsWith('/64,')) {
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.includes('data:image/')) {
      return imagePath.substring(imagePath.indexOf('data:image/'));
    }
    if (imagePath.includes(',')) {
      const payload = imagePath.substring(imagePath.indexOf(',') + 1);
      return `data:image/webp;base64,${payload}`;
    }
    return imagePath;
  }

  // External full URLs (Imgur, Cloudinary, etc.)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
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
