import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useCallback, memo } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type Task as TaskType } from "../../Kanban/@types/kanban";
import '../css/Task.css';

interface TaskProps {
    task: TaskType;
}

const Task = memo(({ task }: TaskProps) => {
    // console.log('esto es lo que trae task:', JSON.stringify(task, null, 2));
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
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: transition || undefined,
    };

    const handleSave = useCallback(() => {
        const trimmedContent = editContent.trim();
        if (trimmedContent !== task.content) {
            updateTask(task.id, trimmedContent);
        }
        setIsEditing(false);
    }, [editContent, task.content, task.id, updateTask]);

    const handleCancel = useCallback(() => {
        setEditContent(task.content);
        setIsEditing(false);
    }, [task.content]);

    const handleDelete = useCallback(() => {
        deleteTask(task.id);
    }, [deleteTask, task.id]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
    }, []);

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
                    <button
                        onClick={handleSave}
                        className="task-save-button"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="task-cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="task-delete-button"
                    >
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
            onDoubleClick={handleDoubleClick}
        >
            <p className="task-content">{task.content}</p>
        </div>
    );
});

Task.displayName = 'Task';

export default Task;