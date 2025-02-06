import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardMetricCard } from "../DashboardMetricCard"
import { parse, format } from 'date-fns';

interface MetricsCardsProps {
    isLoading: boolean;
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

export const MetricsCards: React.FC<MetricsCardsProps> = ({
    isLoading
}) => {
    // Estados para Total Leads
    const [totalLeads, setTotalLeads] = useState<number | null>(null);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [leadsStartDate, setLeadsStartDate] = useState<Date>(parse('04/02/2025', 'dd/MM/yyyy', new Date()));
    const [leadsEndDate, setLeadsEndDate] = useState<Date>(parse('05/02/2025', 'dd/MM/yyyy', new Date()));

    // Estados para Inscritos
    const [inscritoLeads, setInscritoLeads] = useState<number | null>(null);
    const [inscritoLoading, setInscritoLoading] = useState(true);
    const [inscritoStartDate, setInscritoStartDate] = useState<Date>(parse('04/02/2025', 'dd/MM/yyyy', new Date()));
    const [inscritoEndDate, setInscritoEndDate] = useState<Date>(parse('05/02/2025', 'dd/MM/yyyy', new Date()));

    // Estados para Matriculados
    const [matriculadosCount, setMatriculadosCount] = useState<number | null>(null);
    const [matriculadosLoading, setMatriculadosLoading] = useState(true);
    const [matriculadosStartDate, setMatriculadosStartDate] = useState<Date>(parse('04/02/2025', 'dd/MM/yyyy', new Date()));
    const [matriculadosEndDate, setMatriculadosEndDate] = useState<Date>(parse('05/02/2025', 'dd/MM/yyyy', new Date()));

    // Estados para Venta Perdida
    const [ventaPerdidaCount, setVentaPerdidaCount] = useState<number | null>(null);
    const [ventaPerdidaLoading, setVentaPerdidaLoading] = useState(true);
    const [ventaPerdidaStartDate, setVentaPerdidaStartDate] = useState<Date>(parse('04/02/2025', 'dd/MM/yyyy', new Date()));
    const [ventaPerdidaEndDate, setVentaPerdidaEndDate] = useState<Date>(parse('05/02/2025', 'dd/MM/yyyy', new Date()));

    // Efecto para Total Leads
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
                    console.log('Total de leads:', response.data.dates.totalConversations);
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

    // Efecto para Inscritos
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
                    console.log('Total de inscritos:', response.data.totalConversations);
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

    // Efecto para Matriculados
    useEffect(() => {
        const fetchMatriculadosCount = async () => {
            try {
                setMatriculadosLoading(true);
                const response = await axios.get<InscritoCountResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/matriculados-count`, {
                    params: {
                        startDate: format(matriculadosStartDate, 'yyyy-MM-dd'),
                        endDate: format(matriculadosEndDate, 'yyyy-MM-dd')
                    }
                });

                if (response.data && typeof response.data.totalConversations === 'number') {
                    setMatriculadosCount(response.data.totalConversations);
                    console.log('Total de matriculados:', response.data.totalConversations);
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
    }, [matriculadosStartDate, matriculadosEndDate]);

    // Efecto para Venta Perdida
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
                    console.log('Total de ventas perdidas:', response.data.totalConversations);
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

    // Manejadores para Total Leads
    const handleLeadsStartDateSelect = (date: Date) => {
        setLeadsStartDate(date);
    };

    const handleLeadsEndDateSelect = (date: Date) => {
        setLeadsEndDate(date);
    };

    // Manejadores para Inscritos
    const handleInscritoStartDateSelect = (date: Date) => {
        setInscritoStartDate(date);
    };

    const handleInscritoEndDateSelect = (date: Date) => {
        setInscritoEndDate(date);
    };

    // Manejadores para Matriculados
    const handleMatriculadosStartDateSelect = (date: Date) => {
        setMatriculadosStartDate(date);
    };

    const handleMatriculadosEndDateSelect = (date: Date) => {
        setMatriculadosEndDate(date);
    };

    // Manejadores para Venta Perdida
    const handleVentaPerdidaStartDateSelect = (date: Date) => {
        setVentaPerdidaStartDate(date);
    };

    const handleVentaPerdidaEndDateSelect = (date: Date) => {
        setVentaPerdidaEndDate(date);
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
            <DashboardMetricCard
                title="Matriculados"
                value={matriculadosCount !== null ? matriculadosCount.toString() : 'N/A'}
                subtitle="Total de Matriculados"
                className="dashboard__metric--sales"
                isLoading={isLoading || matriculadosLoading}
                onStartDateSelect={handleMatriculadosStartDateSelect}
                onEndDateSelect={handleMatriculadosEndDateSelect}
            />
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
}