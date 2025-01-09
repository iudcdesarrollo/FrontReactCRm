import React, { useState, useEffect } from 'react';
import CampaignTable from './CampaignTable';

interface MenuClickEvent extends CustomEvent {
    detail: {
        section: string;
    };
}

const MainContent: React.FC = () => {
    const [activeSection, setActiveSection] = useState('Dashboard');

    useEffect(() => {
        const handleMenuClick = (e: MenuClickEvent) => {
            setActiveSection(e.detail.section);
        };

        window.addEventListener('menuClick', handleMenuClick as EventListener);
        return () => window.removeEventListener('menuClick', handleMenuClick as EventListener);
    }, []);

    return (
        <div className="flex-1 overflow-auto bg-[#1a1f2b]">
            {activeSection === 'Campaigns' ? (
                <CampaignTable />
            ) : (
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-semibold text-gray-800">{activeSection}</h2>
                    <p className="mt-2 text-gray-600">Contenido de {activeSection}</p>
                </div>
            )}
        </div>
    );
};

export default MainContent;