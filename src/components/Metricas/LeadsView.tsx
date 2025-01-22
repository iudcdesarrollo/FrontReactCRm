import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import { MetricData } from './types/types';
import ChatWindow from '../ChatWindow';
import { Socket } from 'socket.io-client';
import { Agente, Lead } from '../types';
import '../../css/Agentes/LeadsView.css';
import { useFileDownload } from '../../utils/dowloadArchivo';

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

interface Download {
    chatId: number;
    url: string;
    fileName: string;
    downloaded: boolean;
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

export const LeadsView: React.FC<LeadsViewProps> = ({ metric, onBack, socket }) => {
    const [selectedLead, setSelectedLead] = useState<SelectedLeadState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloads, setDownloads] = useState<Download[]>([]);
    const { downloadFile } = useFileDownload();

    const handleLeadClick = async (numero: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/getConversacionNumber/${numero}`);
            if (!response.ok) {
                throw new Error('Error al cargar la conversación');
            }
            const data: ConversacionData = await response.json();

            const formattedMessages: Message[] = data.mensajes.map((msg) => {
                // console.log('Mensaje Original:', msg);

                // console.log('ID:', {
                //     mensaje_id: msg.mensaje_id,
                //     id_formateado: msg.mensaje_id
                // });

                // console.log('Cliente/Agente:', {
                //     tipo: msg.tipo,
                //     cliente: msg.tipo === 'entrante' ? data.numero_cliente : undefined,
                //     agente: msg.tipo === 'saliente' ? data.correo_agente : undefined
                // });

                // console.log('Contenido:', {
                //     archivo: msg.archivo,
                //     contenido: msg.contenido,
                //     mensaje_final: msg.archivo || msg.contenido
                // });

                // console.log('Timestamp:', {
                //     fecha_original: msg.fecha,
                //     fecha_formateada: msg.fecha
                // });

                // console.log('Archivo:', {
                //     url: msg.archivo,
                //     tipo: msg.contenido.includes('/') ? msg.contenido : undefined,
                //     nombre: msg.mensaje
                // });

                // console.log('Status:', {
                //     historial: msg.statusHistory,
                //     ultimo_status: msg.statusHistory?.length > 0
                //         ? msg.statusHistory[msg.statusHistory.length - 1].status
                //         : 'pending'
                // });

                // console.log('------------------------');

                return {
                    id: msg.mensaje_id,
                    _id: msg.mensaje_id,
                    Cliente: msg.tipo === 'entrante' ? data.numero_cliente : undefined,
                    Agente: msg.tipo === 'saliente' ? data.correo_agente : undefined,
                    message: msg.archivo || msg.contenido,
                    timestamp: msg.fecha,
                    fileUrl: msg.archivo,
                    fileType: msg.contenido.includes('/') ? msg.contenido : undefined,
                    fileName: msg.mensaje,
                    status: msg.statusHistory?.length > 0
                        ? msg.statusHistory[msg.statusHistory.length - 1].status
                        : 'pending'
                };
            });

            const formattedLead: Lead = {
                id: parseInt(data._id, 16) || Date.now(),
                nombre: data.nombre_cliente,
                numeroWhatsapp: data.numero_cliente,
                conversacion: data.tipo_gestion,
                urlPhotoPerfil: data.profilePictureUrl || '',
                profilePictureUrl: data.profilePictureUrl || '',
                TipoGestion: data.tipo_gestion,
                messages: formattedMessages
            };

            const formattedAgente: Agente = {
                id: 1,
                nombre: data.nombre_agente,
                correo: data.correo_agente,
                rol: data.rol_agente,
                leads: [formattedLead],
            };

            setSelectedLead({
                conversacionData: data,
                formattedLead,
                formattedAgente,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        if (selectedLead) {
            const chatId = parseInt(selectedLead.conversacionData._id, 16) || Date.now();
            try {
                await downloadFile(url, fileName, chatId);

                setDownloads(prev => [
                    ...prev,
                    {
                        chatId,
                        url,
                        fileName,
                        downloaded: true
                    }
                ]);
            } catch (error) {
                console.error('Error al descargar el archivo:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white">Cargando conversación...</div>
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
            <div className="relative w-full h-screen">
                <header className="fixed top-0 left-0 right-0 flex items-center gap-4 p-4 bg-[#1a1a1a] border-b border-gray-800 z-50 header-cambio-LeadsView">
                    <button
                        onClick={() => setSelectedLead(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white btn-cambioLeadsView"
                    >
                        <ArrowLeft size={20} />
                        <span className="h3_cambio_view">Volver</span>
                    </button>
                </header>
                <main className="escalor">
                    <ChatWindow
                        selectedChat={selectedLead.formattedLead.id}
                        agente={selectedLead.formattedAgente}
                        downloads={downloads}
                        downloadFile={handleDownload}
                        enpointAwsBucked={import.meta.env.VITE_AWS_BUCKET_ENDPOINT || ''}
                        role="agent"
                        socket={socket}
                        onLeadUpdate={(leadId, updatedData) => console.log('Lead actualizado:', { leadId, updatedData })}
                    />
                </main>
            </div>
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
                <h2 className="text-xl font-semibold text-white h2-cambio_view">Sin Gestionar - Lista de Leads</h2>
            </div>
            <div className="metrics-grid">
                {metric.clients?.length > 0 ? (
                    metric.clients.map((lead, index) => (
                        <div
                            key={index}
                            className="metric-card cursor-pointer hover:shadow-md"
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
                                    <div className="metric-value">{lead.numero}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-400">
                        No hay leads disponibles
                    </div>
                )}
            </div>
        </>
    );
};