/**
 * Utility to convert JSON data to CSV and trigger a download.
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to save as
 * @param {Array} headers - Optional specific headers to include
 */
export const exportToCSV = (data, fileName = 'export', headers = null) => {
    if (!data || !data.length) {
        console.error('No data available for export');
        return;
    }

    // Determine headers if not provided
    const baseHeaders = headers || Object.keys(data[0]).filter(key =>
        typeof data[0][key] !== 'object' && key !== '_id' && key !== '__v' && key !== 'password'
    );

    // Create CSV rows
    const csvContent = [
        baseHeaders.join(','), // Header row
        ...data.map(row =>
            baseHeaders.map(header => {
                const cell = row[header] === null || row[header] === undefined ? '' : row[header];
                // Escape quotes and wrap in quotes if contains comma
                const stringCell = String(cell).replace(/"/g, '""');
                return stringCell.includes(',') || stringCell.includes('"') ? `"${stringCell}"` : stringCell;
            }).join(',')
        )
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
