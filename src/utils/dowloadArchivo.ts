import { useState } from 'react';

interface Download {
    chatId: number;
    fileName: string;
    downloaded: boolean;
}

interface UseFileDownloadState {
    downloads: Download[];
}

export const useFileDownload = () => {
    const [state, setState] = useState<UseFileDownloadState>({ downloads: [] });

    const downloadFile = async (
        url: string,
        fileName: string,
        chatId: number
    ): Promise<void> => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from ${url}`);
            }
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setState((prevState) => ({
                downloads: prevState.downloads.map((download) =>
                    download.chatId === chatId && download.fileName === fileName
                        ? { ...download, downloaded: true }
                        : download
                ),
            }));
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };

    return { downloadFile, downloads: state.downloads };
};