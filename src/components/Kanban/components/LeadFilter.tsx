import React, { useState, useEffect } from 'react';
import '../css/LeadFilter.css';

interface FilterOptions {
    programas: string[];
    tiposGestion: string[];
    agentes: {
        _id: string;
        nombre: string;
        correo: string;
    }[];
}

interface FilterState {
    startDate: string;
    endDate: string;
    agentId: string;
    tipoGestion: string;
    programa: string;
    searchTerm: string;
    page: number;
    limit: number;
}

interface Message {
    Agente?: string;
    Cliente?: string;
    message: string;
    timestamp: string;
    id: string;
    _id: string;
    status: string;
    messageType: string;
}

interface ProcessedLead {
    id: number;
    nombre: string;
    numeroWhatsapp: string;
    conversacion: string;
    urlPhotoPerfil: string;
    TipoGestion: string;
    messages: Message[];
}

// interface OriginalLead {
//     nombre: string;
//     apellido: string;
//     telefono: string;
//     correo: string;
//     programa: string;
//     tipo_gestion: string;
//     nombre_agente: string;
//     notas: Array<{
//         content: string;
//         timestamp: string;
//     }>;
//     ventaPerdidaRazon: string;
// }

interface LeadFilterProps {
    onLeadsFiltered: (leads: ProcessedLead[]) => void;
}

const endpointGeneral = import.meta.env.VITE_API_URL_GENERAL;

const LeadFilter: React.FC<LeadFilterProps> = ({ onLeadsFiltered }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        programas: [],
        tiposGestion: [],
        agentes: []
    });

    const [filters, setFilters] = useState<FilterState>({
        startDate: '',
        endDate: '',
        agentId: '',
        tipoGestion: '',
        programa: '',
        searchTerm: '',
        page: 1,
        limit: 10
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFilterOptions();
        }
    }, [isOpen]);

    const fetchFilterOptions = async () => {
        try {
            const response = await fetch(`${endpointGeneral}/filter-options`);
            const data = await response.json();

            if (data.success) {
                setFilterOptions(data.data);
            }
        } catch (err) {
            console.error('Error al cargar opciones:', err);
        }
    };

    const formatDateWithTime = (dateStr: string, isEnd: boolean = false) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isEnd) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
    };

    const processLeadData = (leadResponse: any): ProcessedLead => {
        if (!leadResponse) {
            console.error('Lead response is undefined or null');
            return {} as ProcessedLead;
        }

        return {
            id: leadResponse.id || 0,  // Safe default
            nombre: leadResponse.nombre || 'Unknown',
            numeroWhatsapp: leadResponse.numeroWhatsapp || '',
            conversacion: leadResponse.conversacion || '',
            urlPhotoPerfil: leadResponse.urlPhotoPerfil || '',
            TipoGestion: leadResponse.TipoGestion || 'sin gestionar',
            messages: leadResponse.messages || []
        };
    };
    

    const fetchLeads = async () => {
        setLoading(true);

        try {
            const formattedStartDate = formatDateWithTime(filters.startDate);
            const formattedEndDate = formatDateWithTime(filters.endDate, true);

            const queryParams = new URLSearchParams({
                ...(filters.startDate && { startDate: formattedStartDate }),
                ...(filters.endDate && { endDate: formattedEndDate }),
                ...(filters.agentId && { agentId: filters.agentId }),
                ...(filters.tipoGestion && { tipoGestion: filters.tipoGestion }),
                ...(filters.programa && { programa: filters.programa }),
                ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
            });

            console.log('Query Parameters:', Object.fromEntries(queryParams));
            console.log('Full URL:', `${endpointGeneral}/filter?${queryParams}`);

            const response = await fetch(`${endpointGeneral}/filter?${queryParams}`);

            console.log('Response Status:', response.status);

            const data = await response.json();

            console.log('Full Response Data:', data);

            if (data.success && Array.isArray(data.data)) {
                console.log('Number of Leads:', data.data.length);

                // Log first lead to see its structure
                if (data.data.length > 0) {
                    console.log('First Lead Structure:', JSON.stringify(data.data));
                }

                const processedLeads = data.data.map(processLeadData);
                console.log('Processed Leads:', processedLeads);

                onLeadsFiltered(processedLeads);
            } else {
                console.error('Unexpected data format:', data);
            }

            setIsOpen(false);
        } catch (err) {
            console.error('Error al filtrar:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeads();
    };

    return (
        <div className="filter-wrapper">
            {!isOpen ? (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="filter-toggle-button"
                    title="Abrir filtros"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            ) : (
                <>
                    <div className="filter-overlay" onClick={() => setIsOpen(false)} />
                    <div className="lead-filter-container">
                        <div className="filter-header">
                            <h3>Filtros de búsqueda</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="close-button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="close-icon">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="lead-filter-form">
                            <div className="lead-filter-grid">
                                <div className="form-group">
                                    <label className="form-label">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Fecha Fin</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Agente</label>
                                    <select
                                        name="agentId"
                                        value={filters.agentId}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    >
                                        <option value="">Todos los agentes</option>
                                        {filterOptions.agentes.map(agente => (
                                            <option key={agente._id} value={agente._id}>
                                                {agente.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tipo de Gestión</label>
                                    <select
                                        name="tipoGestion"
                                        value={filters.tipoGestion}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    >
                                        <option value="">Todos los tipos</option>
                                        {filterOptions.tiposGestion.map(tipo => (
                                            <option key={tipo} value={tipo}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Programa</label>
                                    <select
                                        name="programa"
                                        value={filters.programa}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    >
                                        <option value="">Todos los programas</option>
                                        {filterOptions.programas.map(programa => (
                                            <option key={programa} value={programa}>
                                                {programa}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Búsqueda</label>
                                    <input
                                        type="text"
                                        name="searchTerm"
                                        value={filters.searchTerm}
                                        onChange={handleFilterChange}
                                        placeholder="Buscar por nombre, correo o teléfono..."
                                        className="form-control search-input"
                                    />
                                </div>
                            </div>

                            <div className="button-wrapper">
                                <button
                                    type="submit"
                                    className={`filter-button ${loading ? 'filter-button-loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Cargando...' : 'Aplicar Filtros'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeadFilter;