import { useState, useEffect } from 'react';
import axios from 'axios';
import { useKanbanStore } from '../store/kanbanStore';
import { ListId, Task } from '../../Kanban/@types/kanban';

interface UsePaginatedSalesProps {
    listId: ListId;
    initialPage?: number;
    itemsPerPage?: number;
}

// Interfaz para las tareas que vienen del servidor
interface ServerTask extends Omit<Task, 'listId'> {
    notas?: Array<{
        content: string;
        timestamp: string;
    }>;
    ventaPerdidaRazon?: string | null;
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
        inscritoOtraAgente: 'inscrito otra agente'
    };
    return mappings[listId as keyof typeof mappings] || 'sin gestionar';
};

export const usePaginatedSales = ({
    listId,
    initialPage = 1,
    itemsPerPage = 10
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

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL_GENERAL}/sales?${params}`
            );

            const { tasks, pagination } = response.data.data;

            // Limpiar las tareas existentes antes de agregar las nuevas
            clearStore();

            // Agregar cada tarea usando updateTaskListByTipoGestion
            tasks.forEach((task: ServerTask) => {
                const whatsappMatch = task.content.match(/WhatsApp: (\d+)/);
                const nameMatch = task.content.match(/Nombre: ([^\n]+)/);

                if (whatsappMatch && nameMatch) {
                    const payload = {
                        notas: task.notas ? task.notas.map(nota => ({
                            content: nota.content,
                            timestamp: new Date(nota.timestamp)
                        })) : [],
                        ventaPerdidaRazon: task.ventaPerdidaRazon || null
                    };

                    updateTaskListByTipoGestion(
                        whatsappMatch[1],
                        tipoGestion,
                        nameMatch[1].trim(),
                        payload
                    );
                }
            });

            setTotalPages(pagination.totalPages);
            return pagination;

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos');
            console.error('Error fetching sales:', err);
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
    }, [listId]);

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