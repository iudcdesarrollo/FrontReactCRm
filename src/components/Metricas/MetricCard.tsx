import { MetricData } from './types/types.ts'
import '../../css/Admins/MetricCard.css'

export const MetricCard: React.FC<MetricData & { onClick: () => void }> = ({
    title,
    value,
    change,
    icon,
    color,
    onClick
}) => (
    <div
        className="analytics-card group cursor-pointer hover:bg-gray-800 transition-all duration-200"
        onClick={onClick}
    >
        <div className="analytics-content">
            <div className="analytics-icon" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="analytics-info">
                <h3>{title}</h3>
                <div className="analytics-value">{value}</div>
                <div className="analytics-change">{change}</div>
            </div>
        </div>
    </div>
);