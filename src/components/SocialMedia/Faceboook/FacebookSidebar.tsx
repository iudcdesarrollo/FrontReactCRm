import React from 'react';
import { Lead } from '../../types';
import SearchBar from '../../SearchBar';
import LeadList from '../../LeadList';

interface FacebookSidebarProps {
    searchTerm: string;
    filteredLeads: Lead[];
    selectedChat: number | null;
    setSelectedChat: (chatId: number | null) => void;
    handleSearch: (term: string) => void;
}

const FacebookSidebar: React.FC<FacebookSidebarProps> = ({
    searchTerm,
    filteredLeads,
    selectedChat,
    setSelectedChat,
    handleSearch,
}) => {
    return (
        <div className="bg-white border-r overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Comentarios de Facebook</h1>
            </div>
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={handleSearch}
            />
            <div className="flex-1 overflow-y-auto">
                <LeadList
                    leads={filteredLeads}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    currentCategory="Todos"
                />
            </div>
        </div>
    );
};

export default FacebookSidebar;