import { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId } from "../../Kanban/@types/kanban";
import '../css/CreateTask.css';

interface CreateTaskProps {
    listId: ListId;
}

const CreateTask = ({ listId }: CreateTaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState("");
    const addTask = useKanbanStore((state) => state.addTask);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            addTask(listId, content.trim());
            setContent("");
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!isEditing) {
        return (
            <div className="create-task-container">
                <button
                    onClick={() => setIsEditing(true)}
                    className="create-task-button"
                >
                    + Agregar Nuevo Lead
                </button>
            </div>
        );
    }

    return (
        <div className="create-task-container">
            <form onSubmit={handleSubmit} className="create-task-form">
                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingrese los datos del Lead..."
                    className="create-task-textarea"
                />
                <div className="create-task-actions">
                    <button
                        type="submit"
                        className="create-task-submit"
                    >
                        Agregar
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="create-task-cancel"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTask;