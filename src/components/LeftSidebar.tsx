import React from 'react';
import {
    Home,
    Settings,
    LogOut,
    BarChart,
    Kanban
} from 'lucide-react';
import '../css/Admins/LeftSidebar.css';

interface LeftSidebarProps {
    role: 'admin' | 'agent';
    handleLogout: () => void;
    toggleSettings: () => void;
    onSelectHome: () => void;
    onSelectMetrics: () => void;
    onSelectKanban?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
    role,
    handleLogout,
    toggleSettings,
    onSelectHome,
    onSelectMetrics,
    onSelectKanban
}) => {
    return (
        <div className="left-sidebar">
            <div className="icons">
                <div className="icon">
                    <div className="avatar">U</div>
                </div>

                <div className="icon" onClick={onSelectHome}>
                    <Home size={24} />
                </div>

                <div className="icon" onClick={onSelectKanban}>
                    <Kanban size={24} />
                </div>

                {role === 'admin' && (
                    <>
                        <div className="icon" onClick={onSelectMetrics}>
                            <BarChart size={24} />
                        </div>

                        <div className="icon" onClick={toggleSettings}>
                            <Settings size={24} />
                        </div>
                    </>
                )}

                <div className="icon" onClick={handleLogout}>
                    <LogOut size={24} />
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;