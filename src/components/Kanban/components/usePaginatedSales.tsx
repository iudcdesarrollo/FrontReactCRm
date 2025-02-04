import { useState, useEffect } from 'react';
import axios from 'axios';
import { useKanbanStore } from '../store/kanbanStore';
import { ListId } from '../../Kanban/@types/kanban';

interface UsePaginatedSalesProps {
    listId: ListId;
    initialPage?: number;
    itemsPerPage?: number;
}

interface ServerResponse {
    success: boolean;
    data: Array<{
        numeroCliente: string;
        nombreCliente: string;
        nombreAgente: string;
        ultimaNota: string;
        razonVentaPerdida: string | null;
        tipoGestion: string;
        agente: {
            nombre: string;
            correo: string;
            rol: string;
        };
    }>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

const mapListIdToTipoGestion = (listId: ListId): string => {
    const mappings = {
        sinGestionar: 'sin gestionar',
        conversacion: 'conversacion',
        depurar: 'depuracion',
        llamada: 'llamada',
        segundaLlamada: 'segunda llamada',
        inscrito: 'inscrito',
        estudiante: 'estudiante',
        ventaPerdida: 'venta perdida',
        inscritoOtraAgente: 'inscrito otra agente',
        gestionado: 'gestionado'
    };
    return mappings[listId as keyof typeof mappings] || 'sin gestionar';
};

export const usePaginatedSales = ({
    listId,
    initialPage = 1,
    itemsPerPage = 5
}: UsePaginatedSalesProps) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const updateTaskListByTipoGestion = useKanbanStore(state => state.updateTaskListByTipoGestion);
    const clearStore = useKanbanStore(state => state.clearStore);

    const fetchSales = async (page: number, date?: Date | null) => {
        setIsLoading(true);
        setError(null);

        try {
            const tipoGestion = mapListIdToTipoGestion(listId);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                tipoGestion
            });

            if (date) {
                params.append('date', date.toISOString());
            }

            const response = await axios.get<ServerResponse>(
                `${import.meta.env.VITE_API_URL_GENERAL}/sales?${params}`
            );

            console.log(`esto es lo que trae response de sales: ${JSON.stringify(response, null, 2)}`);

            if (!response.data?.success || !response.data?.data) {
                throw new Error('Respuesta inválida del servidor');
            }

            clearStore();

            response.data.data.forEach(item => {
                updateTaskListByTipoGestion(
                    item.numeroCliente,
                    item.tipoGestion,
                    item.nombreCliente,
                    {
                        notas: item.ultimaNota ? [{
                            content: item.ultimaNota,
                            timestamp: new Date()
                        }] : [],
                        ventaPerdidaRazon: item.razonVentaPerdida
                    }
                );
            });

            setTotalPages(response.data.pagination.totalPages);
            return response.data.pagination;

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos');
            console.error('Error fetching sales:', err);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setCurrentPage(newPage);
        await fetchSales(newPage, selectedDate);
    };

    const handleDateChange = async (date: Date | null) => {
        setSelectedDate(date);
        setCurrentPage(1);
        await fetchSales(1, date);
    };

    useEffect(() => {
        fetchSales(currentPage, selectedDate);
    }, [listId, currentPage, selectedDate]);

    return {
        currentPage,
        totalPages,
        isLoading,
        error,
        selectedDate,
        handlePageChange,
        handleDateChange
    };
};