import { DashboardMetricCard } from "../DashboardMetricCard"

interface MetricsCardsProps {
    isLoading: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ isLoading }) => {
    return (
        <div className="dashboard__metrics-grid">
            <DashboardMetricCard
                title="Texto"
                value="$64.7M"
                subtitle="Texto"
                className="dashboard__metric--revenue"
                isLoading={isLoading}
            />
            <DashboardMetricCard
                title="Texto"
                value="$34.0M"
                subtitle="Texto"
                className="dashboard__metric--profit"
                isLoading={isLoading}
            />
            <DashboardMetricCard
                title="Texto"
                value="$33.7M"
                subtitle="Texto"
                className="dashboard__metric--cost"
                isLoading={isLoading}
            />
            <DashboardMetricCard
                title="Texto"
                value="85%"
                subtitle="Texto"
                className="dashboard__metric--sales"
                isLoading={isLoading}
            />
        </div>
    )
}