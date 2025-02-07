import { useDroppable } from "@dnd-kit/core";
import { memo, useCallback } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId, type Task as TaskType } from "../../Kanban/@types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";
import '../css/List.css';
import Pagination from "./PaginationKanban";

interface ListProps {
    listId: ListId;
    managementCounts?: { _id: string; count: number }[];
    role: string;
}

interface TaskWithPhone extends TaskType {
    phoneNumber?: string;
}

const List = memo(({ listId, managementCounts, role }: ListProps) => {
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
            // Lógica de manejo de movimiento de tarea
        }
    }, [listId]);

    const restrictedLists = role === 'agent' ? ['matriculados', 'inscritoOtraAgente', 'gestionado', 'ventaPerdida'] : [];

    if (restrictedLists.includes(listId)) {
        return null;
    }

    const count = managementCounts ? (() => {
        const countKey = {
            sinGestionar: 'sin gestionar',
            conversacion: 'conversacion',
            depurar: 'depuracion',
            llamada: 'llamada',
            segundaLlamada: 'segunda llamada',
            inscrito: 'inscrito',
            estudiante: 'estudiante',
            ventaPerdida: 'venta perdida',
            gestionado: 'gestionado',
            inscritoOtraAgente: 'inscrito otra agente',
            matriculados: 'matriculados'
        }[listId];

        const managementCount = managementCounts.find(mc => mc._id === countKey);
        return managementCount?.count || 0;
    })() : null;

    if (!list) return null;

    const canEditList = role === 'admin' || !restrictedLists.includes(listId);

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
                        console.error('Error parsing task data:', error);
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
                                            listId === 'inscritoOtraAgente' ? 'gradient-border-naranja' : ''
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

            <Pagination listId={listId} />

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