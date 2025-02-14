import { useDroppable } from "@dnd-kit/core";
import { memo, useCallback } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId, type Task as TaskType } from "../../Kanban/@types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";
import '../css/List.css';
import Pagination from "./PaginationKanban";

// Definir un tipo más específico para los datos
interface SalesData {
    numeroCliente: string;
    nombreCliente: string;
    nombreAgente: string;
    ultimaNota?: string | null;
    razonVentaPerdida?: string | null;
    tipoGestion: string;
    agente?: {
        nombre: string;
        correo: string;
        rol: string;
    } | null;
}

interface ListProps {
    listId: ListId;
    managementCounts?: { 
        success: boolean;
        data: SalesData[];
        pagination: {
            totalPorTipoGestion: Record<string, number>;
            totalPages: number;
        };
    }[];
    role: string;
    email: string;
}

interface TaskWithPhone extends TaskType {
    phoneNumber?: string;
}

const localToServerMapping: Record<ListId, string> = {
    sinGestionar: 'sin gestionar',
    conversacion: 'conversacion', 
    depurar: 'depuracion',
    llamada: 'llamada',
    segundaLlamada: 'segunda llamada',
    inscrito: 'inscrito',
    estudiante: 'estudiante',
    ventaPerdida: 'venta perdida',
    inscritoOtraAgente: 'inscrito otra agente',
    gestionado: 'gestionado',
    matriculados: 'matriculado'
};

const List = memo(({ listId, managementCounts, role, email }: ListProps) => {
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
            // Lógica de movimiento de tarea
        }
    }, [listId]);

    const isRestricted = role === 'agent' && ['estudiante', 'inscritoOtraAgente', 'gestionado', 'ventaPerdida'].includes(listId);

    if (isRestricted || !list?.tasks) {
        return null;
    }

    const count = managementCounts && managementCounts[0]?.pagination?.totalPorTipoGestion 
        ? (() => {
            // Find the server-side key that corresponds to this list ID
            const serverKey = localToServerMapping[listId];
            
            // Return the count for this key, or 0 if not found
            return serverKey 
                ? managementCounts[0].pagination.totalPorTipoGestion[serverKey] || 0 
                : 0;
        })() 
        : null;

    const canEditList = role === 'admin' || !isRestricted;

    return (
        <div
            ref={setNodeRef}
            data-list-id={listId}
            className={`list-container ${isOver && canEditList ? "list-container-over" : ""}`}
            onDragOver={(e) => {
                if (isOver && canEditList) {
                    try {
                        const taskData = e.dataTransfer?.getData('task');
                        if (taskData) {
                            const parsedTask = JSON.parse(taskData) as TaskWithPhone;
                            handleTaskMove(parsedTask);
                        }
                    } catch (error) {
                        console.error('Error al analizar datos de la tarea:', error);
                    }
                }
            }}
        >
            <div className={`list-header ${listId === 'sinGestionar' ? 'gradient-border-lila' :
                listId === 'conversacion' ? 'gradient-border-aqua' :
                    listId === 'depurar' ? 'gradient-border-turquesa' :
                        listId === 'llamada' ? 'gradient-border-rosa' :
                            listId === 'segundaLlamada' ? 'gradient-border-amarillo' :
                                listId === 'inscrito' ? 'gradient-border-morado' :
                                    listId === 'estudiante' ? 'gradient-border-verde' :
                                        listId === 'ventaPerdida' ? 'gradient-border-negro' :
                                            listId === 'inscritoOtraAgente' ? 'gradient-border-naranja' :
                                                listId === 'matriculados' ? 'gradient-border-azul' : ''
                }`}>
                <div className="list-title-container">
                    <h3 className="list-title">
                        {list.title || listId.toUpperCase()}
                    </h3>
                    {count !== null && (
                        <span className="list-count">Total: {count}</span>
                    )}
                </div>
            </div>

            <Pagination 
                listId={listId} 
                email={email} 
            />

            {canEditList && (
                <div className="list-add-task">
                    <CreateTask listId={listId} />
                </div>
            )}

            <div className="list-content">
                {list.tasks.map((task) => (
                    <Task
                        key={task.id}
                        task={task}
                    />
                ))}
            </div>
        </div>
    );
});

List.displayName = 'List';

export default List;