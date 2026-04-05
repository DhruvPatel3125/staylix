/**
 * Export JSON data to CSV and trigger a browser download.
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Desired filename (without extension)
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add headers as the first row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Wrap in double quotes to handle commas within values
    });
    csvRows.push(values.join(','));
  }
  
  // Create a Blob from the CSV string
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
