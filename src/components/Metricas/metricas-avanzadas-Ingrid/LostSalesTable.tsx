import { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnDef,
} from '@tanstack/react-table';
import '../../../css/metricas/table.css';

interface Agent {
    nombre: string;
    correo: string;
}

interface Client {
    nombreCompleto: string;
    telefono: string;
    programa: string;
    agente: Agent;
    ciudad?: string;
}

interface CityGroup {
    ciudad: string;
    cantidad: number;
    clientes: Client[];
}

interface ApiResponse {
    success: boolean;
    total: number;
    totalPages?: number;
    currentPage?: number;
    data: CityGroup[];
}

interface LostSalesTableProps {
    searchQuery: string;
}

const LostSalesTable: React.FC<LostSalesTableProps> = ({ searchQuery }) => {
    const [data, setData] = useState<Client[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 4;

    const columns: ColumnDef<Client, unknown>[] = [
        { 
            header: 'Ciudad',
            accessorKey: 'ciudad',
            cell: (info) => info.getValue() || 'N/A'
        },
        { 
            header: 'Cliente',
            accessorKey: 'nombreCompleto',
            cell: (info) => info.getValue() || 'N/A'
        },
        { 
            header: 'Teléfono',
            accessorKey: 'telefono',
            cell: (info) => info.getValue() || 'N/A'
        },
        { 
            header: 'Programa',
            accessorKey: 'programa',
            cell: (info) => info.getValue() || 'N/A'
        },
        { 
            header: 'Agente',
            accessorKey: 'agente.nombre',
            cell: (info) => info.getValue() || 'N/A'
        },
    ];

    const fetchData = async (page: number, query: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                query: query.trim()
            });

            // Agregamos los parámetros de ordenamiento si existen
            if (sorting.length > 0) {
                params.append('sortBy', sorting[0].id);
                params.append('sortOrder', sorting[0].desc ? 'desc' : 'asc');
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL_GENERAL}/lost-sales?${params}`
            );
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result: ApiResponse = await response.json();

            // Aplanar los datos
            const flattenedData = result.data.reduce((acc: Client[], cityGroup: CityGroup) => {
                const clients = cityGroup.clientes.map((client: Client) => ({
                    ...client,
                    ciudad: cityGroup.ciudad
                }));
                return [...acc, ...clients];
            }, []);

            setData(flattenedData);
            setTotalPages(result.totalPages || 1);
            setTotalItems(result.total);
            
            // Solo actualizar la página actual si viene del servidor
            if (result.currentPage) {
                setCurrentPage(result.currentPage);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Aquí podrías agregar un estado para manejar errores y mostrarlos en la UI
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para manejar cambios en la búsqueda
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new search
            fetchData(1, searchQuery);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Efecto para manejar cambios en el ordenamiento
    useEffect(() => {
        fetchData(currentPage, searchQuery);
    }, [sorting]);

    const table = useReactTable({
        data,
        columns,
        state: { 
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchData(newPage, searchQuery);
        }
    };

    return (
        <div className="table-container">
            {isLoading ? (
                <div className="loading">Cargando...</div>
            ) : (
                <>  
                    <table className="lost-sales-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className={`cursor-pointer hover:bg-gray-50 ${
                                                header.column.getIsSorted() ? 'bg-gray-100' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                <span className="ml-2">
                                                    {header.column.getIsSorted() === "asc" ? "↑" : 
                                                     header.column.getIsSorted() === "desc" ? "↓" : "↕"}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    <div className="pagination mt-4">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Anterior
                        </button>
                        
                        <div className="pagination-pages">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`pagination-number ${
                                            currentPage === pageNum ? 'active' : ''
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Siguiente
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            {'>>'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LostSalesTable;