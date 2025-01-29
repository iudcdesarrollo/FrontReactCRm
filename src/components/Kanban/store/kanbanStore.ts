import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    INITIAL_LISTS,
    LIST_TITLES,
    type ListId,
    type Lists,
    type Task,
    type TaskId,
} from "../../Kanban/@types/kanban";

interface PersistedState {
    version: number;
    lastSynced: string | null;
    lists: Lists;
}

interface KanbanState {
    version: number;
    lastSynced: string | null;
    lists: Lists;
    initializeLists: () => void;
    addTask: (listId: ListId, content: string) => void;
    updateTask: (taskId: TaskId, content: string) => void;
    deleteTask: (taskId: TaskId) => void;
    moveTask: (
        taskId: TaskId,
        fromListId: ListId,
        toListId: ListId,
        newIndex: number
    ) => void;
    reorderTask: (listId: ListId, oldIndex: number, newIndex: number) => void;
    updateTaskListByTipoGestion: (numeroWhatsapp: string, newTipoGestion: string, nameLead: string, payload?: TaskPayload) => void;
    clearStore: () => void;
    syncWithRemote?: () => Promise<void>;
}

const STORE_VERSION = 1;
const STORE_NAME = "kanban-store";

const mapTipoGestionToListId = (tipoGestion: string): ListId => {
    const tipoGestionLower = tipoGestion.toLowerCase().trim();
    const mappings: Record<string, ListId> = {
        'sin gestionar': 'sinGestionar',
        'conversacion': 'conversacion',
        'depuracion': 'depurar',
        'llamada': 'llamada',
        'segunda llamada': 'segundaLlamada',
        'duplicado': 'duplicado',
        'inscrito': 'inscrito',
        'estudiante': 'estudiante',
        'venta perdida': 'ventaPerdida',
        'revision': 'revision',
        'todos': 'sinGestionar'
    };
    return mappings[tipoGestionLower] || 'sinGestionar';
};

interface TaskPayload {
    notas?: Array<{
        content: string;
        timestamp: Date;
    }>;
    ventaPerdidaRazon?: string | null;
}

