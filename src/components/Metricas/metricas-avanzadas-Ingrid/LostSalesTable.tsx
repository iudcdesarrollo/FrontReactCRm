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
import '../../../css/metricas/table.css'

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

const LostSalesTable = () => {
    const [data, setData] = useState<Client[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const ITEMS_PER_PAGE = 4;

    const columns: ColumnDef<Client, unknown>[] = [
        {
            header: 'Ciudad',
            accessorKey: 'ciudad',
        },
        {
            header: 'Cliente',
            accessorKey: 'nombreCompleto',
        },
        {
            header: 'Teléfono',
            accessorKey: 'telefono',
        },
        {
            header: 'Programa',
            accessorKey: 'programa',
        },
        {
            header: 'Agente',
            accessorKey: 'agente.nombre',
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL_GENERAL}/lost-sales?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
                );
                const result: ApiResponse = await response.json();

                const flattenedData = result.data.reduce((acc: Client[], cityGroup: CityGroup) => {
                    const clients = cityGroup.clientes.map((client: Client) => ({
                        ...client,
                        ciudad: cityGroup.ciudad
                    }));
                    return [...acc, ...clients];
                }, []);

                setData(flattenedData.slice(0, ITEMS_PER_PAGE));
                setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

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
        setCurrentPage(newPage);
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
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getIsSorted() && (
                                                <span className="ml-2">
                                                    {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LostSalesTable;