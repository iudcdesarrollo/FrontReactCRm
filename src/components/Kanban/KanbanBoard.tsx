import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState, useCallback, useRef } from "react";
import { useKanbanStore } from "../Kanban/store/kanbanStore";
import {
    INITIAL_LISTS,
    type ListId,
    type Lists,
    type Task as TaskType,
} from "../Kanban/@types/kanban";
import List from "./components/List";
import './css/KanbanBoardPrincipal.css';
import { Lead } from "../types";
import SearchOverlay from "./components/SearchOverlay";

const enpoinyBasic = import.meta.env.VITE_API_URL_GENERAL;

const mapListIdToTipoGestion = (listId: string): string => {
    const mappings: Record<string, string> = {
        'sinGestionar': 'sin gestionar',
        'conversacion': 'conversacion',
        'depurar': 'depuracion',
        'llamada': 'llamada',
        'segundaLlamada': 'segunda llamada',
        'estudiante': 'inscrito',
        'revision': 'venta perdida'
    };
    return mappings[listId] || 'sin gestionar';
};

const updateTipoGestion = async (numeroWhatsapp: string, tipoGestion: string) => {
    try {
        const response = await fetch(`${enpoinyBasic}/UpdateTipoGestion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numero_cliente: numeroWhatsapp,
                tipo_gestion: tipoGestion
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update tipo gestion');
        }
    } catch (error) {
        console.error('Error updating tipo gestion:', error);
    }
};

interface KanbanBoardProps {
    leads: Lead[] | undefined;
}

export default function KanbanBoard({ leads }: KanbanBoardProps) {
    const { lists, initializeLists, moveTask, reorderTask, updateTaskListByTipoGestion } = useKanbanStore();
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);
    const processedLeadsRef = useRef(new Set<number>());
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
                distance: 1,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (!isInitialized) {
                await initializeLists();
                if (isMounted) {
                    setIsInitialized(true);
                }
            }
        };

        init();
        return () => {
            isMounted = false;
        };
    }, [isInitialized, initializeLists]);

    useEffect(() => {
        if (!isInitialized || !leads?.length) return;

        const unprocessedLeads = leads.filter(lead => !processedLeadsRef.current.has(lead.id));
        if (!unprocessedLeads.length) return;

        unprocessedLeads.forEach(lead => {
            const taskExists = Object.values(lists).some(list =>
                list?.tasks.some(task =>
                    task.content.includes(`WhatsApp: ${lead.numeroWhatsapp}`)
                )
            );

            if (!taskExists) {
                updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
                processedLeadsRef.current.add(lead.id);
            }
        });
    }, [leads, lists, isInitialized, updateTaskListByTipoGestion]);

    const findListByTaskId = useCallback((allLists: Lists, taskId: string) => {
        return Object.values(allLists).find((list) =>
            list?.tasks.some((task: TaskType) => task.id === taskId)
        );
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const activeList = findListByTaskId(lists, active.id as string);
        if (!activeList) return;

        const task = activeList.tasks.find((t: TaskType) => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    }, [lists, findListByTaskId]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;
            moveTask(activeId, activeList.id, overList.id, overList.tasks.length);
            return;
        }

        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id !== overList.id) {
            const overIndex = overList.tasks.findIndex((t: TaskType) => t.id === overId);
            const finalIndex = overIndex === -1 ? overList.tasks.length : overIndex;
            moveTask(activeId, activeList.id, overList.id, finalIndex);
        }
    }, [lists, findListByTaskId, moveTask]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        try {
            const findTaskDetails = (taskId: string) => {
                for (const [listId, list] of Object.entries(lists)) {
                    const task = list?.tasks.find(t => t.id === taskId);
                    if (task) {
                        const whatsappMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);
                        return {
                            task,
                            phoneNumber: whatsappMatch ? whatsappMatch[1] : 'No encontrado',
                            listId,
                            fullContent: task.content
                        };
                    }
                }
                return null;
            };

            const activeTaskDetails = findTaskDetails(event.active.id as string);

            console.log('🚀 Detalles Completos del Evento:', {
                activeId: event.active.id,
                overId: event.over?.id,
                activeType: event.active.data.current?.type,
                overType: event.over?.data.current?.type,
                taskContent: activeTaskDetails?.fullContent,
                phoneNumber: activeTaskDetails?.phoneNumber,
                fromList: activeTaskDetails?.listId
            });

            await updateTipoGestion(
                activeTaskDetails?.phoneNumber || '',
                activeTaskDetails?.listId || ''
            );

            if (!event.active || !event.over) {
                console.warn('❌ No hay objetivo de destino válido');
                return;
            }

            const activeId = event.active.id as string;
            const overId = event.over.id as string;

            if (!activeId || !overId) {
                console.warn('❌ IDs inválidos en el evento');
                return;
            }

            const activeList = findListByTaskId(lists, activeId);
            if (!activeList) {
                console.warn(`❌ No se encontró lista para la tarea activa: ${activeId}`);
                return;
            }

            if (INITIAL_LISTS.includes(overId as ListId)) {
                const overList = lists[overId as ListId];

                if (!overList || activeList.id === overList.id) {
                    console.warn('❌ Movimiento inválido entre listas iguales o inexistentes');
                    return;
                }

                const task = activeList.tasks.find(t => t.id === activeId);
                if (task) {
                    const whatsappMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);

                    if (whatsappMatch && whatsappMatch[1]) {
                        const numeroWhatsapp = whatsappMatch[1];
                        const newTipoGestion = mapListIdToTipoGestion(overId);

                        console.log(`📞 Moviendo tarea de WhatsApp ${numeroWhatsapp} a columna: ${overId}`);
                        console.log(`🔄 Nuevo Tipo de Gestión: ${newTipoGestion}`);
                        console.log(`📋 Contenido completo de la tarea:\n${task.content}`);

                        try {
                            await updateTipoGestion(numeroWhatsapp, newTipoGestion);
                        } catch (error) {
                            console.error('🚨 Error actualizando tipo de gestión:', error);
                        }
                    } else {
                        console.warn(`⚠️ No se encontró número de WhatsApp en la tarea: ${task.content}`);
                    }
                }

                moveTask(activeId, activeList.id, overList.id, overList.tasks.length);
                return;
            }

            const overList = findListByTaskId(lists, overId);
            if (!overList) {
                console.warn(`❌ No se encontró lista de destino para la tarea: ${overId}`);
                return;
            }

            if (activeList.id === overList.id) {
                const oldIndex = activeList.tasks.findIndex(t => t.id === activeId);
                const newIndex = overList.tasks.findIndex(t => t.id === overId);

                if (oldIndex !== newIndex) {
                    console.log(`🔀 Reordenando tarea dentro de la misma lista: ${activeList.id}`);
                    reorderTask(activeList.id, oldIndex, newIndex);
                }
            }
            else {
                const task = activeList.tasks.find(t => t.id === activeId);
                if (task) {
                    const whatsappMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);

                    if (whatsappMatch && whatsappMatch[1]) {
                        const numeroWhatsapp = whatsappMatch[1];
                        const newTipoGestion = mapListIdToTipoGestion(overList.id);

                        console.log(`📞 Moviendo tarea de WhatsApp ${numeroWhatsapp} a columna: ${overList.id}`);
                        console.log(`🔄 Nuevo Tipo de Gestión: ${newTipoGestion}`);
                        console.log(`📋 Contenido completo de la tarea:\n${task.content}`);

                        try {
                            await updateTipoGestion(numeroWhatsapp, newTipoGestion);
                        } catch (error) {
                            console.error('🚨 Error actualizando tipo de gestión:', error);
                        }
                    } else {
                        console.warn(`⚠️ No se encontró número de WhatsApp en la tarea: ${task.content}`);
                    }
                }

                const overIndex = overList.tasks.findIndex(t => t.id === overId);
                moveTask(
                    activeId,
                    activeList.id,
                    overList.id,
                    overIndex === -1 ? overList.tasks.length : overIndex
                );
            }
        } catch (error) {
            console.error('💥 Error crítico en handleDragEnd:', error);
            setActiveTask(null);
        }
    }, [lists, findListByTaskId, moveTask, reorderTask]);

    if (!isInitialized) {
        return <div>Cargando tablero...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-container">
                <h1 className="kanban-title">
                    Tablero Kanban
                </h1>
                <div className="search-wrapper">
                    <SearchOverlay
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        lists={lists}
                    />
                </div>
                <div className="kanban-content">
                    <div className="kanban-board">
                        <div className="kanban-lists">
                            {INITIAL_LISTS.map((listId: ListId) => {
                                const taskIds = lists[listId]?.tasks.map((t: TaskType) => t.id) || [];
                                return (
                                    <div key={listId} className="kanban-list">
                                        <SortableContext
                                            items={taskIds}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <List listId={listId} />
                                        </SortableContext>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <DragOverlay>
                    {activeTask && (
                        <div className="task-overlay">
                            <p className="task-overlay-content">
                                {activeTask.content}
                            </p>
                        </div>
                    )}
                </DragOverlay>
            </div>
        </DndContext>
    );
}