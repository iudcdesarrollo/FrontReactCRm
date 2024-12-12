import React from 'react';
import '../css/Admins/LeftSidebar.css';
import { Home, UserCheck, MessageCircle, File, Settings, HelpCircle, LogOut, BarChart } from 'lucide-react';

interface LeftSidebarProps {
    handleLogout: () => void;
    toggleSettings: () => void;
    onSelectHome: () => void;
    onSelectMetrics: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ handleLogout, toggleSettings, onSelectHome, onSelectMetrics }) => {
    return (
        <div className="left-sidebar">
            <div className="icons">
                {/* Avatar */}
                <div className="icon">
                    <div className="avatar">U</div>
                </div>

                {/* Home Icon */}
                <div className="icon" onClick={onSelectHome}>
                    <Home size={24} />
                </div>

                {/* User Check Icon */}
                {/* <div className="icon">
                    <UserCheck size={24} />
                </div> */}

                {/* Message Icon */}
                {/* <div className="icon">
                    <MessageCircle size={24} />
                </div> */}

                {/* Metrics Icon */}
                <div className="icon" onClick={onSelectMetrics}>
                    <BarChart size={24} />
                </div>

                {/* File Icon */}
                {/* <div className="icon">
                    <File size={24} />
                </div> */}

                {/* Settings Icon */}
                <div className="icon" onClick={toggleSettings}>
                    <Settings size={24} />
                </div>

                {/* Help Icon */}
                {/* <div className="icon">
                    <HelpCircle size={24} />
                </div> */}

                {/* Logout Icon */}
                <div className="icon" onClick={handleLogout}>
                    <LogOut size={24} />
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;