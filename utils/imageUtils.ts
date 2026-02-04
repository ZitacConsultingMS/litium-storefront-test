/**
 * Utility functions for image handling and validation
 */

/**
 * Checks if a URL points to a valid image file
 * @param url - The URL to check
 * @returns true if the URL points to a valid image file
 */
export const isValidImage = (url: string | null): boolean => {
    if (!url || url.trim() === '') return false;

    // Extract extension, removing query parameters
    const urlWithoutQuery = url.split('?')[0];
    const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();

    // Exclude document files
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'];
    if (extension && documentExtensions.includes(extension)) {
        return false;
    }

    // Accept URLs with valid image extensions
    const validImageExtensions = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
        'bmp', 'tiff', 'tif', 'ico', 'avif', 'heic', 'heif'
    ];
    if (extension && validImageExtensions.includes(extension)) {
        return true;
    }

    return true;
};

/**
 * Checks if a URL points to a PDF file
 * @param url - The URL to check
 * @returns true if the URL points to a PDF file
 */
export const isPdfFile = (url: string | null): boolean => {
    if (!url) return false;
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
};

/**
 * Checks if a URL points to a document file (PDF, DOC, DOCX, etc.)
 * @param url - The URL to check
 * @returns true if the URL points to a document file
 */
export const isDocumentFile = (url: string | null): boolean => {
    if (!url) return false;

    const documentExtensions = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'
    ];
    const extension = url.split('.').pop()?.toLowerCase();
    return documentExtensions.includes(extension || '');
};

/**
 * Filters an array of images to only include valid image files
 * @param images - Array of image objects
 * @returns Array containing only valid images
 */
export const filterValidImages = <T extends { url?: string }>(images: T[]): T[] => {
    return images.filter(image => isValidImage(image.url || null));
};

/**
 * Filters an array of files to only include document files
 * @param files - Array of file objects
 * @returns Array containing only document files
 */
export const filterDocumentFiles = <T extends { url?: string }>(files: T[]): T[] => {
    return files.filter(file => isDocumentFile(file.url || null));
};

/**
 * Gets the first valid image from an array of images
 * @param images - Array of image objects
 * @returns The first valid image or null if none found
 */
export const getFirstValidImage = <T extends { url?: string }>(images: T[]): T | null => {
    const validImages = filterValidImages(images);
    return validImages.length > 0 ? validImages[0] : null;
};
