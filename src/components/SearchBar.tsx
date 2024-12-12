import React from 'react';
import { Search } from 'lucide-react';
import '../css/Agentes/SearchBar.css'

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="searchbar-container">
            <div className="searchbar-wrapper">
                <Search size={20} className="searchbar-icon" />
                <input
                    type="text"
                    placeholder="Busca un lead"
                    className="searchbar-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
};

export default SearchBar;