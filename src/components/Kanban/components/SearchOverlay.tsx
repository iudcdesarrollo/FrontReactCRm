import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import '../css/SearchBarKanBan.css';
import { Lists } from '../@types/kanban';

interface Note {
    content: string;
    timestamp: string;
    _id: string;
}

interface SearchResult {
    listName: string;
    content: string;
    phone: string;
    notes: Note[] | null;
    agentName: string | null;
    ventaPerdidaRazon: string | null;
}

interface SearchOverlayProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    lists: Lists;
    onLeadSelect?: (phoneNumber: string) => void;
}

const enpointPeticiones = import.meta.env.VITE_API_URL_GENERAL;

const SearchOverlay: React.FC<SearchOverlayProps> = ({
    searchTerm,
    setSearchTerm,
    lists,
    onLeadSelect
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const overlayRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const extractPhoneNumber = (content: string): string => {
        const phoneMatch = content.match(/(?:WhatsApp:?\s*)(\d+)/i);
        return phoneMatch ? phoneMatch[1] : 'No encontrado';
    };

    const getSearchResults = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const results: SearchResult[] = [];
        const searchLower = searchTerm.toLowerCase();
        const processedPhones = new Set<string>();

        for (const [listId, list] of Object.entries(lists)) {
            if (!list?.tasks) continue;

            for (const task of list.tasks) {
                if (task.content.toLowerCase().includes(searchLower)) {
                    const phone = extractPhoneNumber(task.content);
                    
                    if (processedPhones.has(phone)) continue;
                    processedPhones.add(phone);

                    try {
                        const response = await axios.get(`${enpointPeticiones}/lead-info/${phone}`);
                        const leadInfo = response.data.data;

                        results.push({
                            listName: listId,
                            content: task.content,
                            phone,
                            notes: leadInfo.notas,
                            agentName: leadInfo.nombreAgente,
                            ventaPerdidaRazon: leadInfo.ventaPerdidaRazon
                        });
                    } catch (error) {
                        console.error('Error fetching lead info:', error);
                        results.push({
                            listName: listId,
                            content: task.content,
                            phone,
                            notes: null,
                            agentName: null,
                            ventaPerdidaRazon: null
                        });
                    }
                }
            }
        }

        setSearchResults(results);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isOpen) {
                getSearchResults();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isOpen, lists]);

    const handleFocus = () => {
        setIsOpen(true);
        getSearchResults();
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsOpen(false);
        setSearchResults([]);
    };

    const handleResultClick = (phone: string) => {
        if (onLeadSelect && phone !== 'No encontrado') {
            onLeadSelect(phone);
            setIsOpen(false);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="search-overlay-container" ref={overlayRef}>
            <div className="search-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar lead..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleFocus}
                    className="search-input"
                />
                {searchTerm && (
                    <button onClick={handleClear} className="clear-button">
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="search-results-overlay">
                    <div className="search-results-content">
                        <h3 className="results-title">
                            {searchResults.length
                                ? `Resultados encontrados: ${searchResults.length}`
                                : 'No se encontraron resultados'}
                        </h3>
                        <div className="results-list">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="result-item"
                                    onClick={() => handleResultClick(result.phone)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleResultClick(result.phone);
                                        }
                                    }}
                                >
                                    <div className="result-header">
                                        <span className="result-phone">{result.phone}</span>
                                        <span className="result-list-name">{result.listName}</span>
                                    </div>
                                    
                                    {result.agentName && (
                                        <p className="result-agent">
                                            <strong>Agente a Cargo:</strong> {result.agentName}
                                        </p>
                                    )}
                                    
                                    {result.notes && result.notes.length > 0 && (
                                        <p className="result-note">
                                            <strong>Última Nota:</strong> {result.notes[0].content}
                                            <span className="result-timestamp">
                                                ({formatDate(result.notes[0].timestamp)})
                                            </span>
                                        </p>
                                    )}
                                    
                                    {result.ventaPerdidaRazon && (
                                        <p className="result-razon">
                                            <strong>Razón de Venta Perdida:</strong> {result.ventaPerdidaRazon}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchOverlay;