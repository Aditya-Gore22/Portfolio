export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
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
    if (API_BASE_URL) {
      return `${API_BASE_URL}${imagePath}`;
    }
  }

  return imagePath;
};

export default apiUrl;
