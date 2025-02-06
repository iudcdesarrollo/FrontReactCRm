import { useState, useEffect } from 'react';
import '../../../css/metricas/Dashboart.css';
import { HorizontalBarChart } from './graphics/horizontalBarChart';
import { GraphicDonut } from './graphics/donutGraphic';
import { StackedBarChart } from './graphics/stackedBarChart';
import { LineChat } from './graphics/lineChart';
import { MetricsCards } from './graphics/metricsCards';
import MapToggle from './MapToggle';
import { startOfMonth, endOfMonth, subMonths, format, parse } from 'date-fns';

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
    const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(loadingTimer);
    }, []);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
        setEndDate(newEndDate);
    };

    return (
        <div className="dashboard">
            <div className="date-range-selector mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="startDate" className="text-sm font-medium">
                            Fecha Inicial:
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={format(startDate, 'yyyy-MM-dd')}
                            onChange={handleStartDateChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                            Fecha Final:
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={format(endDate, 'yyyy-MM-dd')}
                            onChange={handleEndDateChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                </div>
            </div>

            <MetricsCards
                isLoading={isLoading}
            />

            <div className="dashboard__charts-grid">
                <div className="dashboard__chart-container">
                    {!isLoading ? (
                        <MapToggle />
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS DIARIAS DE PRODUCTOS
                    </h3>
                    {!isLoading ? (
                        <LineChat />
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>
            </div>

            <div className="dashboard__bottom-grid">
                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS POR GESTOR DE CUENTA
                    </h3>
                    {!isLoading ? (
                        <StackedBarChart />
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        TOP 10 CLIENTES
                    </h3>
                    {!isLoading ? (
                        <HorizontalBarChart />
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>

                <div className="dashboard__chart-container">
                    <h3 className={`dashboard__chart-title ${isLoading ? 'skeleton-text' : ''}`}>
                        VENTAS POR CATEGORÍA
                    </h3>
                    {!isLoading ? (
                        <GraphicDonut />
                    ) : (
                        <div className="skeleton-box chart-skeleton" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;