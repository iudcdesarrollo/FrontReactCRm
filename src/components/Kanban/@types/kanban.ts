export type ListId =
    | "inbox"
    | "defined"
    | "backlog"
    | "blocked"
    | "inProgress"
    | "validating"
    | "done"
    | "cancelled";
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
    "inbox",
    "defined",
    "backlog",
    "blocked",
    "inProgress",
    "validating",
    "done",
    "cancelled",
];

export const LIST_TITLES: Record<ListId, string> = {
    inbox: "Inbox",
    defined: "Defined",
    backlog: "Backlog",
    blocked: "Blocked",
    inProgress: "In Progress",
    validating: "Validating",
    done: "Done",
    cancelled: "Cancelled",
};