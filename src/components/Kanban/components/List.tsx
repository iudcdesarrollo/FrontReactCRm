import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId } from "../../Kanban/@types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";
import '../css/List.css';

interface ListProps {
    listId: ListId;
}

const List = ({ listId }: ListProps) => {
    const list = useKanbanStore((state) => state.lists[listId]);
    const { setNodeRef, isOver } = useDroppable({ id: listId });

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
};

export default List;