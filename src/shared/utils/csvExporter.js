/**
 * Client-side CSV Exporter Utility
 * Generates standards-compliant CSV with UTF-8 Byte Order Mark (BOM)
 * for seamless opening in Excel, Google Sheets, and LibreOffice.
 */

/**
 * Escapes a single cell value for CSV format.
 * @param {any} val 
 * @returns {string}
 */
export function formatCsvCell(val) {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // If string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports data to a CSV file and triggers download in the browser.
 * @param {string} filename Name of the file (e.g., 'CODE_MEETS_AI_Layer1_GenAI.csv')
 * @param {string[]} headers Array of column header strings
 * @param {Array<Array<any>>} rows 2D array of rows
 * @returns {boolean} true if exported, false if no data
 */
export function exportToCsv(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    return false;
  }

  // Prepend UTF-8 BOM so Microsoft Excel correctly recognizes character encoding
  const BOM = '\uFEFF';
  const headerLine = headers.map(formatCsvCell).join(',');
  const rowLines = rows.map((row) => row.map(formatCsvCell).join(','));
  const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
