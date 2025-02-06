import { useState, useEffect } from 'react';
import '../../../css/metricas/Dashboart.css';
import { HorizontalBarChart } from './graphics/horizontalBarChart';
import { GraphicDonut } from './graphics/donutGraphic';
import { StackedBarChart } from './graphics/stackedBarChart';
import { LineChat } from './graphics/lineChart';
import { MetricsCards } from './graphics/metricsCards';
import MapToggle from './MapToggle';

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(loadingTimer);
    }, []);

    return (
        <div className="dashboard">

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