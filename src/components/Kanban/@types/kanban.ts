export type ListId =
    | "sinGestionar"
    | "conversacion"
    | "depurar"
    | "llamada"
    | "segundaLlamada"
    | "gestionado"
    | "estudiante"
    | "revision";

export type TaskId = string;

export interface Task {
    id: TaskId;
    content: string;
    listId: ListId;
    order: number;
    createdAt: string;
    updatedAt: string;
    syncedAt?: string;
}

export interface List {
    id: ListId;
    title: string;
    tasks: Task[];
}

export type Lists = {
    [K in ListId]?: List;
};

export const INITIAL_LISTS: ListId[] = [
    "sinGestionar",
    "conversacion",
    "depurar",
    "llamada",
    "segundaLlamada",
    "gestionado",
    "estudiante",
    "revision"
];

export const LIST_TITLES: Record<ListId, string> = {
    sinGestionar: "Sin gestionar",
    conversacion: "Conversación",
    depurar: "Depuración",
    llamada: "Llamada",
    segundaLlamada: "Segunda Llamada",
    gestionado: "Gestionado",
    estudiante: "Inscrito",
    revision: "Venta Perdida"
};