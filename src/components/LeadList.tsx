import React from 'react';
import { Lead } from './types';

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
    return (
        <div className="overflow-y-auto h-full">
            {leads.map((lead) => {
                
                return (
                    <div
                        key={lead.id}
                        className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                            selectedChat === lead.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedChat(lead.id)}
                    >
                        <div className="w-12 h-12 rounded-full mr-3 overflow-hidden">
                            {lead.urlPhotoPerfil ? (
                                <img 
                                    src={lead.urlPhotoPerfil} 
                                    alt={lead.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    {lead.nombre.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold truncate">
                                    {lead.nombre || lead.numeroWhatsapp}
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {lead.TipoGestion}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                {lead.conversacion || 'No hay mensajes'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LeadList;