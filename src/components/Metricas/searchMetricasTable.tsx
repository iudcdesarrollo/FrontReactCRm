import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import '../../css/metricas/SearchBarTableMetricas.css'

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBarTableMetricas: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Buscar...",
    className = ""
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch(value); // Búsqueda en tiempo real
    };

    const handleClear = () => {
        setSearchQuery("");
        onSearch("");
    };

    return (
        <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
            <div className={`search-bar__container ${isFocused ? 'focused' : ''}`}>
                <Search className="search-bar__icon" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="search-bar__input"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="search-bar__clear-button"
                        aria-label="Limpiar búsqueda"
                    >
                        <X size={16} />
                    </button>
                )}
                <div className="search-bar__backdrop"></div>
            </div>
        </form>
    );
};