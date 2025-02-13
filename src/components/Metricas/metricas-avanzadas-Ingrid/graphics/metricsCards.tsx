import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardMetricCard } from "../DashboardMetricCard"
import { format } from 'date-fns';
import { Book } from 'lucide-react';

interface MetricsCardsProps {
    isLoading: boolean;
    onMatriculadosClick: () => void;
}

type TipoMatriculado = 'todos' | 'profesional' | 'tecnico' | 'especializacion' | 'homologacion';

interface TipoOption {
    value: TipoMatriculado;
    label: string;
}

const tipoOptions: TipoOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'profesional', label: 'Profesional' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'especializacion', label: 'Especialización' },
    { value: 'homologacion', label: 'Homologación' }
];

interface MatriculadosParams {
    startDate: string;
    endDate: string;
    tipo?: TipoMatriculado;
}

interface LeadCountResponse {
    success: boolean;
    dates: {
        totalConversations: number;
        startDate: string;
        endDate: string;
    };
}

interface InscritoCountResponse {
    totalConversations: number;
    startDate: string;
    endDate: string;
    tipoGestion: string;
}

interface MatriculadosCountResponse {
    success: boolean;
    data: Array<{
        programas: string[];
        fecha: string;
        total: number;
    }>;
    totalGeneral: number;
    programasUnicos: string[];
    filters: {
        startDate: string;
        endDate: string;
        tipo: string;
    };
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
    isLoading,
    onMatriculadosClick
}) => {
    // Inicialización de fechas desde enero 2024 hasta hoy
    const startOfPeriod = new Date(2024, 0, 1); // 1 de enero de 2024
    const endOfPeriod = new Date(); // fecha actual

    // Estados para Total Leads
    const [totalLeads, setTotalLeads] = useState<number | null>(null);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [leadsStartDate, setLeadsStartDate] = useState<Date>(startOfPeriod);
    const [leadsEndDate, setLeadsEndDate] = useState<Date>(endOfPeriod);

    // Estados para Inscritos
    const [inscritoLeads, setInscritoLeads] = useState<number | null>(null);
    const [inscritoLoading, setInscritoLoading] = useState(true);
    const [inscritoStartDate, setInscritoStartDate] = useState<Date>(startOfPeriod);
    const [inscritoEndDate, setInscritoEndDate] = useState<Date>(endOfPeriod);

    // Estados para Matriculados
    const [matriculadosCount, setMatriculadosCount] = useState<number | null>(null);
    const [matriculadosLoading, setMatriculadosLoading] = useState(true);
    const [matriculadosStartDate, setMatriculadosStartDate] = useState<Date>(startOfPeriod);
    const [matriculadosEndDate, setMatriculadosEndDate] = useState<Date>(endOfPeriod);
    const [tipoMatriculado, setTipoMatriculado] = useState<TipoMatriculado>('todos');

    // Estados para Venta Perdida
    const [ventaPerdidaCount, setVentaPerdidaCount] = useState<number | null>(null);
    const [ventaPerdidaLoading, setVentaPerdidaLoading] = useState(true);
    const [ventaPerdidaStartDate, setVentaPerdidaStartDate] = useState<Date>(startOfPeriod);
    const [ventaPerdidaEndDate, setVentaPerdidaEndDate] = useState<Date>(endOfPeriod);

    // Manejadores de eventos
    const handleLeadsStartDateSelect = (date: Date) => setLeadsStartDate(date);
    const handleLeadsEndDateSelect = (date: Date) => setLeadsEndDate(date);
    const handleInscritoStartDateSelect = (date: Date) => setInscritoStartDate(date);
    const handleInscritoEndDateSelect = (date: Date) => setInscritoEndDate(date);
    const handleMatriculadosStartDateSelect = (date: Date) => setMatriculadosStartDate(date);
    const handleMatriculadosEndDateSelect = (date: Date) => setMatriculadosEndDate(date);
    const handleVentaPerdidaStartDateSelect = (date: Date) => setVentaPerdidaStartDate(date);
    const handleVentaPerdidaEndDateSelect = (date: Date) => setVentaPerdidaEndDate(date);

    // Efectos y llamadas a la API
    useEffect(() => {
        const fetchTotalLeads = async () => {
            try {
                setLeadsLoading(true);
                const response = await axios.get<LeadCountResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/count`, {
                    params: {
                        startDate: format(leadsStartDate, 'yyyy-MM-dd'),
                        endDate: format(leadsEndDate, 'yyyy-MM-dd')
                    }
                });

                if (response.data.success) {
                    setTotalLeads(response.data.dates.totalConversations);
                }
            } catch (error) {
                console.error('Error fetching total leads:', error);
                setTotalLeads(null);
            } finally {
                setLeadsLoading(false);
            }
        };

        fetchTotalLeads();
    }, [leadsStartDate, leadsEndDate]);

    useEffect(() => {
        const fetchInscritoLeads = async () => {
            try {
                setInscritoLoading(true);
                const response = await axios.get<InscritoCountResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/inscrito-count`, {
                    params: {
                        startDate: format(inscritoStartDate, 'yyyy-MM-dd'),
                        endDate: format(inscritoEndDate, 'yyyy-MM-dd')
                    }
                });

                if (response.data && typeof response.data.totalConversations === 'number') {
                    setInscritoLeads(response.data.totalConversations);
                } else {
                    setInscritoLeads(0);
                }
            } catch (error) {
                console.error('Error fetching inscrito leads:', error);
                setInscritoLeads(null);
            } finally {
                setInscritoLoading(false);
            }
        };

        fetchInscritoLeads();
    }, [inscritoStartDate, inscritoEndDate]);

    useEffect(() => {
        const fetchMatriculadosCount = async () => {
            try {
                setMatriculadosLoading(true);
                const params: MatriculadosParams = {
                    startDate: format(matriculadosStartDate, 'yyyy-MM-dd'),
                    endDate: format(matriculadosEndDate, 'yyyy-MM-dd')
                };

                if (tipoMatriculado !== 'todos') {
                    params.tipo = tipoMatriculado;
                }

                const response = await axios.get<MatriculadosCountResponse>(
                    `${import.meta.env.VITE_API_URL_GENERAL}/matriculados/count`,
                    { params }
                );

                if (response.data.success) {
                    setMatriculadosCount(response.data.totalGeneral);
                } else {
                    setMatriculadosCount(0);
                }
            } catch (error) {
                console.error('Error fetching matriculados count:', error);
                setMatriculadosCount(null);
            } finally {
                setMatriculadosLoading(false);
            }
        };

        fetchMatriculadosCount();
    }, [matriculadosStartDate, matriculadosEndDate, tipoMatriculado]);

    useEffect(() => {
        const fetchVentaPerdidaCount = async () => {
            try {
                setVentaPerdidaLoading(true);
                const response = await axios.get<InscritoCountResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/ventaperdida-count`, {
                    params: {
                        startDate: format(ventaPerdidaStartDate, 'yyyy-MM-dd'),
                        endDate: format(ventaPerdidaEndDate, 'yyyy-MM-dd')
                    }
                });

                if (response.data && typeof response.data.totalConversations === 'number') {
                    setVentaPerdidaCount(response.data.totalConversations);
                } else {
                    setVentaPerdidaCount(0);
                }
            } catch (error) {
                console.error('Error fetching venta perdida count:', error);
                setVentaPerdidaCount(null);
            } finally {
                setVentaPerdidaLoading(false);
            }
        };

        fetchVentaPerdidaCount();
    }, [ventaPerdidaStartDate, ventaPerdidaEndDate]);

    const handleTipoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.stopPropagation();
        setTipoMatriculado(event.target.value as TipoMatriculado);
    };

    const handleMatriculadosCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.react-datepicker') && !target.closest('.book-control')) {
            onMatriculadosClick();
        }
    };

    return (
        <div className="dashboard__metrics-grid">
            <DashboardMetricCard
                title="Leads"
                value={totalLeads !== null ? totalLeads.toString() : 'N/A'}
                subtitle="Total de Leads"
                className="dashboard__metric--revenue"
                isLoading={isLoading || leadsLoading}
                onStartDateSelect={handleLeadsStartDateSelect}
                onEndDateSelect={handleLeadsEndDateSelect}
            />
            <DashboardMetricCard
                title="Inscritos"
                value={inscritoLeads !== null ? inscritoLeads.toString() : 'N/A'}
                subtitle="Total de Inscritos"
                className="dashboard__metric--profit"
                isLoading={isLoading || inscritoLoading}
                onStartDateSelect={handleInscritoStartDateSelect}
                onEndDateSelect={handleInscritoEndDateSelect}
            />
            <div
                className="flex flex-col relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleMatriculadosCardClick}
            >
                <DashboardMetricCard
                    title="Matriculados"
                    value={matriculadosCount !== null ? matriculadosCount.toString() : 'N/A'}
                    subtitle="Total de Matriculados"
                    className="dashboard__metric--sales"
                    isLoading={isLoading || matriculadosLoading}
                    onStartDateSelect={handleMatriculadosStartDateSelect}
                    onEndDateSelect={handleMatriculadosEndDateSelect}
                    customHeaderContent={
                        <div className="flex items-center absolute right-12 top-3 z-20">
                            <div
                                className="book-control"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Book size={20} className="text-white" />
                                <select
                                    value={tipoMatriculado}
                                    onChange={handleTipoChange}
                                    className="book-select"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {tipoOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    }
                />
            </div>
            <DashboardMetricCard
                title="Venta Perdida"
                value={ventaPerdidaCount !== null ? ventaPerdidaCount.toString() : 'N/A'}
                subtitle="Total de Ventas Perdidas"
                className="dashboard__metric--lost"
                isLoading={isLoading || ventaPerdidaLoading}
                onStartDateSelect={handleVentaPerdidaStartDateSelect}
                onEndDateSelect={handleVentaPerdidaEndDateSelect}
            />
        </div>
    );
};

export default MetricsCards;