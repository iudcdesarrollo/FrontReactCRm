import React, { useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Agente, Download, Lead, Message } from './types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageSender from './MessageSender';
import LeadSidebar from './LeadSideBar/LeadSidebar';

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
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (selectedChat && agente) {
            const selectedLead = agente.leads.find(lead => lead.id === selectedChat);
            if (selectedLead?.messages) {
                const transformedMessages: Message[] = selectedLead.messages.map(msg => ({
                    Cliente: msg.Cliente !== undefined ? msg.Cliente : undefined,
                    Agente: msg.Cliente === undefined ? msg.Agente : undefined,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    id: msg.id,
                    _id: msg._id,
                }));
                setMessages(transformedMessages);
            }
        }
    }, [selectedChat, agente]);

    useEffect(() => {
        if (!socket) return;

        // Escuchar mensaje enviado exitosamente
        socket.on('messageSent', (data) => {
            const newMessage: Message = {
                Agente: agente?.correo,
                message: data.message,
                timestamp: data.timestamp,
                id: data.metaMessageId,
                _id: data.savedMessage._id,
            };
            setMessages(prev => [...prev, newMessage]);
        });

        // Escuchar nuevos mensajes entrantes
        socket.on('newMessage', (data) => {
            if (data.to === selectedChat) {
                const newMessage: Message = {
                    Cliente: data.from,
                    message: data.message,
                    timestamp: new Date().toISOString(),
                    id: data.id,
                    _id: data.id,
                };
                setMessages(prev => [...prev, newMessage]);
            }
        });

        return () => {
            socket.off('messageSent');
            socket.off('newMessage');
        };
    }, [socket, selectedChat, agente]);

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

    return (
        <div className="flex flex-row h-full">
            <div className="flex-1 flex flex-col">
                <ChatHeader
                    lead={selectedLead}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                    <MessageList
                        messages={messages}
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