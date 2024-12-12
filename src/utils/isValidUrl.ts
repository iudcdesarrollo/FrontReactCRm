export const isValidUrl = (str: string): boolean => {
    const pattern = /^(https?:\/\/)?(\w+\.\w+)+(\/([\w-. /?%&=]*)?)?$/i;
    return pattern.test(str);
};