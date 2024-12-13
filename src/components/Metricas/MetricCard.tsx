import { MetricData } from './types/types.ts'

export const MetricCard: React.FC<MetricData & { onClick: () => void }> = ({
    title,
    value,
    change,
    icon,
    color,
    onClick
}) => (
    <div
        className="metric-card group cursor-pointer hover:bg-gray-800 transition-all duration-200"
        onClick={onClick}
    >
        <div className="metric-content">
            <div className="metric-icon" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="metric-info">
                <h3>{title}</h3>
                <div className="metric-value">{value}</div>
                <div className="metric-change">{change}</div>
            </div>
        </div>
    </div>
);