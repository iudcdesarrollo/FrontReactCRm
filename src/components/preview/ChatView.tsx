import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ChatWindow from '../ChatWindow';
import { Socket } from 'socket.io-client';
import { Agente, Lead } from '../types';
import { downloadFile } from '../../utils/MensajeList/handleFileDownload';
import '../../css/Admins/ChatView.css'

interface Download {
    chatId: number;
    url: string;
    fileName: string;
    downloaded: boolean;
}

interface ChatViewProps {
    selectedLead: {
        conversacionData: {
            _id: string;
        };
        formattedLead: Lead;
        formattedAgente: Agente;
    };
    onBack: () => void;
    socket: Socket | null;
}

export const ChatView: React.FC<ChatViewProps> = ({
    selectedLead,
    onBack,
    socket
}) => {
    const [downloads, setDownloads] = React.useState<Download[]>([]);

    const handleDownload = async (url: string, fileName: string) => {
        const chatIdNumber = parseInt(selectedLead.conversacionData._id, 16) || Date.now();
        const chatId = chatIdNumber.toString();
        try {
            await downloadFile(url, fileName, chatId);
            setDownloads(prev => [
                ...prev,
                {
                    chatId: chatIdNumber,
                    url,
                    fileName,
                    downloaded: true
                }
            ]);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };

    return (
        <div className="relative w-full h-screen">
            <header className="fixed top-0 left-0 right-0 flex items-center gap-4 p-4 bg-[#1a1a1a] border-b border-gray-800 z-50 header-cambio-LeadsView">
                <button
                    onClick={onBack}
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
};