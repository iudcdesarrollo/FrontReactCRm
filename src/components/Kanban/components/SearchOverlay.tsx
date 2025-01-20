import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import '../css/SearchBarKanBan.css';
import { Lists, Task } from '../@types/kanban';

interface SearchResult {
    listName: string;
    content: string;
    phone: string;
}

interface SearchOverlayProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    lists: Lists;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ searchTerm, setSearchTerm, lists }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const getSearchResults = () => {
        if (!searchTerm.trim()) return [];

        const results: SearchResult[] = [];
        const searchLower = searchTerm.toLowerCase();

        Object.entries(lists).forEach(([listId, list]) => {
            list?.tasks.forEach((task: Task) => {
                if (task.content.toLowerCase().includes(searchLower)) {
                    const phoneMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);
                    results.push({
                        listName: listId,
                        content: task.content,
                        phone: phoneMatch ? phoneMatch[1] : 'No encontrado'
                    });
                }
            });
        });

        return results;
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsOpen(false);
    };

    const results = getSearchResults();

    return (
        <div className="search-overlay-container" ref={overlayRef}>
            <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
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
                            {results.length
                                ? `Resultados encontrados: ${results.length}`
                                : 'No se encontraron resultados'}
                        </h3>
                        <div className="results-list">
                            {results.map((result, index) => (
                                <div key={index} className="result-item">
                                    <div className="result-header">
                                        <span className="result-phone">{result.phone}</span>
                                        <span className="result-list-name">{result.listName}</span>
                                    </div>
                                    <p className="result-content">{result.content}</p>
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