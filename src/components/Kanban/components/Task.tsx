import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useCallback, memo, useEffect } from "react";
import { type Task as TaskType } from "../../Kanban/@types/kanban";
import '../css/Task.css';

interface TaskProps {
    task: TaskType;
}

const Task = memo(({ task }: TaskProps) => {
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

    const detectPhoneNumber = useCallback((content: string) => {
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const matches = content.match(phoneRegex);
        return matches ? matches[0] : null;
    }, []);

    useEffect(() => {
        const detectedNumber = detectPhoneNumber(task.content);
        setPhoneNumber(detectedNumber);
    }, [task.content, detectPhoneNumber]);

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

    const handleClick = useCallback(() => {
        if (phoneNumber) {
            const event = new CustomEvent('phoneClick', {
                detail: { phoneNumber, taskContent: task.content }
            });
            window.dispatchEvent(event);
        }
    }, [phoneNumber, task.content]);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="task-dragging"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="task-container"
            {...attributes}
            {...listeners}
            onClick={handleClick}
        >
            <p className="task-content">{task.content}</p>
        </div>
    );
});

Task.displayName = 'Task';

export default Task;