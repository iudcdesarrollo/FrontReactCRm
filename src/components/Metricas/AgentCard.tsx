import {
    User
} from 'lucide-react';

export const AgentCard: React.FC<{ name: string; onClick: () => void }> = ({ name, onClick }) => (
    <div
        className="metric-card group cursor-pointer hover:bg-gray-800 transition-all duration-200"
        onClick={onClick}
    >
        <div className="metric-content">
            <div className="metric-icon" style={{ backgroundColor: '#4F46E5' }}>
                <User size={24} />
            </div>
            <div className="metric-info">
                <h3 className="text-gray-400">Agente</h3>
                <div className="metric-value">{name}</div>
            </div>
        </div>
    </div>
);