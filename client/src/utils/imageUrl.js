import { API_BASE_URL } from "../services/api";

export const getImageUrl = (photoPath) => {
  if (!photoPath || photoPath === '') return '';
  if (photoPath.startsWith('http')) return photoPath;
  
  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  // Normalize backslashes (Windows) to forward slashes for URLs
  const normalizedPath = path.replace(/\\/g, '/');
  return `${API_BASE_URL}${normalizedPath}`;
};
