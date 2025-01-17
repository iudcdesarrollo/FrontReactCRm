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
import { useEffect, useState } from "react";
import { useKanbanStore } from "../Kanban/store/kanbanStore";
import {
    INITIAL_LISTS,
    type ListId,
    type Lists,
    type Task as TaskType,
} from "../Kanban/@types/kanban";
import List from "./components/List";
import './css/KanbanBoardPrincipal.css';

export default function KanbanBoard() {
    const { lists, initializeLists, moveTask, reorderTask } = useKanbanStore();
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);

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
        initializeLists();
    }, []);

    const findListByTaskId = (allLists: Lists, taskId: string) => {
        return Object.values(allLists).find((list) =>
            list?.tasks.some((task: TaskType) => task.id === taskId)
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeList = findListByTaskId(lists, active.id as string);
        if (!activeList) return;

        const task = activeList.tasks.find((t: TaskType) => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;
            moveTask(
                activeId,
                activeList.id,
                overList.id,
                overList.tasks.length
            );
            return;
        }

        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id !== overList.id) {
            const overIndex = overList.tasks.findIndex((t: TaskType) => t.id === overId);
            const finalIndex =
                overIndex === -1 ? overList.tasks.length : overIndex;
            moveTask(activeId, activeList.id, overList.id, finalIndex);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;
            moveTask(
                activeId,
                activeList.id,
                overList.id,
                overList.tasks.length
            );
            return;
        }

        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id === overList.id) {
            const oldIndex = activeList.tasks.findIndex(
                (t: TaskType) => t.id === activeId
            );
            const newIndex = overList.tasks.findIndex((t: TaskType) => t.id === overId);
            if (oldIndex !== newIndex) {
                reorderTask(activeList.id, oldIndex, newIndex);
            }
        } else {
            const overIndex = overList.tasks.findIndex((t: TaskType) => t.id === overId);
            const finalIndex =
                overIndex === -1 ? overList.tasks.length : overIndex;
            moveTask(activeId, activeList.id, overList.id, finalIndex);
        }
    };

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
                    {activeTask ? (
                        <div className="task-overlay">
                            <p className="task-overlay-content">
                                {activeTask.content}
                            </p>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}