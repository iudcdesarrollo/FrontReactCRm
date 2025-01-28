import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { useState, useCallback } from "react";

interface Task {
    id: string;
    content: string;
}

interface List {
    id: string;
    tasks: Task[];
}

interface Lists {
    [key: string]: List;
}

export type ListId = string;

interface UseKanbanDragAndDropProps<T extends string = ListId> {
    lists: Lists;
    onMoveTask: (taskId: string, sourceListId: T, targetListId: T, index: number) => void;
    onReorderTask: (listId: T, oldIndex: number, newIndex: number) => void;
    allowedListIds?: T[];
    onTaskMove?: (taskId: string, sourceListId: T, targetListId: T) => Promise<void>;
}

export const useKanbanDragAndDrop = <T extends string = ListId>({
    lists,
    onMoveTask,
    onReorderTask,
    allowedListIds = [],
    onTaskMove,
}: UseKanbanDragAndDropProps<T>) => {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const findListByTaskId = useCallback((allLists: Lists, taskId: string) => {
        return Object.values(allLists).find((list) =>
            list?.tasks.some((task: Task) => task.id === taskId)
        );
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const activeList = findListByTaskId(lists, active.id as string);
        if (!activeList) return;

        const task = activeList.tasks.find((t: Task) => t.id === active.id);
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

        if (allowedListIds.includes(overId as T)) {
            const overList = lists[overId];
            if (!overList || activeList.id === overList.id) return;
            onMoveTask(activeId, activeList.id as T, overId as T, overList.tasks.length);
            return;
        }

        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id !== overList.id) {
            const overIndex = overList.tasks.findIndex((t: Task) => t.id === overId);
            const finalIndex = overIndex === -1 ? overList.tasks.length : overIndex;
            onMoveTask(activeId, activeList.id as T, overList.id as T, finalIndex);
        }
    }, [lists, findListByTaskId, onMoveTask, allowedListIds]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        try {
            const { active, over } = event;
            if (!active || !over) return;

            const activeId = active.id as string;
            const overId = over.id as string;

            if (!activeId || !overId) return;

            const activeList = findListByTaskId(lists, activeId);
            if (!activeList) return;

            if (allowedListIds.includes(overId as T)) {
                const overList = lists[overId];
                if (!overList || activeList.id === overList.id) return;

                if (onTaskMove) {
                    await onTaskMove(activeId, activeList.id as T, overId as T);
                }

                onMoveTask(activeId, activeList.id as T, overId as T, overList.tasks.length);
                return;
            }

            const overList = findListByTaskId(lists, overId);
            if (!overList) return;

            if (activeList.id === overList.id) {
                const oldIndex = activeList.tasks.findIndex(t => t.id === activeId);
                const newIndex = overList.tasks.findIndex(t => t.id === overId);
                if (oldIndex !== newIndex) {
                    onReorderTask(activeList.id as T, oldIndex, newIndex);
                }
            } else {
                if (onTaskMove) {
                    await onTaskMove(activeId, activeList.id as T, overList.id as T);
                }

                const overIndex = overList.tasks.findIndex(t => t.id === overId);
                onMoveTask(
                    activeId,
                    activeList.id as T,
                    overList.id as T,
                    overIndex === -1 ? overList.tasks.length : overIndex
                );
            }
        } finally {
            setActiveTask(null);
        }
    }, [lists, findListByTaskId, onMoveTask, onReorderTask, allowedListIds, onTaskMove]);

    return {
        activeTask,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
    };
};