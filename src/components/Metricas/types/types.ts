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