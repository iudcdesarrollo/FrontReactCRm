import React, { useState } from 'react';
import './css/NavigationTabs.css';

interface Tab {
    id: string;
    label: string;
    notifications?: number;
    isNew?: boolean;
}

interface NavigationTabsProps {
    onTabChange?: (tabId: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState('all');

    const tabs: Tab[] = [
        { id: 'all', label: 'Todos los mensajes', notifications: 15 },
        { id: 'messenger', label: 'Messenger', notifications: 5 },
        { id: 'instagram', label: 'Instagram', notifications: 3 },
        { id: 'fb-comments', label: 'Comentarios de Facebook', notifications: 12 },
        { id: 'ig-comments', label: 'Comentarios de Instagram', notifications: 0 },
    ];

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    return (
        <nav className="navigation-tabs">
            <ul className="tabs-list">
                {tabs.map((tab) => (
                    <li
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        <span className="tab-label">{tab.label}</span>
                        {tab.notifications !== undefined && tab.notifications > 0 && (
                            <span className="notification-badge">
                                {tab.notifications}
                            </span>
                        )}
                        {tab.isNew && (
                            <span className="new-badge">
                                Nuevo
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavigationTabs;