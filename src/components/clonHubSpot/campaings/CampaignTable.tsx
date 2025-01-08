import React, { useState } from 'react';
import { Search } from 'lucide-react';

// Define interfaces for our data types
interface Campaign {
    id: number;
    campaign: string;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20] as const;

const campaignData: Campaign[] = [
    { id: 1, campaign: 'Campaña Navidad 2024' },
    { id: 2, campaign: 'Black Friday Q4' },
    { id: 3, campaign: 'Lanzamiento Producto Nuevo' },
    { id: 4, campaign: 'Campaña Redes Sociales' },
    { id: 5, campaign: 'Email Marketing Q1' },
    { id: 6, campaign: 'Promoción Verano' },
    { id: 7, campaign: 'Campaña Fidelización' },
    { id: 8, campaign: 'Marketing de Contenidos' },
    { id: 9, campaign: 'Campaña SEO/SEM' },
    { id: 10, campaign: 'Evento Virtual' }
];

const CampaignTable: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(5);

    // Filter campaigns based on search query
    const filteredCampaigns = campaignData.filter(campaign =>
        campaign.campaign.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const pageCount = Math.ceil(filteredCampaigns.length / pageSize);
    const paginatedCampaigns = filteredCampaigns.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    // Navigation handlers
    const handlePreviousPage = (): void => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = (): void => {
        setCurrentPage(prev => Math.min(pageCount - 1, prev + 1));
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); // Reset to first page when searching
    };

    return (
        <div className="campaign-table-container">
            {/* Header */}
            <div className="campaign-controls">
                <h2 className="text-2xl font-semibold text-white">Campañas</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar campaña..."
                        className="search-input"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto min-h-0">
                <table className="campaign-table">
                    <thead>
                        <tr>
                            <th className="px-8 py-4">#</th>
                            <th className="px-8 py-4">CAMPAÑA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCampaigns.map((campaign) => (
                            <tr
                                key={campaign.id}
                                className="table-row-hover"
                            >
                                <td className="px-8 py-4">
                                    {campaign.id}
                                </td>
                                <td className="px-8 py-4">
                                    {campaign.campaign}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="page-size-select"
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map(size => (
                            <option key={size} value={size}>
                                Mostrar {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-400">
                        Página {currentPage + 1} de {pageCount}
                    </span>
                </div>
                <div className="pagination-controls">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                        className="pagination-button"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === pageCount - 1}
                        className="pagination-button"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignTable;