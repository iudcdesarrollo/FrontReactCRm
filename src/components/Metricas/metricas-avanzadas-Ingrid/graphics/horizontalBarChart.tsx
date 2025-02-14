import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState, useRef } from "react"
import { CalendarIcon } from 'lucide-react';

interface AgentData {
    name: string;
    value: number;
}

interface BackendAgent {
    agente: string;
    inscritos: number;
}

interface MetricasResponse {
    success: boolean;
    graficaData: {
        agentes: BackendAgent[];
        mensual: {
            labels: string[];
            data: number[];
        };
    };
}

export const HorizontalBarChart = () => {
    const [agentData, setAgentData] = useState<AgentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchData = async (date: Date) => {
        try {
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const formatDate = (date: Date): string => date.toISOString().split('T')[0];

            const response = await fetch(
                `${import.meta.env.VITE_API_URL_GENERAL}/MetricasMesAgentes?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
            );
            const data: MetricasResponse = await response.json();

            if (data.success) {
                const formattedData = data.graficaData.agentes
                    .map((agent: BackendAgent) => ({
                        name: agent.agente,
                        value: agent.inscritos
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                setAgentData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month] = event.target.value.split('-');
        setSelectedDate(new Date(parseInt(year), parseInt(month) - 1));
    };

    const handleCalendarClick = () => {
        if (inputRef.current) {
            inputRef.current.showPicker();
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Top Agentes por Inscritos</h2>
                <div className="relative">
                    <button
                        onClick={handleCalendarClick}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Seleccionar mes"
                    >
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                        ref={inputRef}
                        type="month"
                        value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                        onChange={handleMonthChange}
                        className="absolute opacity-0 w-0 h-0 overflow-hidden"
                        style={{
                            clip: 'rect(0 0 0 0)',
                            clipPath: 'inset(50%)',
                            position: 'absolute',
                            whiteSpace: 'nowrap'
                        }}
                    />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300} className="dashboard__customers-chart">
                <BarChart
                    layout="vertical"
                    data={agentData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number) => [
                            `${value.toLocaleString()} inscritos`,
                            'Total'
                        ]}
                        labelStyle={{ fontSize: 12 }}
                    />
                    <Bar
                        dataKey="value"
                        fill="#82ca9d"
                        radius={[0, 4, 4, 0]}
                        name="Inscritos"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}