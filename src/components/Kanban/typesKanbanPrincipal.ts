export interface BackendResponse {
    conversation: {
        _id: string;
        numero_cliente: string;
        nombre_cliente: string;
        nombre_agente: string;
        correo_agente: string;
        rol_agente: string;
        tipo_gestion: string;
        mensajes: Array<{
            tipo: string;
            contenido: string;
            mensaje?: string;
            fecha: string;
            usuario_destino: string;
            mensaje_id: string;
            archivo?: string;
            statusHistory: Array<{
                status: string;
                timestamp: string;
                _id: string;
            }>;
            _id: string;
        }>;
        profilePictureUrl?: string;
    };
    leadNotes?: Array<{
        content: string;
        timestamp: string;
        _id: string;
    }>;
}