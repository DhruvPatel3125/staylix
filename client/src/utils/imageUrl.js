import { API_BASE_URL } from "../services/api";

export const getImageUrl = (photoPath) => {
  if (!photoPath || photoPath === '') return '';
  if (photoPath.startsWith('http')) return photoPath;
  if (!photoPath.startsWith('/')) return '';
  return `${API_BASE_URL}${photoPath}`;
};
