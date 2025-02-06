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

export const MetricsCards: React.FC<MetricsCardsProps> = ({
    isLoading
}) => {
    const [totalLeads, setTotalLeads] = useState<number | null>(null);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date>(parse('04/02/2025', 'dd/MM/yyyy', new Date()));
    const [endDate, setEndDate] = useState<Date>(parse('05/02/2025', 'dd/MM/yyyy', new Date()));

    useEffect(() => {
        const fetchTotalLeads = async () => {
            try {
                setLeadsLoading(true);
                const response = await axios.get<LeadCountResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/count`, {
                    params: {
                        startDate: format(startDate, 'yyyy-MM-dd'),
                        endDate: format(endDate, 'yyyy-MM-dd')
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
    }, [startDate, endDate]);

    const handleStartDateSelect = (date: Date) => {
        setStartDate(date);
    };

    const handleEndDateSelect = (date: Date) => {
        setEndDate(date);
    };

    return (
        <div className="dashboard__metrics-grid">
            <DashboardMetricCard
                title="Total de Leads"
                value={totalLeads !== null ? totalLeads.toString() : 'N/A'}
                className="dashboard__metric--revenue"
                isLoading={isLoading || leadsLoading}
                onStartDateSelect={handleStartDateSelect}
                onEndDateSelect={handleEndDateSelect}
            />
            <DashboardMetricCard
                title="Ingresos"
                value="$34.0M"
                subtitle="Ingresos totales"
                className="dashboard__metric--profit"
                isLoading={isLoading}
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