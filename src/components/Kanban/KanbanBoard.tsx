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

// Helper function to map list IDs to tipo gestion values
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

// Function to make API call for updating tipo gestion
const updateTipoGestion = async (numeroWhatsapp: string, tipoGestion: string) => {
    try {
        const response = await fetch('https://w4zv821b-3000.use2.devtunnels.ms/api/UpdateTipoGestion', {
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
                updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion);
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
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;

            // Extract WhatsApp number and make API call before moving task
            const task = activeList.tasks.find(t => t.id === activeId);
            if (task) {
                const whatsappMatch = task.content.match(/WhatsApp: (\d+)/);
                if (whatsappMatch && whatsappMatch[1]) {
                    const numeroWhatsapp = whatsappMatch[1];
                    const newTipoGestion = mapListIdToTipoGestion(overId);

                    // Make API call before moving the task
                    await updateTipoGestion(numeroWhatsapp, newTipoGestion);
                }
            }

            moveTask(activeId, activeList.id, overList.id, overList.tasks.length);
            return;
        }

        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id === overList.id) {
            const oldIndex = activeList.tasks.findIndex(t => t.id === activeId);
            const newIndex = overList.tasks.findIndex(t => t.id === overId);
            if (oldIndex !== newIndex) {
                reorderTask(activeList.id, oldIndex, newIndex);
            }
        } else {
            // Extract WhatsApp number and make API call before moving task
            const task = activeList.tasks.find(t => t.id === activeId);
            if (task) {
                const whatsappMatch = task.content.match(/WhatsApp: (\d+)/);
                if (whatsappMatch && whatsappMatch[1]) {
                    const numeroWhatsapp = whatsappMatch[1];
                    const newTipoGestion = mapListIdToTipoGestion(overList.id);

                    await updateTipoGestion(numeroWhatsapp, newTipoGestion);
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