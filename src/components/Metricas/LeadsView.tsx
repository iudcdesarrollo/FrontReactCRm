import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { MetricData } from './types/types';
import { Socket } from 'socket.io-client';
import { Agente, Lead } from '../types';
import '../../css/Agentes/LeadsView.css';
import { ChatView } from '../preview/ChatView';

interface Message {
    id: string;
    _id: string;
    Cliente?: string;
    Agente?: string;
    message: string;
    timestamp: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    status?: string;
}

interface Mensaje {
    tipo: string;
    contenido: string;
    fecha: string;
    usuario_destino: string;
    mensaje_id: string;
    archivo?: string;
    mensaje?: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        _id: string;
    }>;
}

interface ConversacionData {
    _id: string;
    numero_cliente: string;
    nombre_cliente: string;
    nombre_agente: string;
    correo_agente: string;
    rol_agente: string;
    tipo_gestion: string;
    mensajes: Mensaje[];
    profilePictureUrl?: string;
}

interface SelectedLeadState {
    conversacionData: ConversacionData;
    formattedLead: Lead;
    formattedAgente: Agente;
}

interface LeadsViewProps {
    metric: MetricData;
    onBack: () => void;
    socket: Socket | null;
}

interface Note {
    content: string;
    timestamp: string;
    _id: string;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ metric, onBack, socket }) => {
    const [selectedLead, setSelectedLead] = useState<SelectedLeadState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedLead, setExpandedLead] = useState<string | null>(null);
    const [leadNotes, setLeadNotes] = useState<{ [key: string]: Note[] }>({});
    const [conversations, setConversations] = useState<{ [key: string]: ConversacionData }>({});

    useEffect(() => {
        const fetchAllLeadsData = async () => {
            setLoading(true);
            setError(null);

            const leadsData: { [key: string]: ConversacionData } = {};

            try {
                for (const lead of metric.clients) {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL_GENERAL}/getConversacionNumber/${lead.numero}`
                    );
                    if (!response.ok) {
                        throw new Error(`Error al cargar la conversación del número ${lead.numero}`);
                    }
                    const data = await response.json();
                    leadsData[lead.numero] = data.conversation;

                    if (data.leadNotes) {
                        setLeadNotes((prev) => ({ ...prev, [lead.numero]: data.leadNotes }));
                    }
                }

                setConversations(leadsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllLeadsData();
    }, [metric.clients]);

    const handleLeadClick = (numero: string) => {
        const conversationData = conversations[numero];
        if (!conversationData) return;

        const formattedMessages: Message[] = conversationData.mensajes.map((msg: Mensaje) => {
            return {
                id: msg.mensaje_id,
                _id: msg.mensaje_id,
                Cliente: msg.tipo === 'entrante' ? conversationData.numero_cliente : undefined,
                Agente: msg.tipo === 'saliente' ? conversationData.correo_agente : undefined,
                message: msg.archivo || msg.contenido,
                timestamp: msg.fecha,
                fileUrl: msg.archivo,
                fileType: msg.contenido.includes('/') ? msg.contenido : undefined,
                fileName: msg.mensaje,
                status: msg.statusHistory?.length > 0
                    ? msg.statusHistory[msg.statusHistory.length - 1].status
                    : 'pending',
            };
        });

        const formattedLead: Lead = {
            id: parseInt(conversationData._id, 16) || Date.now(),
            nombre: conversationData.nombre_cliente,
            numeroWhatsapp: conversationData.numero_cliente,
            conversacion: conversationData.tipo_gestion,
            urlPhotoPerfil: conversationData.profilePictureUrl || '',
            profilePictureUrl: conversationData.profilePictureUrl || '',
            TipoGestion: conversationData.tipo_gestion,
            messages: formattedMessages,
        };

        const formattedAgente: Agente = {
            id: 1,
            nombre: conversationData.nombre_agente,
            correo: conversationData.correo_agente,
            rol: conversationData.rol_agente,
            leads: [formattedLead],
        };

        setSelectedLead({
            conversacionData: conversationData,
            formattedLead,
            formattedAgente,
        });
    };

    const toggleNotes = (e: React.MouseEvent, numero: string) => {
        e.stopPropagation();
        setExpandedLead(expandedLead === numero ? null : numero);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white">Cargando datos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (selectedLead) {
        return (
            <ChatView
                selectedLead={selectedLead}
                onBack={() => setSelectedLead(null)}
                socket={socket}
            />
        );
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-6 w-full">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                    <span className="h3_cambio_view">Volver</span>
                </button>
                <h2 className="text-xl font-semibold text-white h2-cambio_view">
                    Sin Gestionar - Lista de Leads
                </h2>
            </div>
            <div className="metrics-grid">
                {metric.clients?.length > 0 ? (
                    metric.clients.map((lead, index) => (
                        <div
                            key={index}
                            className="metric-card cursor-pointer hover:shadow-md relative"
                            onClick={() => handleLeadClick(lead.numero)}
                            role="button"
                            aria-label={`Lead con número ${lead.numero}`}
                        >
                            <div className="metric-content">
                                <div className="metric-icon sin-gestionar">
                                    <User size={20} />
                                </div>
                                <div className="metric-info">
                                    <h3 className="h3_cambio_view">Número de Contacto</h3>
                                    <div className="metric-value flex items-center gap-2 relative">
                                        {lead.numero}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleNotes(e, lead.numero);
                                            }}
                                            className="p-1 text-gray-400 hover:text-white focus:outline-none"
                                        >
                                            {expandedLead === lead.numero ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        <div className="notes-tooltip">
                                            {leadNotes[lead.numero]?.length > 0 && (
                                                <>
                                                    {expandedLead === lead.numero ? (
                                                        // Mostrar todas las notas
                                                        leadNotes[lead.numero].map((note: Note, i: number) => (
                                                            <div key={i} className="notes-tooltip-item">
                                                                <div className="notes-tooltip-timestamp">
                                                                    {new Date(note.timestamp).toLocaleString()}
                                                                </div>
                                                                <div className="notes-tooltip-content">{note.content}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Mostrar solo la última nota
                                                        <div className="notes-tooltip-item">
                                                            <div className="notes-tooltip-timestamp">
                                                                {new Date(leadNotes[lead.numero][leadNotes[lead.numero].length - 1].timestamp).toLocaleString()}
                                                            </div>
                                                            <div className="notes-tooltip-content">
                                                                {leadNotes[lead.numero][leadNotes[lead.numero].length - 1].content}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-400">No hay leads disponibles.</div>
                )}
            </div>
        </>
    );
};