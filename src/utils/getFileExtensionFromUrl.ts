export const getFileExtensionFromUrl = (url: string): { url: string; extension: string | null } => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const cleanUrl = decodedUrl.split('?')[0];

        // Manejo especial para archivos de audio
        const fileName = cleanUrl.split('/').pop() || '';

        // Si es un archivo de audio (audio_ al inicio del nombre)
        if (fileName.startsWith('audio_')) {
            if (fileName.endsWith('.ogg')) return { url, extension: 'ogg' };
            if (fileName.endsWith('.opus')) return { url, extension: 'opus' };
        }

        const extension = fileName
            .replace(/[()]/g, '')
            .split('.')
            .pop()
            ?.toLowerCase()
            .trim();

        if (extension && extension !== 'html' && extension !== 'htm') {
            return { url, extension };
        }
    } catch (error) {
        console.error('Error parsing URL:', error);
    }

    return { url, extension: null };
};