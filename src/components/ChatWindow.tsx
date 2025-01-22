import React, { useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Agente, Download, Lead, Message } from './types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageSender from './MessageSender';
import LeadSidebar from './LeadSidebar';

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

const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedChat,
    agente,
    downloads,
    downloadFile,
    enpointAwsBucked,
    socket,
    role,
    onLeadUpdate,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const handleLeadUpdate = useCallback((updatedData: Partial<Lead>) => {
    if (selectedChat && onLeadUpdate) {
        onLeadUpdate(selectedChat, updatedData);
    }
}, [selectedChat, onLeadUpdate]);

if (!selectedChat || !agente) {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
            <p className="text-xl text-gray-500">Selecciona una conversación</p>
        </div>
    );
}

const selectedLead = agente.leads.find(lead => lead.id === selectedChat);
if (!selectedLead) return null;

const transformedMessages: Message[] = selectedLead.messages?.map(msg => {
    const isClient = msg.Cliente !== undefined;
    return {
        Cliente: isClient ? msg.Cliente : undefined,
        Agente: !isClient ? msg.Agente : undefined,
        message: msg.message,
        timestamp: msg.timestamp,
        id: msg.id,
        _id: msg._id,
    };
}) || [];

return (
    <div className="flex flex-row h-full">
        <div className="flex-1 flex flex-col">
            <ChatHeader
                lead={selectedLead}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                <MessageList
                    messages={transformedMessages}
                    selectedChat={selectedChat}
                    downloads={downloads}
                    downloadFile={downloadFile}
                    enpointAwsBucked={enpointAwsBucked}
                    profilePictureUrl={selectedLead.profilePictureUrl}
                    socket={socket}
                    numberWhatsApp={selectedLead.numeroWhatsapp}
                />
            </div>
            <MessageSender
                selectedChat={selectedChat}
                numberWhatsApp={selectedLead.numeroWhatsapp}
                nombreAgente={agente.nombre}
                socket={socket}
                agentEmail={agente.correo}
                agentRole={role}
                managementType={selectedLead.TipoGestion}
                profilePictureUrl={selectedLead.urlPhotoPerfil}
            />
        </div>
        {isSidebarOpen && (
            <div className="lead-sidebar-container">
                <LeadSidebar
                    lead={{
                        nombre: selectedLead.nombre,
                        numeroWhatsapp: selectedLead.numeroWhatsapp,
                        urlPhotoPerfil: selectedLead.urlPhotoPerfil,
                        TipoGestion: selectedLead.TipoGestion,
                        profilePictureUrl: selectedLead.profilePictureUrl
                    }}
                    onUpdate={handleLeadUpdate}
                />
            </div>
        )}
    </div>
);
};

export default ChatWindow;