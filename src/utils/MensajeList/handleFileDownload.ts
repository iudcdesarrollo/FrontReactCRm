import { saveAs } from 'file-saver';

export const downloadFile = async (url: string, fileName: string, extension: string): Promise<void> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        if (['xlsx', 'xls'].includes(extension)) {
            const mimeType = extension === 'xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/vnd.ms-excel';

            const excelBlob = new Blob([await response.arrayBuffer()], { type: mimeType });
            saveAs(excelBlob, fileName);
        } else {
            saveAs(blob, fileName);
        }
    } catch (error) {
        console.error('Error downloading file:', error);
    }
};