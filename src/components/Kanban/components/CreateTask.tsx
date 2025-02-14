import { useState } from "react";
import axios from "axios";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId, LeadFormData } from "../@types/kanban";
import CreateLeadForm from "./CreateLeadForm";
import '../css/CreateTask.css';

interface CreateTaskProps {
    listId: ListId;
}

interface Lead {
    nombre: string;
    apellido: string;
    telefono: string;
    ingreso_crm: string;
    correo: string;
    programa: string;
    date: string;
    _id: string;
}

interface Mensaje {
    tipo: string;
    contenido: string;
    fecha: string;
    usuario_destino: string;
    mensaje_id: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
    }>;
}

interface Conversacion {
    _id: string;
    numero_cliente: string;
    nombre_cliente: string;
    nombre_agente: string;
    correo_agente: string;
    rol_agente: string;
    tipo_gestion: string;
    mensajes: Mensaje[];
}

interface Seguimiento {
    _id: string;
    ingresoMeta: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    programaInteres: string;
    gestionadoPor: {
        fecha: string;
        texto: string;
    };
    tipoGestion: {
        fecha: string;
        texto: string;
    };
}

interface ApiResponse {
    exito: boolean;
    datos?: {
        lead: Lead;
        conversacion: Conversacion;
        seguimiento: Seguimiento;
    };
    mensaje?: string;
    error?: string;
}

interface ExtendedLeadFormData extends LeadFormData {
    agente: {
        nombre: string;
        correo: string;
    };
}

const tipoGestionMap: Record<string, string> = {
    'sinGestionar': 'sin gestionar',
    'segundaLlamada': 'segunda llamada',
    'depurar': 'depuracion',
    'ventaPerdida': 'venta perdida',
    'matriculados': 'matriculados'
};

const CreateTask = ({ listId }: CreateTaskProps) => {
    // console.log(`este es el id de la lista:${listId}`);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addTask = useKanbanStore((state) => state.addTask);

    const handleSubmit = async (formData: ExtendedLeadFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const tipo_gestion = tipoGestionMap[listId] || listId;

            const response = await axios.post<ApiResponse>(
                `${import.meta.env.VITE_API_URL_GENERAL}/UploadLead`,
                {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    correo: formData.correo,
                    telefono: formData.telefono,
                    programa: formData.programa,
                    tipo_gestion,
                    agente: {
                        nombre: formData.agente.nombre,
                        correo: formData.agente.correo
                    }
                }
            );

            if (response.data.exito) {
                const content = `
👤 ${formData.nombre} ${formData.apellido}
📧 ${formData.correo}
📱 ${formData.telefono}
📚 ${formData.programa}
👨‍💼 ${formData.agente.nombre}
                `.trim();

                addTask(listId, content);
                setIsEditing(false);
            } else {
                throw new Error(response.data.mensaje || 'Error al crear el lead');
            }
        } catch (error) {
            let errorMessage = 'Error al crear el lead';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (axios.isAxiosError(error) && error.response?.data?.mensaje) {
                errorMessage = error.response.data.mensaje;
            }

            setError(errorMessage);
            console.error('Error al crear lead:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
    };

    if (!isEditing) {
        return (
            <div className="create-task-container">
                <button
                    onClick={() => {
                        setError(null);
                        setIsEditing(true);
                    }}
                    className="create-task-button"
                >
                    + Agregar Nuevo Lead
                </button>
            </div>
        );
    }

    return (
        <div className="create-task-container">
            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}
            <CreateLeadForm
                tipoGestion={listId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
            {isLoading && (
                <div className="loading-overlay" role="status">
                    <span>Creando lead...</span>
                </div>
            )}
        </div>
    );
};

export default CreateTask;