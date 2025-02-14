export interface TaskDetails {
    name: string | null;
    whatsapp: string | null;
    tipoGestion: string | null;
    AgenteACargo: string | null;
}

export const extractDetails = (content: string): TaskDetails => {
    const nameMatch = content.match(/Nombre:\s*(.+)/);
    const whatsappMatch = content.match(/WhatsApp:\s*([\d+]+)/);
    const tipoGestionMatch = content.match(/Tipo de Gestión:\s*(.+)/);
    const agenteACargoMatch = content.match(/Agente a Cargo:\s*(.+)/);

    return {
        name: nameMatch ? nameMatch[1].trim() : null,
        whatsapp: whatsappMatch ? whatsappMatch[1].trim() : null,
        tipoGestion: tipoGestionMatch ? tipoGestionMatch[1].trim() : null,
        AgenteACargo: agenteACargoMatch ? agenteACargoMatch[1].trim() : null,
    };
};