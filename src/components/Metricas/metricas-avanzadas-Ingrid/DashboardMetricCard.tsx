import React, { useState } from 'react';

interface DashboardMetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    className?: string;
    isLoading?: boolean;
    onStartDateSelect?: (date: Date) => void;
    onEndDateSelect?: (date: Date) => void;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
    title,
    value,
    subtitle,
    className = '',
    isLoading = false,
    onStartDateSelect,
    onEndDateSelect
}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

    const toggleCalendar = () => {
        setShowCalendar(!showCalendar);
    };

    const handleStartDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(event.target.value);
        setSelectedStartDate(newDate);

        if (onStartDateSelect) {
            onStartDateSelect(newDate);
        }
    };

    const handleEndDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(event.target.value);
        setSelectedEndDate(newDate);

        if (onEndDateSelect) {
            onEndDateSelect(newDate);
        }
    };

    return (
        <div className={`dashboard__metric relative ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`dashboard__metric-title ${isLoading ? 'skeleton-text' : ''}`}>
                        {title}
                    </h3>
                    <p className={`dashboard__metric-value ${isLoading ? 'skeleton-text' : ''}`}>
                        {value}
                    </p>
                    {!selectedStartDate && !selectedEndDate && subtitle && (
                        <p className={`dashboard__metric-subtitle ${isLoading ? 'skeleton-text' : ''}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={toggleCalendar}
                        className="dashboard__calendar-button p-2 border rounded hover:bg-gray-100"
                    >
                        📅
                    </button>
                    {showCalendar && (
                        <div className="dashboard__calendar absolute right-0 mt-2 p-4 border rounded shadow-lg z-10">
                            <div className="mb-2">
                                <label className="block text-sm mb-1">Dia inicio:</label>
                                <input
                                    type="date"
                                    onChange={handleStartDateSelect}
                                    className="dashboard__calendar-input border p-1 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1"> Dia Final:</label>
                                <input
                                    type="date"
                                    onChange={handleEndDateSelect}
                                    className="dashboard__calendar-input border p-1 rounded w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};