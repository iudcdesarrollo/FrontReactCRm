import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import AddTemplateForm from './AddTemplateForm';
import TemplateCard from './TemplateCard';
import { MessageSquare, User } from 'lucide-react';
import '../../css/Admins/Settings.css'

interface SettingsProps {
    socket: Socket | null;
    isOpen: boolean;
    onClose: () => void;
}

type SettingSection = 'templates' | 'profile' | null;
type TemplateView = 'list' | 'form' | null;

const Settings: React.FC<SettingsProps> = ({ socket, isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState<SettingSection>(null);
    const [templateView, setTemplateView] = useState<TemplateView>(null);

    if (!isOpen) return null;

    const handleTemplateClick = () => {
        setActiveSection('templates');
        setTemplateView(null);
    };

    const handleSectionClose = () => {
        setActiveSection(null);
        setTemplateView(null);
    };

    const renderSectionContent = () => {
        if (activeSection === 'templates') {
            if (templateView === 'form') {
                return (
                    <AddTemplateForm
                        socket={socket}
                        isOpen={true}
                        onClose={() => setTemplateView('list')}
                    />
                );
            }
            return (
                <div className="templates-preview">
                    <h3>Template Management</h3>
                    <div className="templates-buttons">
                        <button
                            onClick={() => setTemplateView('form')}
                            className="add-template-btn"
                        >
                            Agregar template
                        </button>
                        <button
                            onClick={() => setTemplateView('list')}
                            className="view-template-btn"
                        >
                            Ver templates
                        </button>
                    </div>
                    {templateView === 'list' && <TemplateCard socket={socket} />}
                </div>
            );
        }

        if (activeSection === 'profile') {
            return (
                <div className="profile-section">
                    <h3>Profile Settings</h3>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    {activeSection ? (
                        <div className="header-with-back">
                            <button onClick={handleSectionClose} className="back-button">
                                ←
                            </button>
                            <h2>{activeSection?.charAt(0).toUpperCase() + activeSection?.slice(1)}</h2>
                        </div>
                    ) : (
                        <h2>Settings</h2>
                    )}
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                {!activeSection ? (
                    <div className="settings-sections">
                        <div className="settings-section" onClick={handleTemplateClick}>
                            <MessageSquare className="settings-icon" size={24} />
                            <h3>Templates</h3>
                        </div>
                        <div className="settings-section" onClick={() => setActiveSection('profile')}>
                            <User className="settings-icon" size={24} />
                            <h3>Profile</h3>
                        </div>
                    </div>
                ) : (
                    <div className="settings-content">
                        {renderSectionContent()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;