import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useCallback, memo, useEffect } from "react";
import { type Task as TaskType } from "../../Kanban/@types/kanban";
import axios from 'axios';
import { useKanbanStore } from "../store/kanbanStore";
import '../css/Task.css';

interface TaskProps {
    task: TaskType;
}

interface Note {
    content: string;
    timestamp: string;
    _id: string;
}

interface LeadInfoResponse {
    tipoGestion: string;
    notas: Note[] | null;
    nombreAgente: string | null;
    ventaPerdidaRazon: string | null;
}

const enpointPeticiones = import.meta.env.VITE_API_URL_GENERAL;

const Task = memo(({ task }: TaskProps) => {
    // console.log(`esto es lo que se ve y que se ve que llega en task: ${JSON.stringify(task, null, 2)}`);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [agente, setAgente] = useState<string | null>(null);
    const [primeraNota, setPrimeraNota] = useState<Note | null>(null);
    const [ventaPerdidaRazon, setVentaPerdidaRazon] = useState<string | null>(null);
    const updateTaskListByTipoGestion = useKanbanStore(state => state.updateTaskListByTipoGestion);

    const detectPhoneNumber = useCallback((content: string) => {
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const matches = content.match(phoneRegex);
        return matches ? matches[0] : null;
    }, []);

    const extractNameFromContent = useCallback((content: string) => {
        const nameMatch = content.match(/Nombre: ([^\n]+)/);
        return nameMatch ? nameMatch[1].trim() : 'Sin nombre';
    }, []);

    const extractAgenteFromContent = useCallback((content: string) => {
        const agenteMatch = content.match(/Agente: ([^\n]+)/);
        return agenteMatch ? agenteMatch[1].trim() : null;
    }, []);

    const extractNotaFromContent = useCallback((content: string) => {
        const notaMatch = content.match(/Nota: ([^\n]+) \((.*?)\)/);
        if (notaMatch) {
            return {
                content: notaMatch[1],
                timestamp: new Date(notaMatch[2]).toISOString(),
                _id: 'local'
            };
        }
        return null;
    }, []);

    const extractVentaPerdidaFromContent = useCallback((content: string) => {
        const razonMatch = content.match(/Razón de Venta Perdida: ([^\n]+)/);
        return razonMatch ? razonMatch[1].trim() : null;
    }, []);

    useEffect(() => {
        const detectedNumber = detectPhoneNumber(task.content);
        setPhoneNumber(detectedNumber);

        const localAgente = extractAgenteFromContent(task.content);
        const localNota = extractNotaFromContent(task.content);
        const localVentaPerdida = extractVentaPerdidaFromContent(task.content);

        if (localAgente || localNota || localVentaPerdida) {
            setAgente(localAgente);
            setPrimeraNota(localNota);
            setVentaPerdidaRazon(localVentaPerdida);
        } else {
            const fetchLeadInfo = async () => {
                if (!detectedNumber) return;

                try {
                    const response = await axios.get(`${enpointPeticiones}/lead-info/${detectedNumber}`);
                    const leadInfo = response.data.data as LeadInfoResponse;

                    if (leadInfo) {
                        setAgente(leadInfo.nombreAgente);
                        setVentaPerdidaRazon(leadInfo.ventaPerdidaRazon);
                        if (leadInfo.notas && leadInfo.notas.length > 0) {
                            setPrimeraNota(leadInfo.notas[0]);
                        }

                        if (leadInfo.tipoGestion) {
                            const nameLead = extractNameFromContent(task.content);
                            updateTaskListByTipoGestion(
                                detectedNumber,
                                leadInfo.tipoGestion,
                                nameLead
                            );
                        }
                    }
                } catch (error) {
                    console.error('Error fetching lead info:', error);
                }
            };

            fetchLeadInfo();
        }
    }, [task.content, detectPhoneNumber, extractAgenteFromContent, extractNotaFromContent, extractVentaPerdidaFromContent, updateTaskListByTipoGestion]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task: {
                ...task,
                phoneNumber
            },
        },
    });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition: transition || undefined,
    };

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (phoneNumber) {
            const event = new CustomEvent('phoneClick', {
                detail: { phoneNumber, taskContent: task.content }
            });
            window.dispatchEvent(event);
        }
    }, [phoneNumber, task.content]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
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

    const name = extractNameFromContent(task.content);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="task-container"
            {...attributes}
            {...listeners}
            onClick={handleClick}
        >
            <div className="task-header">
                <p className="task-content">
                    {name} - {phoneNumber || 'Sin teléfono'}
                </p>
            </div>

            <div className="task-details">
                <hr />
                <p className="task-content">
                    {task.content}
                </p>
                <hr />
                <p className="task-content">
                    Nota: {primeraNota ? `${primeraNota.content} (${formatDate(primeraNota.timestamp)})` : 'Sin notas'}
                </p>
                <hr />
                <p className="task-content">
                    Agente a Cargo: {agente || 'Sin asignar'}
                </p>
                <hr />
                <p className="task-content">
                    Razón de Venta Perdida: {ventaPerdidaRazon || 'No especificada'}
                </p>
            </div>
        </div>
    );
});

Task.displayName = 'Task';

export default Task;