import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type Task as TaskType } from "../../Kanban/@types/kanban";
import '../css/Task.css';

interface TaskProps {
    task: TaskType;
}

const Task = ({ task }: TaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(task.content);
    const updateTask = useKanbanStore((state) => state.updateTask);
    const deleteTask = useKanbanStore((state) => state.deleteTask);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled: isEditing,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSave = () => {
        if (editContent.trim() !== task.content) {
            updateTask(task.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(task.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteTask(task.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="task-dragging"
            />
        );
    }

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="task-edit-container"
            >
                <textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="task-edit-textarea"
                    rows={2}
                />
                <div className="task-edit-buttons">
                    <button onClick={handleSave} className="task-save-button">
                        Save
                    </button>
                    <button onClick={handleCancel} className="task-cancel-button">
                        Cancel
                    </button>
                    <button onClick={handleDelete} className="task-delete-button">
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="task-container"
            {...attributes}
            {...listeners}
            onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsEditing(true);
            }}
        >
            <p className="task-content">{task.content}</p>
        </div>
    );
};

export default Task;