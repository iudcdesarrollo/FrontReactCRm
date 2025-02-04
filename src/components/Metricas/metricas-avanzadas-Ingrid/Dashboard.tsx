import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import '../../../css/metricas/Dashboart.css';
import ColombiaMap from './colombiaMap';

// Types
interface DailySale {
    date: string;
    value: number;
}

interface TopCustomer {
    name: string;
    value: number;
}

interface SalesByCategory {
    name: string;
    value: number;
}

interface AccountManagerData {
    name: string;
    Sarah: number;
    Mike: number;
    Emma: number;
    Personal: number;
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    className: string;
    isLoading?: boolean;
}

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(loadingTimer);
    }, []);

    // Sample data
    const dailySales: DailySale[] = [
        { date: '01/01', value: 150000 },
        { date: '01/02', value: 180000 },
        { date: '01/03', value: 160000 },
        { date: '01/04', value: 190000 },
        { date: '01/05', value: 170000 },
        { date: '01/06', value: 200000 },
        { date: '01/07', value: 185000 },
    ];

    const topCustomers: TopCustomer[] = [
        { name: 'Metro Building', value: 450000 },
        { name: 'Central Hotels', value: 380000 },
        { name: 'Henry Street Coffee', value: 350000 },
        { name: 'Park Mall', value: 320000 },
        { name: 'Grand Central', value: 300000 },
    ];

    const salesByCategory: SalesByCategory[] = [
        { name: 'Retail', value: 35 },
        { name: 'Wholesale', value: 25 },
        { name: 'Online', value: 20 },
        { name: 'B2B', value: 20 },
    ];

    const accountManagerData: AccountManagerData[] = [
        { name: 'Ene', Sarah: 4000, Mike: 2400, Emma: 2400, Personal: 1800 },
        { name: 'Feb', Sarah: 4500, Mike: 2800, Emma: 2800, Personal: 2000 },
        { name: 'Mar', Sarah: 5000, Mike: 3200, Emma: 3000, Personal: 2200 },
        { name: 'Abr', Sarah: 4800, Mike: 3000, Emma: 3200, Personal: 2400 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Metric Card Component
    const MetricCard: React.FC<MetricCardProps> = ({
        title,
        value,
        subtitle,
        className,
        isLoading = false
    }) => (
        <div className={`dashboard__metric ${className}`}>
            <h3 className={`dashboard__metric-title ${isLoading ? 'skeleton-text' : ''}`}>
                {title}
            </h3>
            <p className={`dashboard__metric-value ${isLoading ? 'skeleton-text' : ''}`}>
                {value}
            </p>
            <p className={`dashboard__metric-subtitle ${isLoading ? 'skeleton-text' : ''}`}>
                {subtitle}
            </p>
        </div>
    );

    return (
        <div className="dashboard">
            {/* Metrics Grid */}
            <div className="dashboard__metrics-grid">
                <MetricCard
                    title="Texto"
                    value="$64.7M"
                    subtitle="Texto"
                    className="dashboard__metric--revenue"
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Texto"
                    value="$34.0M"
                    subtitle="Texto"
                    className="dashboard__metric--profit"
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Texto"
                    value="$33.7M"
                    subtitle="Texto"
                    className="dashboard__metric--cost"
                    isLoading={isLoading}
                />
                <MetricCard
                    title="Texto"
                    value="85%"
                    subtitle="Texto"
                    className="dashboard__metric--sales"
                    isLoading={isLoading}
                />
            </div>

            {/* Charts Grid */}
            <div className="dashboard__charts-grid">
                <div className="dashboard__chart-container">
                    {!isLoading ? (
                        <div style={{ height: '300px', width: '100%' }}>
                            <ColombiaMap />
                        </div>
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS DIARIAS DE PRODUCTOS
                    </h3>
                    {!isLoading ? (
                        <ResponsiveContainer className="dashboard__sales-chart">
                            <LineChart data={dailySales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    dot={false}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="dashboard__bottom-grid">
                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS POR GESTOR DE CUENTA
                    </h3>
                    {!isLoading ? (
                        <ResponsiveContainer className="dashboard__manager-chart">
                            <BarChart data={accountManagerData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="Sarah" stackId="a" fill="#8884d8" />
                                <Bar dataKey="Mike" stackId="a" fill="#82ca9d" />
                                <Bar dataKey="Emma" stackId="a" fill="#ffc658" />
                                <Bar dataKey="Personal" stackId="a" fill="#ff7300" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        TOP 10 CLIENTES
                    </h3>
                    {!isLoading ? (
                        <ResponsiveContainer className="dashboard__customers-chart">
                            <BarChart layout="vertical" data={topCustomers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Bar
                                    dataKey="value"
                                    fill="#82ca9d"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS POR CATEGORÍA
                    </h3>
                    {!isLoading ? (
                        <ResponsiveContainer className="dashboard__category-chart">
                            <PieChart>
                                <Pie
                                    data={salesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {salesByCategory.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;