import React, { useState, useEffect } from 'react';
import '../css/LeadFilter.css';
import { FilterOptions, FilterState, ProcessedLead } from '../@types/LeadFilter';

interface LeadFilterProps {
    onLeadsFiltered: (leads: ProcessedLead[]) => void;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface LeadResponse {
    id: number;
    nombre: string;
    numeroWhatsapp: string;
    conversacion: string;
    urlPhotoPerfil: string;
    TipoGestion: string;
    messages: LeadMessage[];
}

interface LeadMessage {
    id: string;
    _id: string;
    Agente: string;
    Cliente: string;
    message: string;
    timestamp: string;
    status: string;
    messageType: string;
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
        limit: 20
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFilterOptions();
        }
    }, [isOpen]);

    const fetchFilterOptions = async (): Promise<void> => {
        try {
            const response = await fetch(`${endpointGeneral}/filter-options`);
            const data = await response.json() as ApiResponse<FilterOptions>;

            if (data.success) {
                setFilterOptions(data.data);
            }
        } catch (err) {
            console.error('Error al cargar opciones:', err instanceof Error ? err.message : String(err));
        }
    };

    const formatDateWithTime = (dateStr: string, isEnd: boolean = false): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isEnd) {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
    };

    const processLeadData = (leadResponse: LeadResponse): ProcessedLead => {
        if (!leadResponse) {
            console.error('Lead response is undefined or null');
            return {
                id: 0,
                nombre: 'Unknown',
                numeroWhatsapp: '',
                conversacion: '',
                urlPhotoPerfil: '',
                TipoGestion: 'sin gestionar',
                messages: []
            };
        }

        return {
            id: leadResponse.id || 0,
            nombre: leadResponse.nombre || 'Unknown',
            numeroWhatsapp: leadResponse.numeroWhatsapp || '',
            conversacion: leadResponse.conversacion || '',
            urlPhotoPerfil: leadResponse.urlPhotoPerfil || '',
            TipoGestion: leadResponse.TipoGestion || 'sin gestionar',
            messages: leadResponse.messages || []
        };
    };

    const fetchLeads = async (): Promise<void> => {
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
            const data = await response.json() as ApiResponse<LeadResponse[]>;

            console.log('Response Status:', response.status);
            console.log('Full Response Data:', data);

            if (data.success && Array.isArray(data.data)) {
                console.log('Number of Leads:', data.data.length);

                const processedLeads = data.data.map(processLeadData);
                console.log('Processed Leads:', processedLeads);

                onLeadsFiltered(processedLeads);
            } else {
                console.error('Unexpected data format:', data);
            }

            setIsOpen(false);
        } catch (err) {
            console.error('Error al filtrar:', err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        fetchLeads();
    };

    return (
        <div className="">
            {!isOpen ? (
                <button 
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="filter-toggle-button"
                >
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