import { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId, LeadFormData } from "../../Kanban/@types/kanban";
import CreateLeadForm from "./CreateLeadForm";
import '../css/CreateTask.css';

interface CreateTaskProps {
    listId: ListId;
}

const CreateTask = ({ listId }: CreateTaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const addTask = useKanbanStore((state) => state.addTask);

    const handleSubmit = (formData: LeadFormData) => {
        const content = `
👤 ${formData.nombre} ${formData.apellido}
📧 ${formData.correo}
📱 ${formData.telefono}
📚 ${formData.programa}
        `.trim();

        addTask(listId, content);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
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
            <CreateLeadForm
                tipoGestion={listId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default CreateTask;