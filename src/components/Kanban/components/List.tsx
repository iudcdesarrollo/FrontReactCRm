import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId } from "../../Kanban/@types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";
import '../css/List.css';

interface ListProps {
    listId: ListId;
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

    if (!list) return null;

    return (
        <div
            ref={setNodeRef}
            className={`list-container ${isOver ? "list-container-over" : ""}`}
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