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

    return (
        <div className="dashboard__metrics-grid">
            <DashboardMetricCard
                title="Total de Leads"
                value={totalLeads !== null ? totalLeads.toString() : 'N/A'}
                className="dashboard__metric--revenue"
                isLoading={isLoading || leadsLoading}
                onStartDateSelect={handleLeadsStartDateSelect}
                onEndDateSelect={handleLeadsEndDateSelect}
            />
            <DashboardMetricCard
                title="Inscritos"
                value={inscritoLeads !== null ? inscritoLeads.toString() : 'N/A'}
                subtitle="Total de inscritos"
                className="dashboard__metric--profit"
                isLoading={isLoading || inscritoLoading}
                onStartDateSelect={handleInscritoStartDateSelect}
                onEndDateSelect={handleInscritoEndDateSelect}
            />
            <DashboardMetricCard
                title="Proyectos"
                value="85%"
                subtitle="Proyectos completados"
                className="dashboard__metric--sales"
                isLoading={isLoading}
            />
        </div>
    )
}