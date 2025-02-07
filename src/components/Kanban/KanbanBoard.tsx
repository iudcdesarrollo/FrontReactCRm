import { closestCenter, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useState, useCallback, useRef } from "react";
import { useKanbanStore } from "../Kanban/store/kanbanStore";
import { INITIAL_LISTS, KanbanBoardProps, SelectedLeadData, type ListId, type Lists, type Task as TaskType, } from "../Kanban/@types/kanban";
import List from "./components/List";
import './css/KanbanBoardPrincipal.css';
import SearchOverlay from "./components/SearchOverlay";
import { ChatView } from "../preview/ChatView";
import { mapListIdToTipoGestion } from "./utils/mapListIdToTipoGestion";
import { updateTipoGestion } from "./utils/updateTipoGestion";
import { Agente, Lead } from "../types";
import { BackendResponse } from "./typesKanbanPrincipal";

const enpoinyBasic = import.meta.env.VITE_API_URL_GENERAL;

export default function KanbanBoard({
    leads,
    soket,
    managementCounts,
    role = 'agent'
}: KanbanBoardProps) {
    // console.log(`esto es lo que trae el conteso: ${JSON.stringify(managementCounts, null, 2)}, ${JSON.stringify(totalCount, null, 2)}`);
    // console.log(`informacion de leads: ${JSON.stringify(leads, null, 2)}`);
    const { lists, initializeLists, moveTask, reorderTask, updateTaskListByTipoGestion } = useKanbanStore();
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);
    const processedLeadsRef = useRef(new Set<number>());
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLeadData, setSelectedLeadData] = useState<SelectedLeadData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const boardRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

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

    const handleLeadClick = async (numero: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${enpoinyBasic}/getConversacionNumber/${numero}`);
            if (!response.ok) {
                throw new Error('Error al cargar la conversación');
            }
            const data: BackendResponse = await response.json();

            if (!data?.conversation?.mensajes) {
                throw new Error('No se encontraron mensajes para esta conversación');
            }

            const formattedMessages = data.conversation.mensajes.map((msg) => ({
                id: msg.mensaje_id,
                _id: msg.mensaje_id,
                Cliente: msg.tipo === 'entrante' ? data.conversation.numero_cliente : undefined,
                Agente: msg.tipo === 'saliente' ? data.conversation.correo_agente : undefined,
                message: msg.archivo || msg.contenido,
                timestamp: msg.fecha,
                fileUrl: msg.archivo,
                fileType: msg.contenido.includes('/') ? msg.contenido : undefined,
                fileName: msg.mensaje,
                status: msg.statusHistory?.length ?
                    msg.statusHistory[msg.statusHistory.length - 1].status :
                    'pending'
            }));

            const formattedLead: Lead = {
                id: parseInt(data.conversation._id.slice(-6), 16) || Date.now(),
                nombre: data.conversation.nombre_cliente,
                numeroWhatsapp: data.conversation.numero_cliente,
                conversacion: data.conversation.tipo_gestion,
                urlPhotoPerfil: data.conversation.profilePictureUrl || '',
                profilePictureUrl: data.conversation.profilePictureUrl,
                TipoGestion: data.conversation.tipo_gestion,
                messages: formattedMessages
            };

            const formattedAgente: Agente = {
                id: 1,
                nombre: data.conversation.nombre_agente || 'Agente',
                correo: data.conversation.correo_agente || '',
                rol: data.conversation.rol_agente || 'agente',
                leads: [formattedLead],
            };

            setSelectedLeadData({
                conversacionData: data.conversation,
                formattedLead,
                formattedAgente,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!boardRef.current || e.button !== 0) return; // Solo botón izquierdo

        setIsDragging(true);
        setStartX(e.pageX - boardRef.current.offsetLeft);
        setScrollLeft(boardRef.current.scrollLeft);
        document.body.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (boardRef.current) {
            document.body.style.cursor = 'default';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !boardRef.current) return;

        e.preventDefault();
        const x = e.pageX - boardRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        boardRef.current.scrollLeft = scrollLeft - walk;
    };

    useEffect(() => {
        const handlePhoneClick = async (event: Event) => {
            const { phoneNumber } = (event as CustomEvent).detail;
            await handleLeadClick(phoneNumber);
        };

        window.addEventListener('phoneClick', handlePhoneClick);
        return () => window.removeEventListener('phoneClick', handlePhoneClick);
    }, []);

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
        const cleanup = () => {
            document.body.style.cursor = 'default';
            setIsDragging(false);
        };

        document.addEventListener('mouseup', cleanup);
        return () => document.removeEventListener('mouseup', cleanup);
    }, []);

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

            if (activeTaskDetails?.phoneNumber) {
                await updateTipoGestion(
                    activeTaskDetails.phoneNumber,
                    activeTaskDetails.listId
                );
            }

            if (!event.active || !event.over) return;

            const activeId = event.active.id as string;
            const overId = event.over.id as string;

            if (!activeId || !overId) return;

            const activeList = findListByTaskId(lists, activeId);
            if (!activeList) return;

            if (INITIAL_LISTS.includes(overId as ListId)) {
                const overList = lists[overId as ListId];
                if (!overList || activeList.id === overList.id) return;

                const task = activeList.tasks.find(t => t.id === activeId);
                if (task) {
                    const whatsappMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);
                    if (whatsappMatch?.[1]) {
                        const numeroWhatsapp = whatsappMatch[1];
                        const newTipoGestion = mapListIdToTipoGestion(overId);
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
                const task = activeList.tasks.find(t => t.id === activeId);
                if (task) {
                    const whatsappMatch = task.content.match(/(?:WhatsApp:?\s*)(\d+)/i);
                    if (whatsappMatch?.[1]) {
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
        } catch (error) {
            console.error('Error en handleDragEnd:', error);
        } finally {
            setActiveTask(null);
        }
    }, [lists, findListByTaskId, moveTask, reorderTask]);

    if (loading) {
        return <div>Cargando conversación...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (selectedLeadData) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col bg-white">
                <ChatView
                    selectedLead={selectedLeadData}
                    onBack={() => setSelectedLeadData(null)}
                    socket={soket}
                />
            </div>
        );
    }

    if (!isInitialized) {
        return <div>Cargando tablero...</div>;
    }

    const restrictedLists = role === 'agent' ?
        ['estudiante', 'inscritoOtraAgente', 'gestionado', 'ventaPerdida'] : [];

    const renderableListIds = INITIAL_LISTS.filter(listId => {
        const list = lists[listId];
        return !restrictedLists.includes(listId) || (list && list.tasks.length > 0);
    });

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
                        onLeadSelect={handleLeadClick}
                    />
                </div>
                <div className="kanban-content">
                    <div
                        ref={boardRef}
                        className={`kanban-board ${isDragging ? 'dragging' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                    >
                        <div className="kanban-lists">
                            {renderableListIds.map((listId: ListId) => {
                                const taskIds = lists[listId]?.tasks.map((t: TaskType) => t.id) || [];
                                return (
                                    <div key={listId} className="kanban-list">
                                        <SortableContext
                                            items={taskIds}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <List
                                                listId={listId}
                                                managementCounts={managementCounts}
                                                role={role}
                                            />
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