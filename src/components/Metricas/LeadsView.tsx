import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import '../../css/Admins/Metrics.css';
import { MetricData } from './types/types';
import ChatWindow from '../ChatWindow';
import { Socket } from 'socket.io-client';
import { Agente, Lead, Message } from '../types';

interface LeadsViewProps {
    metric: MetricData;
    onBack: () => void;
    socket: Socket | null;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ metric, onBack, socket }) => {
    const [selectedLead, setSelectedLead] = useState<{
        lead: Lead;
        agente: Agente;
    } | null>(null);

    const handleLeadClick = (numero: string) => {
        const mockMessages: Message[] = [
            { Cliente: numero, message: "Hola, necesito información", timestamp: new Date().toISOString() },
            { Agente: "agente@ejemplo.com", message: "¡Hola! ¿En qué puedo ayudarte?", timestamp: new Date().toISOString() },
        ];

        const mockLead: Lead = {
            id: Date.now(),
            nombre: "Cliente Test",
            numeroWhatsapp: numero,
            conversacion: "Prueba",
            urlPhotoPerfil: "",
            TipoGestion: "Pendiente",
            messages: mockMessages,
        };

        const mockAgente: Agente = {
            id: 1,
            nombre: "Agente Test",
            correo: "agente@ejemplo.com",
            rol: "agent",
            leads: [mockLead],
        };

        setSelectedLead({ lead: mockLead, agente: mockAgente });
    };

    const handleDownloadFile = async (url: string, fileName: string, chatId: number): Promise<void> => {
        console.log('Descargando archivo:', { url, fileName, chatId });
    };

    if (selectedLead) {
        return (
            <>
                <header className="flex items-center gap-4 p-4 bg-[#1a1a1a] border-b border-gray-800">
                    <button
                        onClick={() => setSelectedLead(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </button>
                </header>
                <main className="h-[calc(100vh-64px)]">
                    <ChatWindow
                        selectedChat={selectedLead.lead.id}
                        agente={selectedLead.agente}
                        downloads={[]}
                        downloadFile={handleDownloadFile}
                        enpointAwsBucked=""
                        role="agent"
                        socket={socket}
                        onLeadUpdate={(leadId, updatedData) => console.log('Lead actualizado:', { leadId, updatedData })}
                    />
                </main>
            </>
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
                    <span>Volver</span>
                </button>
                <h2 className="text-xl font-semibold text-white">Sin Gestionar - Lista de Leads</h2>
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
                                    <h3>Número de Contacto</h3>
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