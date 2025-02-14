export interface Cliente {
    numero: string;
}

export interface MetricData {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: string;
    clients: Cliente[];
}

export interface MetricsResponseData {
    agente: string;
    total: number;
    sinGestionar: number;
    clientesSinGestionar: Cliente[];
    conversacion: number;
    clientesConversacion: Cliente[];
    depuracion: number;
    clientesDepuracion: Cliente[];
    llamada: number;
    clientesLlamada: Cliente[];
    segundaLlamada: number;
    clientesSegundaLlamada: Cliente[];
    inscrito: number;
    clientesInscrito: Cliente[];
    ventaPerdida: number;
    clientesVentaPerdida: Cliente[];
    metricsByTime: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

// esto pertenece a metricas avansadas de ingrid (Jefa del call center(05/02/2025) y persona que pedia todos los cambio de esta app).

export interface DailySale {
    date: string;
    value: number;
}

export interface TopCustomer {
    name: string;
    value: number;
}

export interface SalesByCategory {
    name: string;
    value: number;
}

export interface AccountManagerData {
    name: string;
    Sarah: number;
    Mike: number;
    Emma: number;
    Personal: number;
}

export interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    className: string;
    isLoading?: boolean;
}