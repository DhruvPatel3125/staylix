export const getImageUrl = (photoPath) => {
  if (!photoPath || photoPath === '') return '';
  if (photoPath.startsWith('http')) return photoPath;
  if (!photoPath.startsWith('/')) return '';
  return `http://localhost:5000${photoPath}`;
};
