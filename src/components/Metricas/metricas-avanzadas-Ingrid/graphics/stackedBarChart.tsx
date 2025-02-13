import { useState, useEffect, useRef } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarIcon } from 'lucide-react';

interface LeadsResponse {
    dates: {
        totalConversations: number;
        startDate: string;
        endDate: string;
    };
    success: boolean;
}

interface QueryDebug {
    startDate?: string;
    endDate?: string;
    tipoGestion?: string;
    [key: string]: string | undefined;
}

interface MetricsResponse {
    debug: {
        query: QueryDebug;
        totalSinFecha: number;
        startDateISO: string;
        endDateISO: string;
    };
    endDate: string;
    startDate: string;
    tipoGestion: string;
    totalConversations: number;
}

interface ChartDataPoint {
    name: string;
    Leads: number;
    Inscritos: number;
    Matriculados: number;
    'Venta Perdida': number;
}

const enpointPrincipalServer = import.meta.env.VITE_API_URL_GENERAL;

const MetricsChart = () => {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchData = async (date: Date) => {
        try {
            setLoading(true);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const formatDate = (date: Date): string => date.toISOString().split('T')[0];

            const [leadsRes, inscritosRes, matriculadosRes, ventaPerdidaRes] = await Promise.all([
                fetch(`${enpointPrincipalServer}/count?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`),
                fetch(`${enpointPrincipalServer}/inscrito-count?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`),
                fetch(`${enpointPrincipalServer}/matriculados-count?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`),
                fetch(`${enpointPrincipalServer}/ventaperdida-count?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`)
            ]);

            const leads: LeadsResponse = await leadsRes.json();
            const inscritos: MetricsResponse = await inscritosRes.json();
            const matriculados: MetricsResponse = await matriculadosRes.json();
            const ventaPerdida: MetricsResponse = await ventaPerdidaRes.json();

            const monthName = startDate.toLocaleDateString('es-ES', { month: 'long' });

            const transformedData: ChartDataPoint[] = [{
                name: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${startDate.getFullYear()}`,
                Leads: leads.dates.totalConversations,
                Inscritos: inscritos.totalConversations,
                Matriculados: matriculados.totalConversations,
                'Venta Perdida': ventaPerdida.totalConversations
            }];

            setData(transformedData);
            setLoading(false);
        } catch (err) {
            console.error('Error detallado:', err);
            setError(`Error al cargar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
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
        return <div className="loading-state">Cargando...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    return (
        <div className="metrics-container">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Métricas Mensuales</h2>
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
            <div className="dashboard__manager-chart">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={100}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: number) => [value.toLocaleString(), '']}
                            labelFormatter={(label) => `Mes: ${label}`}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: 'none',
                                borderRadius: '0.375rem',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="Leads"
                            stackId="a"
                            fill="#8884d8"
                            name="Leads"
                        />
                        <Bar
                            dataKey="Inscritos"
                            stackId="a"
                            fill="#82ca9d"
                            name="Inscritos"
                        />
                        <Bar
                            dataKey="Matriculados"
                            stackId="a"
                            fill="#ffc658"
                            name="Matriculados"
                        />
                        <Bar
                            dataKey="Venta Perdida"
                            stackId="a"
                            fill="#ff7300"
                            name="Venta Perdida"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsChart;