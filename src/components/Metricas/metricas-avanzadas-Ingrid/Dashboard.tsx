import { useState, useEffect } from 'react';
import '../../../css/metricas/Dashboart.css';
import { HorizontalBarChart } from './graphics/horizontalBarChart';
import { GraphicDonut } from './graphics/donutGraphic';
import { StackedBarChart } from './graphics/stackedBarChart';
import { LineChat } from './graphics/lineChart';
import { MetricsCards } from './graphics/metricsCards';
import MapToggle from './MapToggle';
import ProfesionalesTable from './graphics/MatriculadosTable';
import { Profesional } from './graphics/types';

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<'dashboard' | 'matriculados'>('dashboard');

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(loadingTimer);
    }, []);

    const handleMatriculadosClick = () => {
        setCurrentView('matriculados');
    };

    const handleRowClick = (profesional: Profesional) => {
        console.log('Profesional seleccionado:', profesional);
    };

    if (currentView === 'matriculados') {
        return (
            <div className="dashboard">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Volver
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        <ProfesionalesTable
                            onRowClick={handleRowClick}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <MetricsCards
                isLoading={isLoading}
                onMatriculadosClick={handleMatriculadosClick}
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