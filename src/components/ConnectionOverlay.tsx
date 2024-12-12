import React from 'react';
import '../css/Admins/ConnectionOverlay.css';

interface ConnectionOverlayProps {
    isConnected: boolean;
}

const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ isConnected }) => {
    if (isConnected) return null;

    return (
        <div className="connection-overlay">
            <div className="connection-card">
                <div className="spinner-container">
                    <div className="spinner-ring"></div>
                    <div className="spinner-dot"></div>
                </div>
                <h2 className="connection-title">
                    Esperando conexión con el servidor de innovación
                </h2>
                <p className="connection-text">
                    Por favor, espere mientras se establece la conexión...
                </p>
                <div className="pulse-container">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionOverlay;