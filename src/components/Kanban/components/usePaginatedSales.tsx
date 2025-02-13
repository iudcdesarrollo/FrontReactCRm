import { useState, useEffect } from 'react';
import axios from 'axios';
import { useKanbanStore } from '../store/kanbanStore';
import { ListId } from '../../Kanban/@types/kanban';

interface UsePaginatedSalesProps {
    listId: ListId;
    initialPage?: number;
    itemsPerPage?: number;
    email: string;
    paginationKey?: string;
}

const mappings: Record<ListId, string> = {
    sinGestionar: 'sin gestionar',
    conversacion: 'conversacion',
    depurar: 'depuracion',
    llamada: 'llamada',
    segundaLlamada: 'segunda llamada',
    inscrito: 'inscrito',
    estudiante: 'estudiante',
    ventaPerdida: 'venta perdida',
    inscritoOtraAgente: 'inscrito otra agente',
    gestionado: 'gestionado',
    matriculados: 'matriculados'
};

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

const paginationStates = new Map<string, {
    currentPage: number;
    selectedDate: Date | null;
}>();

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
        gestionado: 'gestionado',
        matriculados: 'matriculados'
    };
    return mappings[listId as keyof typeof mappings] || 'sin gestionar';
};

export const usePaginatedSales = ({
    listId,
    initialPage = 1,
    itemsPerPage = 5,
    email,
    paginationKey = listId
}: UsePaginatedSalesProps) => {
    const initialState = paginationStates.get(paginationKey) || {
        currentPage: initialPage,
        selectedDate: null as Date | null
    };

    const [currentPage, setCurrentPage] = useState(initialState.currentPage);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialState.selectedDate);

    const updateTaskListByTipoGestion = useKanbanStore(state => state.updateTaskListByTipoGestion);

    const fetchSales = async (page: number, date: Date | null) => {
        setIsLoading(true);
        setError(null);

        try {
            const tipoGestion = mapListIdToTipoGestion(listId);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                tipoGestion,
                correoAgente: email
            });

            if (date) {
                params.append('date', date.toISOString());
            }

            const response = await axios.get<ServerResponse>(
                `${import.meta.env.VITE_API_URL_GENERAL}/sales?${params}`
            );

            // console.log(`esto es lo que llega en la response: ${JSON.stringify(response.data)}`);
            
            if (!response.data?.success || !response.data?.data) {
                throw new Error('Respuesta inválida del servidor');
            }

            const currentState = useKanbanStore.getState();
            
            const updatedLists = { ...currentState.lists };
            
            if (updatedLists[listId]) {
                updatedLists[listId] = {
                    ...updatedLists[listId],
                    tasks: []
                };
            }

            useKanbanStore.setState({
                lists: updatedLists
            });

            response.data.data.forEach(item => {
                const targetListId = Object.keys(mappings).find(
                    (key) => mappings[key as ListId] === item.tipoGestion
                ) as ListId | undefined;
            
                if (targetListId) {
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
                }
            });

            setTotalPages(response.data.pagination.totalPages);

            paginationStates.set(paginationKey, {
                currentPage: page,
                selectedDate: date
            });

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