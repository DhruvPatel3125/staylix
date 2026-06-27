import { API_BASE_URL } from "../services/api";

export const getImageUrl = (photoPath) => {
  if (!photoPath || photoPath === '') return '';
  if (photoPath.startsWith('http') || photoPath.startsWith('data:') || photoPath.startsWith('blob:')) return photoPath;
  
  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  // Normalize backslashes (Windows) to forward slashes for URLs
  const normalizedPath = path.replace(/\\/g, '/');
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Optimizes image URLs on the fly by injecting width and quality parameters
 * for Cloudinary and Unsplash images.
 */
export const getOptimizedImageUrl = (photoPath, width = 600) => {
  const url = getImageUrl(photoPath);
  if (!url) return '';

  // 1. Cloudinary optimization
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      // Inject auto-format, auto-quality, width, and crop fill
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_fill/`);
    }
  }

  // 2. Unsplash optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '75'); // Web-ready compressed quality
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
};
