export interface TemplateResponse {
    message: string;
    templateFormado: {
        to: string;
        templateText: string;
        processedText: string;
        components: Array<{
            type: string;
            parameters: Array<{
                type: string;
                text: string;
            }>;
        }>;
    };
    response: {
        messaging_product: string;
        contacts: Array<{ wa_id: string }>;
        messages: Array<{ id: string }>;
    };
}

interface TemplateInfo {
    phoneNumber: string;
    templateText: string;
    processedText: string;
}

export const extractTemplateInfo = (data: TemplateResponse): TemplateInfo => {
    return {
        phoneNumber: data.templateFormado.to,
        templateText: data.templateFormado.templateText,
        processedText: data.templateFormado.processedText
    };
};

// Ejemplo de uso (CSR)
/* 
socket.on('templateSent', (data: TemplateResponse) => {
    const { phoneNumber, templateText, processedText } = extractTemplateInfo(data);
    console.log('Número:', phoneNumber);
    console.log('Texto del template:', templateText);
    console.log('Texto procesado:', processedText);
}); 
*/