export const useKanbanStore = create<KanbanState>()(
    persist(
        (set) => ({
            version: STORE_VERSION,
            lastSynced: null,
            lists: {},

            initializeLists: () => {
                set((state) => {
                    if (Object.keys(state.lists).length > 0) {
                        return state;
                    }

                    const initialLists: Lists = {};
                    INITIAL_LISTS.forEach((listId) => {
                        initialLists[listId] = {
                            id: listId,
                            title: LIST_TITLES[listId],
                            tasks: [],
                        };
                    });
                    return {
                        lists: initialLists,
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            addTask: (listId, content) => {
                set((state) => {
                    const newTask: Task = {
                        id: crypto.randomUUID(),
                        content,
                        listId,
                        order: state.lists[listId]?.tasks.length ?? 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: [
                                    ...(state.lists[listId]?.tasks ?? []),
                                    newTask,
                                ],
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            updateTask: (taskId, content) => {
                set((state) => {
                    const listId = Object.keys(state.lists).find((lid) =>
                        state.lists[lid as ListId]?.tasks.some(
                            (t: Task) => t.id === taskId
                        )
                    ) as ListId;

                    if (!listId || !state.lists[listId]) return state;

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: state.lists[listId]!.tasks.map((t: Task) =>
                                    t.id === taskId
                                        ? {
                                            ...t,
                                            content,
                                            updatedAt: new Date().toISOString(),
                                        }
                                        : t
                                ),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            deleteTask: (taskId) => {
                set((state) => {
                    const listId = Object.keys(state.lists).find((lid) =>
                        state.lists[lid as ListId]?.tasks.some(
                            (t: Task) => t.id === taskId
                        )
                    ) as ListId;

                    if (!listId || !state.lists[listId]) return state;

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: state.lists[listId]!.tasks.filter(
                                    (t: Task) => t.id !== taskId
                                ),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            updateTaskListByTipoGestion: (
                numeroWhatsapp: string,
                newTipoGestion: string,
                nameLead: string,
                payload?: TaskPayload
            ) => {
                set((state) => {
                    const updatedLists: Lists = JSON.parse(JSON.stringify(state.lists));
                    let taskToMove: Task | null = null;
                    let originalListId: ListId | null = null;

                    // console.log('Estado inicial de las listas:', updatedLists);

                    for (const listId of Object.keys(updatedLists) as Array<keyof typeof updatedLists>) {
                        const list = updatedLists[listId];
                        if (!list) continue;

                        const taskIndex = list.tasks.findIndex((task: Task) =>
                            task.content.includes(`WhatsApp: ${numeroWhatsapp}`)
                        );

                        if (taskIndex !== -1) {
                            taskToMove = list.tasks[taskIndex];
                            originalListId = listId;
                            const nameMatch = taskToMove.content.match(/Nombre: ([^\n]+)/);
                            if (nameMatch && !nameLead) {
                                nameLead = nameMatch[1].trim();
                            }
                            break;
                        }
                    }

                    // console.log('Tarea encontrada:', taskToMove);
                    // console.log('ID original de la lista:', originalListId);

                    const newListId = mapTipoGestionToListId(newTipoGestion);
                    const targetList = updatedLists[newListId];

                    if (!targetList) {
                        console.log('No se encontró la lista de destino:', newListId);
                        return state;
                    }

                    const createTaskContent = () => {
                        let content = `Nombre: ${nameLead || 'Sin nombre'}
                        WhatsApp: ${numeroWhatsapp}
                        Tipo de Gestión: ${newTipoGestion}`;

                        if (payload?.ventaPerdidaRazon) {
                            content += `\nRazón de Venta Perdida: ${payload.ventaPerdidaRazon}`;
                        }

                        if (payload?.notas && payload.notas.length > 0) {
                            content += '\nNotas:';
                            payload.notas.forEach(nota => {
                                content += `\n- ${nota.content} (${new Date(nota.timestamp).toLocaleString()})`;
                            });
                        }

                        return content.trim();
                    };

                    if (taskToMove && originalListId) {
                        const originalList = updatedLists[originalListId];
                        if (originalList) {
                            originalList.tasks = originalList.tasks.filter(
                                (task: Task) => task.id !== taskToMove!.id
                            );

                            const updatedTask: Task = {
                                ...taskToMove,
                                listId: newListId,
                                content: createTaskContent(),
                                updatedAt: new Date().toISOString(),
                                order: targetList.tasks.length
                            };

                            targetList.tasks.push(updatedTask);
                            // console.log('Tarea actualizada y movida:', updatedTask);
                        }
                    } else {
                        const newTask: Task = {
                            id: crypto.randomUUID(),
                            content: createTaskContent(),
                            listId: newListId,
                            order: targetList.tasks.length,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };

                        targetList.tasks.push(newTask);
                        // console.log('Nueva tarea creada:', newTask);
                    }

                    return {
                        ...state,
                        lists: updatedLists,
                        lastSynced: new Date().toISOString()
                    };
                });
            },


            moveTask: (taskId, fromListId, toListId, newIndex) => {
                set((state) => {
                    const fromList = state.lists[fromListId];
                    const toList = state.lists[toListId];
                    if (!fromList || !toList) return state;

                    const taskIndex = fromList.tasks.findIndex(
                        (t: Task) => t.id === taskId
                    );
                    if (taskIndex === -1) return state;

                    const [task] = fromList.tasks.splice(taskIndex, 1) as [Task];
                    const updatedTask = {
                        ...task,
                        listId: toListId,
                        updatedAt: new Date().toISOString(),
                    };
                    toList.tasks.splice(newIndex, 0, updatedTask);

                    return {
                        lists: {
                            ...state.lists,
                            [fromListId]: {
                                ...fromList,
                                tasks: fromList.tasks.map((t: Task, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                            [toListId]: {
                                ...toList,
                                tasks: toList.tasks.map((t: Task, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            reorderTask: (listId, oldIndex, newIndex) => {
                set((state) => {
                    const list = state.lists[listId];
                    if (!list) return state;

                    const tasks = [...list.tasks];
                    const [task] = tasks.splice(oldIndex, 1);
                    if (!task) return state;

                    tasks.splice(newIndex, 0, {
                        ...task,
                        updatedAt: new Date().toISOString(),
                    });

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...list,
                                tasks: tasks.map((t: Task, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            clearStore: () => {
                set((state) => {
                    const clearedLists = Object.keys(state.lists).reduce((acc, listId) => {
                        const typedListId = listId as ListId;  // Asegura que listId es de tipo ListId
                        if (state.lists[typedListId]) {
                            acc[typedListId] = {
                                ...state.lists[typedListId]!,  // Usa non-null assertion
                                tasks: [],
                            };
                        }
                        return acc;
                    }, {} as Lists);

                    return {
                        version: STORE_VERSION,
                        lastSynced: null,
                        lists: clearedLists,
                    };
                });
                localStorage.removeItem(STORE_NAME);
            },

        }),
        {
            name: STORE_NAME,
            storage: createJSONStorage(() => localStorage),
            version: STORE_VERSION,
            onRehydrateStorage: () => () => {
            },
            migrate: (persistedState: unknown, version: number) => {
                if (version < STORE_VERSION) {
                    const typedState = persistedState as PersistedState;
                    return {
                        ...typedState,
                        version: STORE_VERSION,
                    };
                }
                return persistedState as PersistedState;
            },
        }
    )
);