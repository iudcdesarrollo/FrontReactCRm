export type ListId =
    | "sinGestionar"
    | "conversacion"
    | "depurar"
    | "llamada"
    | "segundaLlamada"
    | "duplicado"
    | "inscrito"
    | "estudiante"
    | "ventaPerdida"
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
    "duplicado",
    "inscrito",
    "estudiante",
    "ventaPerdida",
    "revision"
];

export const LIST_TITLES: Record<ListId, string> = {
    sinGestionar: "Sin gestionar",
    conversacion: "Conversación",
    depurar: "Depuración",
    llamada: "Llamada",
    segundaLlamada: "Segunda Llamada",
    duplicado: "Duplicado",
    inscrito: "Inscripción",
    estudiante: "Estudiante",
    ventaPerdida: "Venta Perdida",
    revision: "Revisión"
};

export interface LeadFormData {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    programa: string;
}