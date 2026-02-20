// Format file size from bytes to human-readable format
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Detect file type from MIME type or extension
export const getFileType = (file) => {
    const mimeType = file.type || file.mimeType;
    const ext = file.name?.split('.').pop()?.toLowerCase();

    if (mimeType === 'application/pdf' || ext === 'pdf') return 'PDF';
    if (mimeType === 'application/msword' || ext === 'doc') return 'DOC';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') return 'DOCX';

    return 'Unknown';
};

// Sanitize filename
export const sanitizeFileName = (fileName) => {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '');
};

// Validate MIME type
export const isValidFileType = (mimeType) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(mimeType);
};

// Get file icon color based on type
export const getFileIconColor = (fileType) => {
    switch (fileType) {
        case 'PDF':
            return 'text-red-500';
        case 'DOC':
        case 'DOCX':
            return 'text-blue-500';
        default:
            return 'text-gray-500';
    }
};

// Format date to relative time
export const formatRelativeTime = (date) => {
    const now = new Date();
    const timestamp = new Date(date);
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return timestamp.toLocaleDateString();
};
