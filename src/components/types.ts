import { ReactNode } from 'react';
import { Socket } from 'socket.io-client';

// Frontend Interfaces
export interface Lead {
    id: number;
    nombre: string;
    numeroWhatsapp: string;
    conversacion: string;
    urlPhotoPerfil: string;
    TipoGestion: string;
    messages?: Message[];
}

export interface Agente {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    leads: Lead[];
}

export interface Message {
    _id?: string;
    Cliente?: string;
    Agente?: string;
    message: string;
    timestamp?: string;
    status?: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
}

export interface Download {
    url: string;
    fileName: string;
    downloaded: boolean;
    chatId: number;
}

export interface ChatCategory {
    icon: ReactNode;
    label: string;
}

// Socket Types
export interface SocketMessagePayload {
    to: string;
    message: string;
    nombreAgente: string;
    correoAgente: string;
    rolAgente: string;
    tipoGestion: string;
}

export interface SocketResponse {
    status: 'success' | 'error';
    message: string;
    data?: unknown;
}

// Props Interfaces
export interface ChatCategoriesProps {
    onCategoryChange: (category: string) => void;
}

export interface WhatsAppCloneProps {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    initialAgente: Agente | null;
    initialData: BackendResponse[];
    socket: Socket | null;
}

export interface WhatsAppCloneState {
    searchTerm: string;
    selectedCategory: string;
    selectedChat: number | null;
    agente: Agente | null;
    downloads: Download[];
    showMetrics: boolean;
    showSettings: boolean;
}

export interface ChatWindowProps {
    selectedChat: number | null;
    agente: Agente | null;
    downloads: Download[];
    downloadFile: (url: string, fileName: string, chatId: number) => Promise<void>;
    enpointAwsBucked: string;
    role: 'agent' | 'admin';
    socket: Socket | null;
    onLeadUpdate?: (leadId: number, updatedData: Partial<Lead>) => void;
}

export interface ChatInterfaceProps {
    socket: Socket | null;
    chats: Lead[];
    agente: Agente | null;
    downloads: Download[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedChat: number | null;
    setSelectedChat: (chatId: number | null) => void;
    downloadFile: (url: string, fileName: string, chatId: number) => Promise<void>;
    enpointAwsBucked: string;
    setEmail: (email: string) => void;
    role: 'agent' | 'admin';
}

export interface LeftSidebarProps {
    handleLogout: () => void;
    toggleSettings: () => void;
    onSelectHome: () => void;
}

export interface MessageSenderProps {
    selectedChat: number | null;
    numberWhatsApp: string;
    nombreAgente: string;
    socket: Socket | null;
    agentEmail: string;
    agentRole: string;
    managementType: string;
    profilePictureUrl: string;
}

// Backend Interfaces
export interface BackendResponse {
    correo_agente: string;
    mensajes: BackendMensaje[];
    nombre_agente: string;
    nombre_cliente: string;
    numero_cliente: string;
    rol_agente: string;
    tipo_gestion: string;
    _id: string;
}

export interface BackendMensaje {
    _id: string;
    tipo: 'entrante' | 'saliente';
    contenido: string;
    fecha: string;
    usuario_destino: string;
    mensaje_id: string;
    archivo?: string;
    mensaje?: string;
}

export interface WebSocketMessage {
    numero: string;
    conversacion: Message[];
}

// Transformation Functions
export const transformBackendToFrontend = (backendData: BackendResponse[]): Agente => {
    if (!backendData || backendData.length === 0) {
        return { id: 0, nombre: '', correo: '', rol: '', leads: [] };
    }

    const transformedLeads: Lead[] = backendData.map((item) => {
        const messages = item.mensajes.map(mensaje => ({
            [mensaje.tipo === 'entrante' ? 'Cliente' : 'Agente']: mensaje.usuario_destino,
            message: mensaje.contenido || mensaje.mensaje || '',
            timestamp: mensaje.fecha
        }));

        return {
            id: parseInt(item._id.slice(-6), 16),
            nombre: item.nombre_cliente || 'Sin nombre',
            numeroWhatsapp: item.numero_cliente,
            conversacion: messages[messages.length - 1]?.message || 'Sin mensajes',
            urlPhotoPerfil: '',
            TipoGestion: item.tipo_gestion || 'sin-gestionar',
            messages
        };
    });

    const firstItem = backendData[0];
    return {
        id: 1,
        nombre: firstItem.nombre_agente || 'Sin nombre',
        correo: firstItem.correo_agente || '',
        rol: firstItem.rol_agente || 'agente',
        leads: transformedLeads
    };
};

export const transformBackendMessages = (backendMensajes: BackendMensaje[]): Message[] => {
    return backendMensajes.map(mensaje => ({
        [mensaje.tipo === 'entrante' ? 'Cliente' : 'Agente']: mensaje.usuario_destino,
        message: mensaje.contenido || mensaje.mensaje || '',
        timestamp: mensaje.fecha
    }));
};

export const getDownloadsFromMessages = (backendData: BackendResponse[]): Download[] => {
    return backendData.flatMap(item =>
        item.mensajes
            .filter(msg => msg.archivo)
            .map(msg => ({
                url: msg.archivo!,
                fileName: msg.archivo!.split('/').pop() || 'archivo',
                downloaded: false,
                chatId: parseInt(item._id.slice(-6), 16)
            }))
    );
};