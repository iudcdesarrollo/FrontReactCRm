import React, { useState, useEffect } from 'react';
import '../css/Agentes/LeadSidebar.css';
import { Lead, LeadSidebarData } from './types';

interface LeadSidebarProps {
    lead: LeadSidebarData;
    onUpdate: (updatedData: Partial<Lead>) => void;
}

const LeadSidebar: React.FC<LeadSidebarProps> = ({ lead, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [nombre, setNombre] = useState(lead.nombre);
    const [selectedGestion, setSelectedGestion] = useState<string>(lead.TipoGestion);
    const [isUpdating, setIsUpdating] = useState(false);
    const [programaMeta, setProgramaMeta] = useState<string>('');

    const tiposGestion = [
        'sin gestionar',
        'conversacion',
        'depuracion',
        'llamada',
        'segunda llamada',
        'inscrito',
        'venta perdida',
        'revision',
        'duplicado',
        'estudiante'
    ];

    useEffect(() => {
        const obtenerProgramaMeta = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/getProgram/${lead.numeroWhatsapp}`);
                if (!response.ok) {
                    throw new Error('Error al obtener el programa de Meta');
                }

                const data = await response.json();
                setProgramaMeta(data.programa);
            } catch (error) {
                console.error('Error al obtener el programa:', error);
            }
        };

        obtenerProgramaMeta();
    }, [lead.numeroWhatsapp]);

    const formatTipoGestion = (tipo: string) =>
        tipo.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const updateTipoGestion = async (tipoGestion: string) => {
        try {
            setIsUpdating(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/UpdateTipoGestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    numero_cliente: lead.numeroWhatsapp,
                    tipo_gestion: tipoGestion.toLowerCase()
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar tipo de gestión');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEditClick = () => setIsEditing(true);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNombre(event.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        onUpdate({ nombre });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleBlur();
        }
    };

    const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const tipoGestionSeleccionado = event.target.value;
        setSelectedGestion(tipoGestionSeleccionado);
        onUpdate({ TipoGestion: tipoGestionSeleccionado });
        await updateTipoGestion(tipoGestionSeleccionado);
    };

    return (
        <div className="lead-sidebar">
            <div className="lead-info">
                <div className="lead-avatar">
                    <div className="w-12 h-12 rounded-md mr-3 overflow-hidden">
                        {lead.profilePictureUrl ? (
                            <img
                                src={lead.profilePictureUrl}
                                alt={lead.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                                ${lead.nombre.charAt(0).toUpperCase()}
                            </div>`;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                {lead.nombre.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={nombre}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="edit-input"
                            autoFocus
                        />
                    ) : (
                        <h2 onClick={handleEditClick}>{nombre}</h2>
                    )}
                    <p>{lead.numeroWhatsapp}</p>
                </div>
            </div>
            <div className="meta-campaign-label">
                <label>Campaña de Meta: {programaMeta || 'Cargando...'}</label>
            </div>
            <div className="conversation-actions">
                <div className="action-item">
                    <label>Tipo de gestión</label>
                    <select
                        value={selectedGestion}
                        onChange={handleSelectChange}
                        disabled={isUpdating}
                    >
                        <option value="">Ninguna</option>
                        {tiposGestion.map((tipo, index) => (
                            <option key={index} value={tipo}>
                                {formatTipoGestion(tipo)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LeadSidebar;