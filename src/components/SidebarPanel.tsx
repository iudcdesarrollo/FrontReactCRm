import React from 'react';
import { Lead } from './types';
import SearchBar from './SearchBar';
import ChatCategories from './ChatCategories';
import LeadList from './LeadList';

interface SidebarPanelProps {
    searchTerm: string;
    currentCategory: string;
    filteredLeads: Lead[];
    selectedChat: number | null;
    setSelectedChat: (chatId: number | null) => void;
    handleSearch: (term: string) => void;
    handleCategoryChange: (category: string) => void;
    Categries?: boolean;
}

const SidebarPanel: React.FC<SidebarPanelProps> = ({
    searchTerm,
    currentCategory,
    filteredLeads,
    selectedChat,
    setSelectedChat,
    handleSearch,
    handleCategoryChange,
    Categries = true
}) => {
    return (
        <div className="bg-white border-r overflow-hidden">
            <div className="p-4 bg-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-semibold">CRM Innovacion.</h1>
            </div>
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={handleSearch}
            />
            {Categries && (
                <ChatCategories
                    onCategoryChange={handleCategoryChange}
                    initialCategory={currentCategory}
                />
            )}
            <LeadList
                leads={filteredLeads}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                currentCategory={currentCategory}
            />
        </div>
    );
};

export default SidebarPanel;