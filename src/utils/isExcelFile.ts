import { getFileExtensionFromUrl } from "./getFileExtensionFromUrl";

export const isExcelFile = (url: string): boolean => {
    const { extension } = getFileExtensionFromUrl(url);
    return extension === 'xlsx' || extension === 'xls';
};