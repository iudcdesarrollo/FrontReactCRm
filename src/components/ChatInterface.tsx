import React, { useState, useEffect } from 'react';
import Split from 'react-split';
import { Lead, ChatInterfaceProps } from './types';
import LeadList from './LeadList';
import SearchBar from './SearchBar';
import ChatCategories from './ChatCategories';
import ChatWindow from './ChatWindow';
import '../css/Agentes/ChatInterface.css';

interface ExtendedChatInterfaceProps extends ChatInterfaceProps {
    role: 'agent' | 'admin';
}

const ChatInterface: React.FC<ExtendedChatInterfaceProps> = ({
    agente,
    downloads,
    searchTerm,
    setSearchTerm,
    setSelectedCategory,
    selectedChat,
    setSelectedChat,
    setEmail,
    role,
    downloadFile,
    enpointAwsBucked,
    socket
}) => {
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>(() => {
        const savedLeads = localStorage.getItem('filteredLeads');
        return savedLeads ? JSON.parse(savedLeads) : agente?.leads || [];
    });

    const [currentCategory, setCurrentCategory] = useState(() => {
        return localStorage.getItem('currentCategory') || 'Todos';
    });

    useEffect(() => {
        if (agente?.leads) {
            const filtered = agente.leads.filter((lead: Lead) =>
                currentCategory === 'Todos' || lead.TipoGestion === currentCategory
            );
            setFilteredLeads(filtered);
            localStorage.setItem('filteredLeads', JSON.stringify(filtered));
        }
    }, [agente, currentCategory]);

    const handleCategoryChange = (category: string) => {
        setCurrentCategory(category);
        setSelectedCategory(category);

        const filtered = agente?.leads.filter((lead: Lead) =>
            category === 'Todos' || lead.TipoGestion === category
        ) || [];

        setFilteredLeads(filtered);
        localStorage.setItem('filteredLeads', JSON.stringify(filtered));
        localStorage.setItem('currentCategory', category);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.trim() === '') {
            handleCategoryChange(currentCategory);
        } else {
            const searchedLeads = (agente?.leads || []).filter((lead: Lead) => {
                const lowerCaseSearchTerm = term.toLowerCase();
                return (
                    lead.nombre?.toLowerCase().includes(lowerCaseSearchTerm) ||
                    lead.numeroWhatsapp.includes(lowerCaseSearchTerm)
                );
            });

            if (currentCategory === 'Todos') {
                const leadsWithUnreadCount = searchedLeads.map(lead => {
                    let unreadCount = 0;
                    let lastAgentMessage = -1;

                    const messages = lead.messages || [];
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

                    return {
                        ...lead,
                        unreadMessages: unreadCount
                    };
                });

                const filteredUnreadLeads = leadsWithUnreadCount.filter(lead => lead.unreadMessages > 0);
                setFilteredLeads(filteredUnreadLeads);
                localStorage.setItem('filteredLeads', JSON.stringify(filteredUnreadLeads));
            } else {
                setFilteredLeads(searchedLeads);
                localStorage.setItem('filteredLeads', JSON.stringify(searchedLeads));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('filteredLeads');
        localStorage.removeItem('currentCategory');
        setEmail('');
    };

    return (
        <Split
            className="flex h-screen bg-gray-100"
            sizes={[25, 75]}
            minSize={200}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
        >
            <div className="bg-white border-r overflow-hidden">
                <div className="p-4 bg-gray-200 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">CRM Innovacion.</h1>
                    {role === 'agent' && (
                        <button className="Btn_Cerrar_Sesion" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    )}
                </div>
                <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearch} />
                <ChatCategories
                    onCategoryChange={handleCategoryChange}
                    initialCategory={currentCategory}
                />
                <LeadList
                    leads={filteredLeads}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    currentCategory={currentCategory}
                />
            </div>
            <div className="flex-1">
                <ChatWindow
                    selectedChat={selectedChat}
                    agente={agente}
                    downloads={downloads}
                    downloadFile={downloadFile}
                    enpointAwsBucked={enpointAwsBucked}
                    socket={socket}
                    role={role}
                />
            </div>
        </Split>
    );
};

export default ChatInterface;