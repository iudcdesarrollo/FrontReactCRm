import { useDroppable } from "@dnd-kit/core";
import { memo, useEffect, useCallback } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId, type Task as TaskType } from "../../Kanban/@types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";
import '../css/List.css';

interface ListProps {
    listId: ListId;
}

interface TaskWithPhone extends TaskType {
    phoneNumber?: string;
}

const List = memo(({ listId }: ListProps) => {
    const list = useKanbanStore((state) => state.lists[listId]);
    const { setNodeRef, isOver } = useDroppable({
        id: listId,
        data: {
            type: 'List',
            listId
        }
    });

    const handleTaskMove = useCallback((task: TaskWithPhone) => {
        if (task.phoneNumber) {
            // console.log(`Teléfono en lista ${listId}:`, task.phoneNumber);
        }
    }, [listId]);

    useEffect(() => {
        list?.tasks.forEach(task => {
            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
            const phoneNumber = task.content.match(phoneRegex)?.[0];
            if (phoneNumber) {
                // console.log(`Teléfono encontrado en lista ${listId}:`, phoneNumber);
            }
        });
    }, [list?.tasks, listId]);

    if (!list) return null;

    return (
        <div
            ref={setNodeRef}
            className={`list-container ${isOver ? "list-container-over" : ""}`}
            onDragOver={(e) => {
                if (isOver) {
                    try {
                        const taskData = e.dataTransfer?.getData('task');
                        if (taskData) {
                            const parsedTask = JSON.parse(taskData) as TaskWithPhone;
                            handleTaskMove(parsedTask);
                        }
                    } catch (error) {
                        console.error('Error parsing task data:', error);
                    }
                }
            }}
        >
            <div className="list-header">
                <h3 className="list-title">
                    {list.title || listId.toUpperCase()}
                </h3>
            </div>

            <div className="list-add-task">
                <CreateTask listId={listId} />
            </div>

            <div className="list-content">
                {list.tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
});

List.displayName = 'List';

export default List;