import React from 'react';

interface DashboardMetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    className?: string;
    isLoading?: boolean;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
    title,
    value,
    subtitle,
    className = '',
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