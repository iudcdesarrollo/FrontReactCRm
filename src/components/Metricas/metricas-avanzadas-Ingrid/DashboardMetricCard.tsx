import React, { useState, useRef, useEffect } from 'react';

interface DashboardMetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    className?: string;
    isLoading?: boolean;
    onStartDateSelect?: (date: Date) => void;
    onEndDateSelect?: (date: Date) => void;
    customHeaderContent?: React.ReactNode;
    onClick?: () => void;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
    title,
    value,
    subtitle,
    className = '',
    isLoading = false,
    onStartDateSelect,
    onEndDateSelect,
    customHeaderContent,
    onClick
}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowCalendar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleCardClick = () => {
        if (onClick && !showCalendar) {
            onClick();
        }
    };

    return (
        <div
            className={`dashboard__metric relative ${className}`}
            onClick={handleCardClick}
        >
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
                <div className="flex items-center relative" onClick={(e) => e.stopPropagation()}>
                    {customHeaderContent}
                    <button
                        ref={buttonRef}
                        onClick={toggleCalendar}
                        className="dashboard__calendar-button"
                        type="button"
                    >
                        📅
                    </button>
                    {showCalendar && (
                        <div
                            ref={calendarRef}
                            className="dashboard__calendar absolute -right-4 top-full mt-2 p-4 border rounded shadow-lg z-50 w-[calc(100%+8rem)]"
                        >
                            <div className="mb-2">
                                <label className="block text-sm text-gray-700 mb-1">Dia inicio:</label>
                                <input
                                    type="date"
                                    onChange={handleStartDateSelect}
                                    className="border p-1 rounded w-full text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Dia Final:</label>
                                <input
                                    type="date"
                                    onChange={handleEndDateSelect}
                                    className="border p-1 rounded w-full text-gray-700"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};