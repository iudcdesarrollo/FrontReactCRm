export interface FilterOptions {
    programas: string[];
    tiposGestion: string[];
    agentes: {
        _id: string;
        nombre: string;
        correo: string;
    }[];
}

export interface FilterState {
    startDate: string;
    endDate: string;
    agentId: string;
    tipoGestion: string;
    programa: string;
    searchTerm: string;
    page: number;
    limit: number;
}

interface Message {
    Agente?: string;
    Cliente?: string;
    message: string;
    timestamp: string;
    id: string;
    _id: string;
    status: string;
    messageType: string;
}

export interface ProcessedLead {
    id: number;
    nombre: string;
    numeroWhatsapp: string;
    conversacion: string;
    urlPhotoPerfil: string;
    TipoGestion: string;
    messages: Message[];
}