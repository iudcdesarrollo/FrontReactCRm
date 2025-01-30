import React from 'react';
import { Lead, Message } from './types';
import '../css/Agentes/LeadList.css';

interface LeadListProps {
    leads: Lead[];
    selectedChat: number | null;
    setSelectedChat: (chatId: number | null) => void;
}

const LeadList: React.FC<LeadListProps> = ({
    leads,
    selectedChat,
    setSelectedChat,
}) => {
    const countUnreadMessages = (messages: Message[]) => {
        let unreadCount = 0;
        let lastAgentMessage = -1;

        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].Agente !== undefined) {
                lastAgentMessage = i;
                break;
            }
        }

        for (let i = messages.length - 1; i > lastAgentMessage; i--) {
            if (messages[i].Agente === undefined) {
                unreadCount++;
            }
        }

        return unreadCount;
    };

    const leadsWithUnreadCount = leads.map(lead => ({
        ...lead,
        unreadMessages: countUnreadMessages(lead.messages || [])
    }));

    const sortedLeads = leadsWithUnreadCount.sort((a, b) => b.unreadMessages - a.unreadMessages);

    const truncateText = (text: string | undefined, maxLength: number = 20): string => {
        if (!text) return 'No hay mensajes';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    return (
        <div className="overflow-y-auto h-full">
            {sortedLeads.map((lead) => (
                <div
                    key={lead.id}
                    className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer relative ${selectedChat === lead.id ? 'bg-gray-100' : ''
                        }`}
                    onClick={() => setSelectedChat(lead.id)}
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-md mr-3 overflow-hidden">
                            {lead.profilePictureUrl ? (
                                <img
                                    src={lead.profilePictureUrl}
                                    alt={lead.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    {lead.nombre?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        {lead.unreadMessages > 0 && (
                            <div className="recuento">
                                {lead.unreadMessages}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex justify-between items-center space-x-2">
                            <h3 className="font-semibold truncate max-w-[70%]">
                                {lead.nombre || lead.numeroWhatsapp}
                            </h3>
                            <span className="text-sm text-gray-500 flex-shrink-0">
                                {lead.TipoGestion}
                            </span>
                        </div>
                        <div className="w-full overflow-hidden">
                            <p
                                className={`text-sm truncate ${lead.unreadMessages > 0
                                    ? 'font-semibold text-gray-900'
                                    : 'text-gray-600'
                                    }`}
                            >
                                {truncateText(lead.conversacion)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeadList;