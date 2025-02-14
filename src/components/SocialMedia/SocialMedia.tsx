import { useState } from 'react';
import NavigationTabs from "./NavigationTabs";
import FacebookComments from './Faceboook/FacebookComments';

const SocialMedia = () => {
    const [activeTab, setActiveTab] = useState('all');

    const renderContent = () => {
        switch (activeTab) {
            case 'fb-comments':
                return <FacebookComments />;
            case 'all':
                return <p className="p-4 text-gray-600">Vista general de mensajes.</p>;
            case 'messenger':
                return <p className="p-4 text-gray-600">Vista general Messenger.</p>;
            case 'instagram':
                return <p className="p-4 text-gray-600">Mensajes de Instagram</p>;
            case 'ig-comments':
                return <p className="p-4 text-gray-600">Comentarios de Instagram</p>;
            default:
                return <p className="p-4 text-gray-600">Selecciona una pestaña</p>;
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <NavigationTabs onTabChange={handleTabChange} />
            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default SocialMedia;