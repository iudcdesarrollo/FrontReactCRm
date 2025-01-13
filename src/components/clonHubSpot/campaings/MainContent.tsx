import { useState, useEffect } from 'react';
import CampaignTable from './CampaignTable';

interface MenuClickEvent extends CustomEvent {
    detail: {
        section: string;
    };
}

const MainContent = (): JSX.Element => {
    const [activeSection, setActiveSection] = useState('Dashboard');

    useEffect(() => {
        const handleMenuClick = (e: MenuClickEvent) => {
            setActiveSection(e.detail.section);
        };

        window.addEventListener('menuClick', handleMenuClick as EventListener);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('menuClick', handleMenuClick as EventListener);
        };
    }, []); // Empty dependency array as we don't have any dependencies

    return (
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white min-w-0">
            {activeSection === 'Campaigns' ? (
                <div className="flex-1 overflow-hidden">
                    <CampaignTable />
                </div>
            ) : (
                <div className="flex-1 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-semibold text-gray-800">{activeSection}</h2>
                    <p className="mt-2 text-gray-600">Contenido de {activeSection}</p>
                </div>
            )}
        </div>
    );
};

export default MainContent;